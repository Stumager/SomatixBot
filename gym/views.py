from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from tasks.models import Task
from .models import ExerciseCatalog, MuscleCategory, SetLog, Workout
from .serializer import (
    ExerciseCatalogSerializer,
    MuscleCategorySerializer,
    SetLogSerializer,
    WorkoutFinishSerializer,
    WorkoutSerializer,
)


class MuscleCategoryListView(generics.ListAPIView):
    queryset = MuscleCategory.objects.all()
    serializer_class = MuscleCategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class ExerciseCatalogListView(generics.ListAPIView):
    queryset = ExerciseCatalog.objects.all().select_related("muscle_category")
    serializer_class = ExerciseCatalogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["name", "muscle_category__name"]
    filterset_fields = ["muscle_category"]


class ExerciseCatalogDetailView(generics.RetrieveAPIView):
    queryset = ExerciseCatalog.objects.all().select_related("muscle_category")
    serializer_class = ExerciseCatalogSerializer
    permission_classes = [permissions.IsAuthenticated]


class WorkoutDetailAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = WorkoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        task_id = self.kwargs["task_id"]
        task = get_object_or_404(Task, id=task_id, user=self.request.user)
        workout, created = Workout.objects.get_or_create(
            task=task, defaults={"user": self.request.user}
        )
        if workout.user_id != self.request.user.id:
            raise PermissionDenied("Тренировка привязана к другому пользователю.")
        return (
            Workout.objects.select_related("task", "user")
            .prefetch_related("sets__exercise__muscle_category")
            .get(pk=workout.pk)
        )


class SetLogCreateAPIView(generics.CreateAPIView):
    queryset = SetLog.objects.all()
    serializer_class = SetLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        workout = serializer.validated_data.get("workout")
        if workout and workout.user_id != self.request.user.id:
            raise PermissionDenied("Нельзя добавлять подходы в чужую тренировку.")
        serializer.save()


class WorkoutHistoryListView(generics.ListAPIView):
    serializer_class = WorkoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Workout.objects.filter(user=self.request.user, is_finished=True)
            .select_related("task")
            .prefetch_related("sets__exercise__muscle_category")
            .order_by("-date")
        )


class WorkoutCreateAPIView(generics.ListCreateAPIView):
    serializer_class = WorkoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Workout.objects.filter(user=self.request.user)
            .select_related("task")
            .prefetch_related("sets__exercise__muscle_category")
            .order_by("-date")
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        task = serializer.validated_data["task"]
        workout, created = Workout.objects.get_or_create(
            task=task,
            defaults={
                "user": request.user,
                "is_finished": serializer.validated_data.get("is_finished", False),
            },
        )

        output_serializer = self.get_serializer(workout)
        response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(output_serializer.data, status=response_status)


class WorkoutByIdDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Workout.objects.filter(user=self.request.user)
            .select_related("task")
            .prefetch_related("sets__exercise__muscle_category")
        )


class WorkoutFinishAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        return self._finish(request, pk)

    def patch(self, request, pk):
        return self._finish(request, pk)

    def _finish(self, request, pk):
        serializer = WorkoutFinishSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data

        with transaction.atomic():
            workout = get_object_or_404(
                Workout.objects.select_for_update().filter(user=request.user),
                pk=pk,
            )
            workout.sets.all().delete()
            SetLog.objects.bulk_create(
                [
                    SetLog(
                        workout=workout,
                        exercise=item["exercise"],
                        weight=item["weight"],
                        repetitions=item["repetitions"],
                    )
                    for item in validated["sets"]
                ]
            )
            workout.is_finished = True
            workout.date = validated.get("date", timezone.now())
            workout.save(update_fields=["is_finished", "date"])

        refreshed = (
            Workout.objects.filter(pk=workout.pk, user=request.user)
            .select_related("task")
            .prefetch_related("sets__exercise__muscle_category")
            .get()
        )
        return Response(WorkoutSerializer(refreshed, context={"request": request}).data)
