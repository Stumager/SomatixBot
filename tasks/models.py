from django.db import models
from django.contrib.auth.models import  User
# Create your models here.

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    telegram_id = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.telegram_id}"

class Category(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE)
    def __str__(self):
        return self.name

class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    date = models.DateTimeField()
    done = models.BooleanField(default=False)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    notification_1h_left = models.BooleanField(default=False)
    notification_due_left = models.BooleanField(default=False)

    def __str__(self):
        return self.name