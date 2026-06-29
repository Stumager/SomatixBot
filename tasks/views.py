import json
from urllib.parse import parse_qsl

from django.conf import settings
from django.contrib.auth.models import User
from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
import logging

from .auth_telegram import verify_telegram_data
from .models import Category, Task, UserProfile
from .serializers import CategorySerializer, TaskSerializer

logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([AllowAny])
def telegram_auth_view(request):
    try:
        init_data = request.data.get("initData") or request.data.get("InitData")
        if not isinstance(init_data, str) or not init_data.strip():
            return Response(
                {"detail": "Telegram initData не передан."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        bot_token = getattr(settings, "BOT_TOKEN", "")
        if not bot_token:
            logger.error("BOT_TOKEN is not configured in settings; telegram auth unavailable")
            return Response(
                {"detail": "Telegram авторизация не настроена на сервере."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        max_age_seconds = getattr(settings, "TELEGRAM_AUTH_MAX_AGE_SECONDS", 86400)
        if not verify_telegram_data(bot_token, init_data, max_age_seconds=max_age_seconds):
            return Response(
                {"detail": "Некорректные или устаревшие данные Telegram."},
                status=status.HTTP_403_FORBIDDEN,
            )

        data_dict = dict(parse_qsl(init_data))
        user_payload = data_dict.get("user")
        if not user_payload:
            return Response(
                {"detail": "В initData отсутствует пользователь Telegram."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_data = json.loads(user_payload)
        except json.JSONDecodeError:
            return Response(
                {"detail": "Некорректный JSON пользователя Telegram."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        tg_id = user_data.get("id")
        if not tg_id:
            return Response(
                {"detail": "В данных Telegram отсутствует id пользователя."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        first_name = user_data.get("first_name", "")
        last_name = user_data.get("last_name", "")

        user, created = User.objects.get_or_create(
            username=f"tg_{tg_id}",
            defaults={"first_name": first_name, "last_name": last_name},
        )

        fields_to_update = []
        if user.first_name != first_name:
            user.first_name = first_name
            fields_to_update.append("first_name")
        if user.last_name != last_name:
            user.last_name = last_name
            fields_to_update.append("last_name")
        if fields_to_update:
            user.save(update_fields=fields_to_update)

        profile, _ = UserProfile.objects.get_or_create(user=user)
        if profile.telegram_id != str(tg_id):
            profile.telegram_id = str(tg_id)
            profile.save(update_fields=["telegram_id"])

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "is_new": created,
            }
        )
    except Exception as exc:  # pragma: no cover - safety net for unexpected errors
        logger.exception("Unhandled error in telegram_auth_view")
        return Response({"detail": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TaskListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
        DjangoFilterBackend,
    ]
    search_fields = ["name"]
    ordering_fields = ["date", "name", "done"]
    ordering = ("-date",)

    def get_queryset(self):
        return (
            Task.objects.filter(user=self.request.user)
            .select_related("category")
        )

    def perform_create(self, serializer):
        category = serializer.validated_data.get("category")
        category_name = self.request.data.get("category_name")

        if not category and isinstance(category_name, str) and category_name.strip():
            clean_name = category_name.strip()
            category = Category.objects.filter(
                user=self.request.user,
                name__iexact=clean_name,
            ).first()
            if category is None:
                category = Category.objects.create(user=self.request.user, name=clean_name)

        serializer.save(user=self.request.user, category=category)


class TaskDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Task.objects.filter(user=self.request.user)
            .select_related("category")
        )


class CategoryListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user).order_by("name")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CategoryDetailAPIView(generics.RetrieveDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)


def frontend_index(request):
    return render(request, "dist/index.html")
