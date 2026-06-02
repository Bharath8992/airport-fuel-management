# transactions/filters.py
import django_filters
from django.db import models
from .models import FuelTransaction

class FuelTransactionFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=FuelTransaction.STATUS_CHOICES)
    fuel_type = django_filters.ChoiceFilter(choices=FuelTransaction.FUEL_TYPES)
    supplier = django_filters.UUIDFilter(field_name='supplier__id')
    airline = django_filters.UUIDFilter(field_name='airline__id')
    airport = django_filters.UUIDFilter(field_name='airport__id')
    
    transaction_date_from = django_filters.DateTimeFilter(field_name='transaction_date', lookup_expr='gte')
    transaction_date_to = django_filters.DateTimeFilter(field_name='transaction_date', lookup_expr='lte')
    
    min_quantity = django_filters.NumberFilter(field_name='quantity', lookup_expr='gte')
    max_quantity = django_filters.NumberFilter(field_name='quantity', lookup_expr='lte')
    
    min_total = django_filters.NumberFilter(field_name='total_amount', lookup_expr='gte')
    max_total = django_filters.NumberFilter(field_name='total_amount', lookup_expr='lte')
    
    has_invoice = django_filters.BooleanFilter(method='filter_has_invoice')
    
    class Meta:
        model = FuelTransaction
        fields = ['status', 'fuel_type', 'supplier', 'airline', 'airport']
    
    def filter_has_invoice(self, queryset, name, value):
        """Filter transactions with or without invoice"""
        if value:
            return queryset.exclude(invoice_number__isnull=True).exclude(invoice_number='')
        return queryset.filter(invoice_number__isnull=True) | queryset.filter(invoice_number='')