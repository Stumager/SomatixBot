from rest_framework import serializers

from .models import Account, Category, Transaction


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'name', 'account_type', 'currency', 'balance', 'is_archived', 'created_at', 'updated_at']
        read_only_fields = ['balance', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()
    is_system = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'parent', 'category_type', 'icon', 'color', 'is_archived', 'is_system', 'subcategories']
        read_only_fields = ['is_system', 'subcategories']

    def get_subcategories(self, obj):
        # Вложенные только для категорий верхнего уровня
        if obj.parent_id is not None:
            return []
        subs = obj.subcategories.filter(is_archived=False)
        return CategorySerializer(subs, many=True, context=self.context).data

    def get_is_system(self, obj):
        return obj.user_id is None

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    account_name = serializers.SerializerMethodField()
    transfer_to_account_name = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            'id', 'account', 'account_name',
            'category', 'category_name',
            'transaction_type', 'amount',
            'transfer_to_account', 'transfer_to_account_name',
            'note', 'date', 'created_at',
        ]
        read_only_fields = ['created_at', 'category_name', 'account_name', 'transfer_to_account_name']

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def get_account_name(self, obj):
        return obj.account.name if obj.account_id else None

    def get_transfer_to_account_name(self, obj):
        return obj.transfer_to_account.name if obj.transfer_to_account_id else None

    def validate(self, data):
        transaction_type = data.get('transaction_type', getattr(self.instance, 'transaction_type', None))
        category = data.get('category', getattr(self.instance, 'category', None))
        transfer_to = data.get('transfer_to_account', getattr(self.instance, 'transfer_to_account', None))
        account = data.get('account', getattr(self.instance, 'account', None))
        amount = data.get('amount', getattr(self.instance, 'amount', None))

        if amount is not None and amount <= 0:
            raise serializers.ValidationError({'amount': 'Сумма должна быть положительной.'})

        if transaction_type == 'transfer':
            if category is not None:
                raise serializers.ValidationError({'category': 'При переводе категория должна быть пустой.'})
            if not transfer_to:
                raise serializers.ValidationError({'transfer_to_account': 'Укажите счёт назначения для перевода.'})
            if account and transfer_to and account.pk == transfer_to.pk:
                raise serializers.ValidationError({'transfer_to_account': 'Счёт назначения должен отличаться от источника.'})
        elif transaction_type in ('income', 'expense'):
            if category and category.category_type != transaction_type:
                raise serializers.ValidationError({
                    'category': f'Тип категории должен совпадать с типом операции ({transaction_type}).',
                })

        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
