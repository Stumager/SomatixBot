from django.contrib import admin
from .models import Task, Category, UserProfile


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'date', 'done', 'category', 'created_at')
    list_filter = ('done', 'category', 'date')
    search_fields = ('name', 'user__username')
    list_editable = ('done',)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'user')
    search_fields = ('name',)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'telegram_id')
    search_fields = ('user__username', 'telegram_id')
