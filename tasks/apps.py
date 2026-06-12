import os
from django.apps import AppConfig
from threading import Thread

class TasksConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tasks'

    def ready(self):
        if os.environ.get('RUN_MAIN') ==  'true':
            from . import utils

            Thread(target=utils.start_notification_scheduler, daemon=True).start()

