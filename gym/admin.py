from django.contrib import admin
from .models import Workout, MuscleCategory, ExerciseCatalog, SetLog


@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = ('task', 'user', 'date', 'is_finished')
    list_filter = ('is_finished', 'date')
    search_fields = ('task__name', 'user__username')


@admin.register(MuscleCategory)
class MuscleCategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(ExerciseCatalog)
class ExerciseCatalogAdmin(admin.ModelAdmin):
    list_display = ('name', 'muscle_category')
    list_filter = ('muscle_category',)
    search_fields = ('name',)


@admin.register(SetLog)
class SetLogAdmin(admin.ModelAdmin):
    list_display = ('workout', 'exercise', 'weight', 'repetitions')
    list_filter = ('exercise',)
