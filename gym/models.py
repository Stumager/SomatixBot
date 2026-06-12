from django.conf import settings
from django.db import models

from tasks.models import Task


class MuscleCategory(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class ExerciseCatalog(models.Model):
    name = models.CharField(max_length=200)
    muscle_category = models.ForeignKey(MuscleCategory, on_delete=models.CASCADE)
    technique = models.TextField(blank=True, null=True, help_text="Техника выполнения упражнения")

    def __str__(self):
        return self.name


class Workout(models.Model):
    task = models.OneToOneField(Task, on_delete=models.CASCADE, related_name="workout")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    is_finished = models.BooleanField(default=False)

    def __str__(self):
        return f"Тренировка: {self.task.name}"


class SetLog(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name="sets")
    exercise = models.ForeignKey(ExerciseCatalog, on_delete=models.CASCADE)
    weight = models.DecimalField(max_digits=5, decimal_places=1, help_text="Вес снаряда")
    repetitions = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.exercise.name} - {self.weight} кг * {self.repetitions}"
