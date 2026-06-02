# airlines/admin.py
from django.contrib import admin
from .models import Airline

@admin.register(Airline)
class AirlineAdmin(admin.ModelAdmin):
    list_display = ('airline_name', 'airline_code', 'contact_person', 'email', 'phone', 'credit_limit', 'status')
    list_filter = ('status',)
    search_fields = ('airline_name', 'airline_code', 'contact_person', 'email', 'gst_number')
    list_editable = ('status',)
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('airline_name', 'airline_code')
        }),
        ('Contact Information', {
            'fields': ('contact_person', 'email', 'phone', 'address')
        }),
        ('Financial Information', {
            'fields': ('credit_limit', 'payment_terms')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )