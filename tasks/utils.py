import requests
from django.conf import settings
from apscheduler.schedulers.background import BackgroundScheduler
from django.utils import timezone
from datetime import timedelta
from .models import Task



def send_telegram_message(user_id, text):
    bot_token = settings.BOT_TOKEN
    url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    payload = {
        'chat_id':user_id,
        'text':text,
        'parse_mode':'HTML',
    }
    try:
        requests.post(url, json=payload)
    except Exception as e:
        print(f'Ошибка отправки: {e}')

def check_and_send_notification():
    now = timezone.now().replace(second=0, microsecond=0)
    is_one_hour = now + timedelta(hours=1)

    tasks_1h = Task.objects.filter(
        date=is_one_hour,
        date__gt=now,
        notification_1h_left=False,
        done=False,
    )
    for task in tasks_1h:
        if hasattr(task.user, 'profile') and task.user.profile.telegram_id:
            send_telegram_message(task.user.profile.telegram_id, f"Задача через час: <b>{task.name}</b>")
            task.notification_1h_left = True
            task.save()

    tasks_due = Task.objects.filter(
        date=now,
        notification_due_left=False,
        done=False,
    )
    for task in tasks_due:
        if hasattr(task.user, 'profile') and task.user.profile.telegram_id:
            send_telegram_message(task.user.profile.telegram_id, f"Пора выполнить задачу: <b>{task.name}</b>!")
            task.notification_due_left = True
            task.save()

def start_notification_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_and_send_notification, 'interval', minutes=1)
    scheduler.start()
