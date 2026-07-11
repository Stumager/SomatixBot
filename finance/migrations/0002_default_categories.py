from django.db import migrations


DEFAULT_CATEGORIES = [
    # (name, category_type, icon, color, subcategories)
    ('Еда', 'expense', '🍔', '#FF6B6B', [
        ('Продукты', 'expense', '🛒', '#FF8E8E'),
        ('Кафе', 'expense', '☕', '#FFB3B3'),
    ]),
    ('Транспорт', 'expense', '🚗', '#4ECDC4', []),
    ('Жильё', 'expense', '🏠', '#45B7D1', []),
    ('Здоровье', 'expense', '💊', '#96CEB4', []),
    ('Развлечения', 'expense', '🎮', '#FFEAA7', []),
    ('Одежда', 'expense', '👕', '#DDA0DD', []),
    ('Зарплата', 'income', '💼', '#6BCB77', []),
    ('Фриланс', 'income', '💻', '#4D96FF', []),
    ('Прочее', 'income', '💰', '#FFD93D', []),
]


def create_default_categories(apps, schema_editor):
    Category = apps.get_model('finance', 'Category')
    for name, category_type, icon, color, subcats in DEFAULT_CATEGORIES:
        parent = Category.objects.create(
            user=None,
            name=name,
            category_type=category_type,
            icon=icon,
            color=color,
        )
        for sub_name, sub_type, sub_icon, sub_color in subcats:
            Category.objects.create(
                user=None,
                name=sub_name,
                category_type=sub_type,
                icon=sub_icon,
                color=sub_color,
                parent=parent,
            )


def remove_default_categories(apps, schema_editor):
    Category = apps.get_model('finance', 'Category')
    Category.objects.filter(user__isnull=True).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_default_categories, remove_default_categories),
    ]
