from django.urls import path
from .views import (
    MuscleCategoryListView,
    WorkoutDetailAPIView,
    SetLogCreateAPIView,
    ExerciseCatalogListView,
    ExerciseCatalogDetailView,
    WorkoutHistoryListView,
    WorkoutCreateAPIView,
    WorkoutByIdDetailAPIView,
    WorkoutFinishAPIView,
)

urlpatterns = [
    path("categories/", MuscleCategoryListView.as_view()),
    path("catalog/", ExerciseCatalogListView.as_view()),
    path("catalog/<int:pk>/", ExerciseCatalogDetailView.as_view()),
    path("task/<int:task_id>/", WorkoutDetailAPIView.as_view()),
    path("workouts/", WorkoutCreateAPIView.as_view()),
    path("workouts/<int:pk>/finish/", WorkoutFinishAPIView.as_view()),
    path("workouts/<int:pk>/", WorkoutByIdDetailAPIView.as_view()),
    path("sets/", SetLogCreateAPIView.as_view()),
    path("history/", WorkoutHistoryListView.as_view()),
]
