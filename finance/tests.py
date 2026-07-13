from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Account, Category, Transaction

User = get_user_model()


class BalanceSignalTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='pass')
        self.account = Account.objects.create(
            user=self.user, name='Карта', account_type='card', balance=Decimal('1000.00')
        )
        self.income_cat = Category.objects.create(
            user=self.user, name='Зарплата', category_type='income'
        )
        self.expense_cat = Category.objects.create(
            user=self.user, name='Еда', category_type='expense'
        )

    def test_income_increases_balance(self):
        Transaction.objects.create(
            user=self.user, account=self.account,
            category=self.income_cat, transaction_type='income',
            amount=Decimal('500.00'), date=date.today(),
        )
        self.account.refresh_from_db()
        self.assertEqual(self.account.balance, Decimal('1500.00'))

    def test_expense_decreases_balance(self):
        Transaction.objects.create(
            user=self.user, account=self.account,
            category=self.expense_cat, transaction_type='expense',
            amount=Decimal('200.00'), date=date.today(),
        )
        self.account.refresh_from_db()
        self.assertEqual(self.account.balance, Decimal('800.00'))

    def test_delete_reverses_balance(self):
        tx = Transaction.objects.create(
            user=self.user, account=self.account,
            category=self.expense_cat, transaction_type='expense',
            amount=Decimal('200.00'), date=date.today(),
        )
        self.account.refresh_from_db()
        self.assertEqual(self.account.balance, Decimal('800.00'))
        tx.delete()
        self.account.refresh_from_db()
        self.assertEqual(self.account.balance, Decimal('1000.00'))

    def test_transfer_updates_both_accounts(self):
        target = Account.objects.create(
            user=self.user, name='Наличные', account_type='cash', balance=Decimal('0.00')
        )
        Transaction.objects.create(
            user=self.user, account=self.account,
            transaction_type='transfer', amount=Decimal('300.00'),
            transfer_to_account=target, date=date.today(),
        )
        self.account.refresh_from_db()
        target.refresh_from_db()
        self.assertEqual(self.account.balance, Decimal('700.00'))
        self.assertEqual(target.balance, Decimal('300.00'))


class ValidationTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='v_user', password='pass')
        self.account = Account.objects.create(
            user=self.user, name='Счёт', account_type='card', balance=Decimal('500.00')
        )
        self.expense_cat = Category.objects.create(
            user=self.user, name='Еда', category_type='expense'
        )

    def test_income_with_expense_category_raises(self):
        from django.core.exceptions import ValidationError
        tx = Transaction(
            user=self.user, account=self.account,
            category=self.expense_cat, transaction_type='income',
            amount=Decimal('100.00'), date=date.today(),
        )
        with self.assertRaises(ValidationError):
            tx.clean()

    def test_transfer_without_target_raises(self):
        from django.core.exceptions import ValidationError
        tx = Transaction(
            user=self.user, account=self.account,
            transaction_type='transfer', amount=Decimal('100.00'),
            date=date.today(),
        )
        with self.assertRaises(ValidationError):
            tx.clean()

    def test_transfer_same_account_raises(self):
        from django.core.exceptions import ValidationError
        tx = Transaction(
            user=self.user, account=self.account,
            transaction_type='transfer', amount=Decimal('100.00'),
            transfer_to_account=self.account, date=date.today(),
        )
        with self.assertRaises(ValidationError):
            tx.clean()


class PermissionsTest(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='pass')
        self.user2 = User.objects.create_user(username='user2', password='pass')
        self.account1 = Account.objects.create(
            user=self.user1, name='Счёт 1', account_type='card'
        )
        self.account2 = Account.objects.create(
            user=self.user2, name='Счёт 2', account_type='card'
        )
        cat = Category.objects.create(user=self.user1, name='Прочее', category_type='income')
        Transaction.objects.create(
            user=self.user1, account=self.account1,
            category=cat, transaction_type='income',
            amount=Decimal('100.00'), date=date.today(),
        )
        self.client = APIClient()

    def _get_token(self, username):
        from rest_framework_simplejwt.tokens import RefreshToken
        user = User.objects.get(username=username)
        return str(RefreshToken.for_user(user).access_token)

    def test_user_sees_only_own_transactions(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self._get_token("user2")}')
        resp = self.client.get('/api/finance/transactions/')
        self.assertEqual(resp.status_code, 200)
        results = resp.json().get('results', [])
        self.assertEqual(len(results), 0)

    def test_user_sees_own_transactions(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self._get_token("user1")}')
        resp = self.client.get('/api/finance/transactions/')
        self.assertEqual(resp.status_code, 200)
        results = resp.json().get('results', [])
        self.assertEqual(len(results), 1)
