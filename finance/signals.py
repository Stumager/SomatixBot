from django.db import transaction
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import Transaction


def _apply_balance_delta(account, transaction_type, amount, reverse=False):
    """Изменить баланс счёта в зависимости от типа операции."""
    from decimal import Decimal
    delta = Decimal(str(amount))
    if transaction_type == 'income':
        delta = -delta if reverse else delta
    elif transaction_type == 'expense':
        delta = delta if reverse else -delta
    # transfer обрабатывается отдельно
    account.balance += delta
    account.save(update_fields=['balance', 'updated_at'])


def _recalculate_for_transaction(instance, reverse=False):
    """Применить или откатить влияние транзакции на балансы счетов."""
    t = instance
    if t.transaction_type == 'transfer':
        # источник теряет деньги
        src_delta = t.amount if reverse else -t.amount
        t.account.balance += src_delta
        t.account.save(update_fields=['balance', 'updated_at'])
        # получатель получает деньги
        if t.transfer_to_account:
            dst_delta = -t.amount if reverse else t.amount
            t.transfer_to_account.balance += dst_delta
            t.transfer_to_account.save(update_fields=['balance', 'updated_at'])
    else:
        _apply_balance_delta(t.account, t.transaction_type, t.amount, reverse=reverse)


@receiver(post_save, sender=Transaction)
def transaction_post_save(sender, instance, created, **kwargs):
    if created:
        _recalculate_for_transaction(instance, reverse=False)
    else:
        # При изменении: откатываем старое значение через _old и применяем новое.
        # _old устанавливается во вьюхе/сериализаторе перед сохранением (если есть).
        old = getattr(instance, '_old', None)
        if old:
            _recalculate_for_transaction(old, reverse=True)
        _recalculate_for_transaction(instance, reverse=False)


@receiver(post_delete, sender=Transaction)
def transaction_post_delete(sender, instance, **kwargs):
    _recalculate_for_transaction(instance, reverse=True)
