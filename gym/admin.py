from django.contrib import admin
from .models import Workout, MuscleCategory, ExerciseCatalog, SetLog

admin.site.register(Workout)
admin.site.register(MuscleCategory)
admin.site.register(ExerciseCatalog)
admin.site.register(SetLog)
