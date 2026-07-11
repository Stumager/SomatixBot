from django.contrib import admin

from .models import Account, Category, Transaction


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'account_type', 'currency', 'balance', 'is_archived', 'created_at')
    list_filter = ('user', 'account_type', 'currency', 'is_archived')
    search_fields = ('name', 'user__username')
    readonly_fields = ('balance', 'created_at', 'updated_at')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'category_type', 'parent', 'user', 'icon', 'is_archived')
    list_filter = ('category_type', 'is_archived', 'user')
    search_fields = ('name',)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('date', 'user', 'transaction_type', 'amount', 'account', 'category', 'note', 'created_at')
    list_filter = ('user', 'transaction_type', 'account', 'category', 'date')
    search_fields = ('note',)
    readonly_fields = ('created_at',)
    date_hierarchy = 'date'
