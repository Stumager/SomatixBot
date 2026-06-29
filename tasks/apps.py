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

        if is_runserver or is_gunicorn:
            from . import utils
            utils.start_notification_scheduler()

