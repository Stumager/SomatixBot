import logging
import os
import tempfile

import requests
from django.conf import settings
from apscheduler.schedulers.background import BackgroundScheduler
from django.utils import timezone
from datetime import timedelta
from .models import Task

logger = logging.getLogger(__name__)

_lock_file_handle = None


def acquire_scheduler_lock():
    """Ensure only one process (e.g. one gunicorn worker) runs the scheduler."""
    global _lock_file_handle
    try:
        import fcntl
    except ImportError:
        # Not on Linux (e.g. local Windows dev) — just allow it.
        return True

    lock_path = os.path.join(tempfile.gettempdir(), 'tasktracker_scheduler.lock')
    handle = open(lock_path, 'w')
    try:
        fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        handle.close()
        return False

    _lock_file_handle = handle  # keep reference so the lock isn't released
    return True


def send_telegram_message(user_id, text):
    bot_token = settings.BOT_TOKEN
    if not bot_token:
        logger.warning("BOT_TOKEN not configured, skipping notification")
        return
    url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    payload = {
        'chat_id': user_id,
        'text': text,
        'parse_mode': 'HTML',
    }
    try:
        resp = requests.post(url, json=payload, timeout=10)
        if not resp.ok:
            logger.error("Telegram API error %s: %s", resp.status_code, resp.text)
    except Exception:
        logger.exception("Failed to send Telegram message to %s", user_id)


def check_and_send_notification():
    now = timezone.now()

    one_hour_later = now + timedelta(hours=1)
    tasks_1h = Task.objects.filter(
        date__gt=now,
        date__lte=one_hour_later,
        notification_1h_left=False,
        done=False,
    ).select_related('user__profile')

    ids_1h = []
    for task in tasks_1h:
        profile = getattr(task.user, 'profile', None)
        if profile and profile.telegram_id:
            send_telegram_message(profile.telegram_id, f"Задача через час: <b>{task.name}</b>")
            ids_1h.append(task.pk)

    if ids_1h:
        Task.objects.filter(pk__in=ids_1h).update(notification_1h_left=True)

    tasks_due = Task.objects.filter(
        date__lte=now,
        notification_due_left=False,
        done=False,
    ).select_related('user__profile')

    ids_due = []
    for task in tasks_due:
        profile = getattr(task.user, 'profile', None)
        if profile and profile.telegram_id:
            send_telegram_message(profile.telegram_id, f"Пора выполнить задачу: <b>{task.name}</b>!")
            ids_due.append(task.pk)

    if ids_due:
        Task.objects.filter(pk__in=ids_due).update(notification_due_left=True)


def start_notification_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_and_send_notification, 'interval', minutes=1)
    scheduler.start()
