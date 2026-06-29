from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0006_task_created_at'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='date',
            field=models.DateTimeField(db_index=True),
        ),
        migrations.AlterField(
            model_name='task',
            name='done',
            field=models.BooleanField(db_index=True, default=False),
        ),
    ]
