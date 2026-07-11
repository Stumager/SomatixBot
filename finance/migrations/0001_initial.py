from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Account',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('account_type', models.CharField(
                    choices=[('card', 'Карта'), ('cash', 'Наличные'), ('savings', 'Накопительный'), ('other', 'Другое')],
                    max_length=10,
                )),
                ('currency', models.CharField(default='RUB', max_length=3)),
                ('balance', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('is_archived', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='accounts',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={'ordering': ['name']},
        ),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('category_type', models.CharField(
                    choices=[('income', 'Доход'), ('expense', 'Расход')],
                    max_length=10,
                )),
                ('icon', models.CharField(blank=True, max_length=10, null=True)),
                ('color', models.CharField(blank=True, max_length=7, null=True)),
                ('is_archived', models.BooleanField(default=False)),
                ('user', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='finance_categories',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('parent', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='subcategories',
                    to='finance.category',
                )),
            ],
            options={'ordering': ['category_type', 'name']},
        ),
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('transaction_type', models.CharField(
                    choices=[('income', 'Доход'), ('expense', 'Расход'), ('transfer', 'Перевод')],
                    max_length=10,
                )),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('note', models.CharField(blank=True, max_length=200)),
                ('date', models.DateField(db_index=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='transactions',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('account', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='transactions',
                    to='finance.account',
                )),
                ('category', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='transactions',
                    to='finance.category',
                )),
                ('transfer_to_account', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='incoming_transfers',
                    to='finance.account',
                )),
            ],
            options={'ordering': ['-date', '-created_at']},
        ),
    ]
