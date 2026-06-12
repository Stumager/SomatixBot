from rest_framework import serializers

from .models import Category, Task


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name")

    def validate_name(self, value):
        name = value.strip()
        if not name:
            raise serializers.ValidationError("Название категории не может быть пустым.")

        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            queryset = Category.objects.filter(user=request.user, name__iexact=name)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError("Такая категория уже существует.")

        return name


class TaskSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ["id", "user", "name", "created_at", "date", "done", "category", "category_name"]
        read_only_fields = ("user", "created_at")

    def get_category_name(self, obj):
        return obj.category.name if obj.category else "Без категории"

    def validate_name(self, value):
        name = value.strip()
        if not name:
            raise serializers.ValidationError("Название задачи не может быть пустым.")
        return name

    def validate_category(self, value):
        if value is None:
            return value

        request = self.context.get("request")
        if request and value.user_id != request.user.id:
            raise serializers.ValidationError("Нельзя использовать чужую категорию.")

        return value
