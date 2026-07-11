from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Account(models.Model):
    ACCOUNT_TYPE_CHOICES = [
        ('card', 'Карта'),
        ('cash', 'Наличные'),
        ('savings', 'Накопительный'),
        ('other', 'Другое'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='accounts')
    name = models.CharField(max_length=50)
    account_type = models.CharField(max_length=10, choices=ACCOUNT_TYPE_CHOICES)
    currency = models.CharField(max_length=3, default='RUB')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.currency})"


class Category(models.Model):
    CATEGORY_TYPE_CHOICES = [
        ('income', 'Доход'),
        ('expense', 'Расход'),
    ]

    # null = системная категория, доступна всем
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='finance_categories',
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=50)
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subcategories',
    )
    category_type = models.CharField(max_length=10, choices=CATEGORY_TYPE_CHOICES)
    icon = models.CharField(max_length=10, null=True, blank=True)
    color = models.CharField(max_length=7, null=True, blank=True)
    is_archived = models.BooleanField(default=False)

    class Meta:
        ordering = ['category_type', 'name']

    def __str__(self):
        return self.name


class Transaction(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ('income', 'Доход'),
        ('expense', 'Расход'),
        ('transfer', 'Перевод'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transactions')
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions',
    )
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    # всегда положительное; знак определяется transaction_type
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transfer_to_account = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='incoming_transfers',
    )
    note = models.CharField(max_length=200, blank=True)
    date = models.DateField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def clean(self):
        if self.amount is not None and self.amount <= 0:
            raise ValidationError({'amount': 'Сумма должна быть положительной.'})

        if self.transaction_type == 'transfer':
            if self.category_id is not None:
                raise ValidationError({'category': 'При переводе категория должна быть пустой.'})
            if not self.transfer_to_account_id:
                raise ValidationError({'transfer_to_account': 'Укажите счёт назначения для перевода.'})
            if self.transfer_to_account_id == self.account_id:
                raise ValidationError({'transfer_to_account': 'Счёт назначения должен отличаться от счёта-источника.'})
        else:
            if self.category and self.category.category_type != self.transaction_type:
                raise ValidationError({
                    'category': f'Тип категории должен совпадать с типом операции ({self.transaction_type}).',
                })

    def __str__(self):
        return f"{self.get_transaction_type_display()} {self.amount} ({self.date})"
