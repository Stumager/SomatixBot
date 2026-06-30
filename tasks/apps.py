import os
import sys
from django.apps import AppConfig


class TasksConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tasks'

    def ready(self):
        is_runserver = 'runserver' in sys.argv
        is_gunicorn = 'gunicorn' in sys.modules

        if is_runserver and os.environ.get('RUN_MAIN') != 'true':
            return

        if not (is_runserver or is_gunicorn):
            return

        from . import utils

        if is_gunicorn:
            # gunicorn runs multiple worker processes; without a lock each
            # worker starts its own scheduler and notifications get sent
            # once per worker (duplicate Telegram messages).
            if not utils.acquire_scheduler_lock():
                return

        utils.start_notification_scheduler()

