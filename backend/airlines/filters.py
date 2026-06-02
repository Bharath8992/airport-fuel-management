# airlines/filters.py
import django_filters
from .models import Airline

class AirlineFilter(django_filters.FilterSet):
    status = django_filters.BooleanFilter()
    airline_name = django_filters.CharFilter(lookup_expr='icontains')
    airline_code = django_filters.CharFilter(lookup_expr='icontains')
    contact_person = django_filters.CharFilter(lookup_expr='icontains')
    email = django_filters.CharFilter(lookup_expr='icontains')
    min_credit_limit = django_filters.NumberFilter(field_name='credit_limit', lookup_expr='gte')
    max_credit_limit = django_filters.NumberFilter(field_name='credit_limit', lookup_expr='lte')
    
    class Meta:
        model = Airline
        fields = ['status', 'airline_name', 'airline_code', 'contact_person', 'email']