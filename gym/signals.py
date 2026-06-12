from django.db.models.signals import post_save
from django.dispatch import receiver
from tasks.models import Task
from .models import Workout


@receiver(post_save, sender=Task)
def create_workout_for_gym_task(sender, instance, created, **kwargs):
    if not created or not instance.user_id or not instance.category:
        return

    gym_category_names = {"gym", "зал", "тренировка", "тренировки"}
    if instance.category.name.strip().lower() in gym_category_names:
        Workout.objects.get_or_create(task=instance, user=instance.user)
