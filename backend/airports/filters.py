# airports/filters.py
import django_filters
from .models import Airport

class AirportFilter(django_filters.FilterSet):
    status = django_filters.BooleanFilter()
    airport_name = django_filters.CharFilter(lookup_expr='icontains')
    airport_code = django_filters.CharFilter(lookup_expr='icontains')
    city = django_filters.CharFilter(lookup_expr='icontains')
    country = django_filters.CharFilter(lookup_expr='icontains')
    min_runway_count = django_filters.NumberFilter(field_name='runway_count', lookup_expr='gte')
    max_runway_count = django_filters.NumberFilter(field_name='runway_count', lookup_expr='lte')
    min_fuel_capacity = django_filters.NumberFilter(field_name='fuel_storage_capacity', lookup_expr='gte')
    max_fuel_capacity = django_filters.NumberFilter(field_name='fuel_storage_capacity', lookup_expr='lte')
    min_fuel_stock = django_filters.NumberFilter(field_name='current_fuel_stock', lookup_expr='gte')
    max_fuel_stock = django_filters.NumberFilter(field_name='current_fuel_stock', lookup_expr='lte')
    low_fuel = django_filters.BooleanFilter(method='filter_low_fuel')
    
    class Meta:
        model = Airport
        fields = ['status', 'airport_name', 'airport_code', 'city', 'country']
    
    def filter_low_fuel(self, queryset, name, value):
        """Filter airports with low fuel stock (< 20% of capacity)"""
        if value:
            # Return airports where current stock is less than 20% of capacity
            return queryset.filter(
                models.F('current_fuel_stock') < (models.F('fuel_storage_capacity') * 0.2)
            )
        return queryset