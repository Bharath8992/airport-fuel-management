# suppliers/filters.py
from django_filters import rest_framework as filters
from .models import Supplier

class SupplierFilter(filters.FilterSet):
    """
    Advanced filtering for suppliers
    """
    company_name_contains = filters.CharFilter(field_name='company_name', lookup_expr='icontains')
    created_after = filters.DateFilter(field_name='created_at', lookup_expr='gte')
    created_before = filters.DateFilter(field_name='created_at', lookup_expr='lte')
    fuel_type = filters.CharFilter(field_name='fuel_types', lookup_expr='contains')
    gst_number = filters.CharFilter(field_name='gst_number', lookup_expr='iexact')
    
    class Meta:
        model = Supplier
        fields = {
            'status': ['exact'],
            'company_name': ['exact', 'icontains'],
            'email': ['exact', 'icontains'],
            'phone': ['exact'],
            'gst_number': ['exact', 'icontains'],
        }