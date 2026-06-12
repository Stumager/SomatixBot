from django.urls import path
from . import views
from .views import (
    TaskListCreateAPIView,
    TaskDetailAPIView,
    CategoryListCreateAPIView,
    CategoryDetailAPIView,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("tasks/", TaskListCreateAPIView.as_view(), name="task_list_api"),
    path("tasks/<int:pk>/", TaskDetailAPIView.as_view(), name="task_detail_api"),
    path("categories/", CategoryListCreateAPIView.as_view(), name="category_list_api"),
    path(
        "categories/<int:pk>/",
        CategoryDetailAPIView.as_view(),
        name="category_detail_api",
    ),
    path("auth/telegram/", views.telegram_auth_view, name="telegram_auth"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
