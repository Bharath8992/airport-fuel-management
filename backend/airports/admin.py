# airports/admin.py
from django.contrib import admin
from .models import Airport

@admin.register(Airport)
class AirportAdmin(admin.ModelAdmin):
    list_display = ('airport_name', 'airport_code', 'city', 'country', 'runway_count', 'current_fuel_stock', 'fuel_storage_capacity', 'status')
    list_filter = ('status', 'country')
    search_fields = ('airport_name', 'airport_code', 'city', 'country')
    list_editable = ('status',)
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('airport_name', 'airport_code')
        }),
        ('Location Information', {
            'fields': ('city', 'country')
        }),
        ('Infrastructure', {
            'fields': ('runway_count', 'fuel_storage_capacity', 'current_fuel_stock')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )