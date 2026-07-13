from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AccountViewSet, CategoryViewSet, SummaryView, TransactionViewSet, TrendView

router = DefaultRouter()
router.register('accounts', AccountViewSet, basename='account')
router.register('categories', CategoryViewSet, basename='category')
router.register('transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
    path('summary/', SummaryView.as_view(), name='finance-summary'),
    path('trend/', TrendView.as_view(), name='finance-trend'),
]
