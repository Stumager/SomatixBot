from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('gym', '0003_alter_exercisecatalog_technique'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='musclecategory',
            options={'ordering': ['name'], 'verbose_name_plural': 'Muscle categories'},
        ),
        migrations.AlterModelOptions(
            name='exercisecatalog',
            options={'ordering': ['muscle_category', 'name']},
        ),
        migrations.AlterModelOptions(
            name='workout',
            options={'ordering': ['-date']},
        ),
        migrations.AlterField(
            model_name='musclecategory',
            name='name',
            field=models.CharField(max_length=255, unique=True),
        ),
        migrations.AlterField(
            model_name='exercisecatalog',
            name='muscle_category',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='exercises',
                to='gym.musclecategory',
            ),
        ),
        migrations.AlterField(
            model_name='exercisecatalog',
            name='technique',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AlterField(
            model_name='workout',
            name='user',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='workouts',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AlterField(
            model_name='workout',
            name='is_finished',
            field=models.BooleanField(db_index=True, default=False),
        ),
        migrations.AlterField(
            model_name='setlog',
            name='exercise',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='set_logs',
                to='gym.exercisecatalog',
            ),
        ),
        migrations.AlterField(
            model_name='setlog',
            name='weight',
            field=models.DecimalField(decimal_places=1, max_digits=5),
        ),
    ]
