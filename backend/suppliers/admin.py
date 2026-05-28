from django.contrib import admin
from .models import Supplier, SupplierContract

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'contact_person', 'email', 'phone', 'status')
    list_filter = ('status',)
    search_fields = ('company_name', 'gst_number')

@admin.register(SupplierContract)
class SupplierContractAdmin(admin.ModelAdmin):
    list_display = ('contract_number', 'supplier', 'fuel_type', 'price_per_liter', 'is_active')
    list_filter = ('is_active', 'fuel_type')