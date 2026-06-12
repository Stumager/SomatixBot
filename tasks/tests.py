from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import Task
# Create your tests here.
class TaskTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="password")
        self.url = reverse('task_list_api')

    def test_create_task(self):
        self.client.force_authenticate(user=self.user)

        data = {"name": "купить гейнер", "date": "2026-05-15T12:00:00Z"}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 1)
        self.assertEqual(Task.objects.get().name, data["name"])

    def test_get_task_list(self):
        self.client.force_authenticate(user=self.user)
        Task.objects.create(name="тестовая задача", user=self.user, date="2026-05-15T12:00:00Z")
        response = self.client.get(self.url)
        self.assertEqual(len(response.data), 1)