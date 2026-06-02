# suppliers/filters.py
import django_filters
from .models import Supplier

class SupplierFilter(django_filters.FilterSet):
    status = django_filters.BooleanFilter()
    company_name = django_filters.CharFilter(lookup_expr='icontains')
    contact_person = django_filters.CharFilter(lookup_expr='icontains')
    email = django_filters.CharFilter(lookup_expr='icontains')
    fuel_types = django_filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = Supplier
        fields = ['status', 'company_name', 'contact_person', 'email', 'fuel_types']