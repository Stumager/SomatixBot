from rest_framework import serializers

from tasks.models import Task
from .models import ExerciseCatalog, MuscleCategory, SetLog, Workout


class MuscleCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MuscleCategory
        fields = ["id", "name"]


class ExerciseCatalogSerializer(serializers.ModelSerializer):
    muscle_category_name = serializers.ReadOnlyField(source="muscle_category.name")
    description = serializers.CharField(source="technique", read_only=True)

    class Meta:
        model = ExerciseCatalog
        fields = [
            "id",
            "name",
            "muscle_category",
            "muscle_category_name",
            "technique",
            "description",
        ]


class SetLogSerializer(serializers.ModelSerializer):
    exercise_name = serializers.ReadOnlyField(source="exercise.name")

    class Meta:
        model = SetLog
        fields = ["id", "workout", "exercise", "exercise_name", "weight", "repetitions"]

    def validate_workout(self, value):
        request = self.context.get("request")
        if request and value.user_id != request.user.id:
            raise serializers.ValidationError("Нельзя добавлять подходы в чужую тренировку.")
        return value

    def validate_weight(self, value):
        if value <= 0:
            raise serializers.ValidationError("Вес должен быть больше нуля.")
        if value > 999:
            raise serializers.ValidationError("Вес выглядит слишком большим.")
        return value

    def validate_repetitions(self, value):
        if value <= 0:
            raise serializers.ValidationError("Количество повторений должно быть больше нуля.")
        if value > 500:
            raise serializers.ValidationError("Количество повторений выглядит слишком большим.")
        return value


class WorkoutSetInputSerializer(serializers.Serializer):
    exercise = serializers.PrimaryKeyRelatedField(queryset=ExerciseCatalog.objects.all())
    weight = serializers.DecimalField(max_digits=5, decimal_places=1)
    repetitions = serializers.IntegerField(min_value=1, max_value=500)

    def validate_weight(self, value):
        if value <= 0:
            raise serializers.ValidationError("Вес должен быть больше нуля.")
        if value > 999:
            raise serializers.ValidationError("Вес выглядит слишком большим.")
        return value


class WorkoutFinishSerializer(serializers.Serializer):
    date = serializers.DateTimeField(required=False)
    sets = WorkoutSetInputSerializer(many=True)

    def validate_sets(self, value):
        if not value:
            raise serializers.ValidationError("Добавьте хотя бы один подход.")
        if len(value) > 300:
            raise serializers.ValidationError("Слишком много подходов для одной тренировки.")
        return value


class WorkoutSerializer(serializers.ModelSerializer):
    date = serializers.DateTimeField(required=False)
    task_name = serializers.ReadOnlyField(source="task.name")
    exercise_grouped = serializers.SerializerMethodField()
    total_volume = serializers.SerializerMethodField()
    task = serializers.PrimaryKeyRelatedField(queryset=Task.objects.all())
    is_finished = serializers.BooleanField(required=False, default=False)

    class Meta:
        model = Workout
        fields = [
            "id",
            "task",
            "task_name",
            "date",
            "is_finished",
            "total_volume",
            "exercise_grouped",
        ]
        read_only_fields = ("task_name", "total_volume", "exercise_grouped")

    def validate_task(self, value):
        request = self.context.get("request")
        if request and value.user_id != request.user.id:
            raise serializers.ValidationError("Нельзя привязать тренировку к чужой задаче.")
        return value

    def get_total_volume(self, obj):
        return sum(float(item.weight) * item.repetitions for item in obj.sets.all())

    def get_exercise_grouped(self, obj):
        sets = obj.sets.all().select_related("exercise__muscle_category")
        grouped = {}

        for item in sets:
            exercise_id = item.exercise.id
            if exercise_id not in grouped:
                grouped[exercise_id] = {
                    "exercise_id": exercise_id,
                    "exercise_name": item.exercise.name,
                    "muscle_category_name": item.exercise.muscle_category.name if item.exercise.muscle_category else None,
                    "sets": [],
                }
            grouped[exercise_id]["sets"].append(
                {
                    "id": item.id,
                    "weight": float(item.weight),
                    "repetitions": item.repetitions,
                }
            )

        return list(grouped.values())

    def update(self, instance, validated_data):
        task = validated_data.get("task")
        if task is not None:
            instance.task = task

        if "is_finished" in validated_data:
            instance.is_finished = validated_data["is_finished"]

        if "date" in validated_data:
            instance.date = validated_data["date"]

        instance.save()
        return instance
