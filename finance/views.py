from datetime import date
from decimal import Decimal

from django.db.models import Q, Sum
from django.db.models.functions import TruncMonth
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Account, Category, Transaction
from .serializers import AccountSerializer, CategorySerializer, TransactionSerializer


class FinancePagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200


class AccountViewSet(viewsets.ModelViewSet):
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        show_archived = self.request.query_params.get('archived', '').lower() == 'true'
        qs = Account.objects.filter(user=self.request.user)
        if not show_archived:
            qs = qs.filter(is_archived=False)
        return qs

    def destroy(self, request, *args, **kwargs):
        return Response(
            {'detail': 'Удаление счёта запрещено. Используйте архивацию: POST /accounts/{id}/archive/'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        account = self.get_object()
        account.is_archived = True
        account.save(update_fields=['is_archived', 'updated_at'])
        return Response(AccountSerializer(account).data)


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(
            Q(user=self.request.user) | Q(user__isnull=True),
            is_archived=False,
        ).prefetch_related('subcategories')

    def _check_not_system(self, instance):
        if instance.user_id is None:
            self.permission_denied(
                self.request,
                message='Системные категории нельзя изменять или удалять.',
            )

    def update(self, request, *args, **kwargs):
        self._check_not_system(self.get_object())
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        self._check_not_system(self.get_object())
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self._check_not_system(instance)
        # архивация вместо удаления — транзакции ссылаются на категорию
        instance.is_archived = True
        instance.save(update_fields=['is_archived'])
        return Response(status=status.HTTP_204_NO_CONTENT)


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = FinancePagination

    def get_queryset(self):
        qs = Transaction.objects.filter(user=self.request.user).select_related(
            'account', 'category', 'transfer_to_account'
        )
        params = self.request.query_params

        account_id = params.get('account')
        if account_id:
            qs = qs.filter(account_id=account_id)

        category_id = params.get('category')
        if category_id:
            qs = qs.filter(category_id=category_id)

        tx_type = params.get('type')
        if tx_type:
            qs = qs.filter(transaction_type=tx_type)

        date_from = params.get('date_from')
        if date_from:
            qs = qs.filter(date__gte=date_from)

        date_to = params.get('date_to')
        if date_to:
            qs = qs.filter(date__lte=date_to)

        return qs.order_by('-date', '-created_at')

    def perform_update(self, serializer):
        # Снимок старого состояния для корректного пересчёта баланса в сигнале
        old = Transaction.objects.get(pk=serializer.instance.pk)
        serializer.instance._old = old
        serializer.save()


class SummaryView(APIView):
    """GET /api/finance/summary/?period=month&date=2026-07"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', 'month')
        date_param = request.query_params.get('date')

        qs = Transaction.objects.filter(user=request.user)

        if period == 'month' and date_param:
            try:
                year, month = map(int, date_param.split('-'))
            except (ValueError, AttributeError):
                return Response({'detail': 'Неверный формат даты. Ожидается YYYY-MM.'}, status=400)
            qs = qs.filter(date__year=year, date__month=month)
        elif period == 'year' and date_param:
            try:
                year = int(date_param)
            except ValueError:
                return Response({'detail': 'Неверный формат года.'}, status=400)
            qs = qs.filter(date__year=year)

        totals = qs.filter(transaction_type__in=['income', 'expense']).values('transaction_type').annotate(
            total=Sum('amount')
        )
        total_income = Decimal('0')
        total_expense = Decimal('0')
        for row in totals:
            if row['transaction_type'] == 'income':
                total_income = row['total'] or Decimal('0')
            else:
                total_expense = row['total'] or Decimal('0')

        by_category = list(
            qs.filter(transaction_type='expense', category__isnull=False)
            .values('category_id', 'category__name', 'category__icon', 'category__color')
            .annotate(amount=Sum('amount'))
            .order_by('-amount')
        )
        by_category_out = [
            {
                'category_id': row['category_id'],
                'name': row['category__name'],
                'icon': row['category__icon'],
                'color': row['category__color'],
                'amount': str(row['amount']),
            }
            for row in by_category
        ]

        by_account = [
            {
                'account_id': acc.pk,
                'name': acc.name,
                'balance': str(acc.balance),
            }
            for acc in Account.objects.filter(user=request.user, is_archived=False)
        ]

        return Response({
            'total_income': str(total_income),
            'total_expense': str(total_expense),
            'by_category': by_category_out,
            'by_account': by_account,
        })


class TrendView(APIView):
    """GET /api/finance/trend/?months=6"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            months = max(1, min(int(request.query_params.get('months', 6)), 24))
        except ValueError:
            return Response({'detail': 'Параметр months должен быть числом.'}, status=400)

        from dateutil.relativedelta import relativedelta
        today = date.today()
        start = (today.replace(day=1) - relativedelta(months=months - 1))

        rows = (
            Transaction.objects.filter(
                user=request.user,
                transaction_type__in=['income', 'expense'],
                date__gte=start,
            )
            .annotate(month=TruncMonth('date'))
            .values('month', 'transaction_type')
            .annotate(total=Sum('amount'))
            .order_by('month')
        )

        # Собираем по месяцам
        data: dict[str, dict] = {}
        for row in rows:
            key = row['month'].strftime('%Y-%m')
            if key not in data:
                data[key] = {'month': key, 'income': '0.00', 'expense': '0.00'}
            data[key][row['transaction_type']] = str(row['total'])

        # Заполняем пустые месяцы нулями
        result = []
        for i in range(months):
            m = (today.replace(day=1) - relativedelta(months=months - 1 - i))
            key = m.strftime('%Y-%m')
            result.append(data.get(key, {'month': key, 'income': '0.00', 'expense': '0.00'}))

        return Response(result)
