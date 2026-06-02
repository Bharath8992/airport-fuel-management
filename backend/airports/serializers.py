# airports/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import Airport

class AirportListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list view"""
    fuel_usage_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Airport
        fields = [
            'id', 'airport_name', 'airport_code', 'city', 'country',
            'runway_count', 'fuel_storage_capacity', 'current_fuel_stock',
            'fuel_usage_percentage', 'status', 'created_at'
        ]
    
    def get_fuel_usage_percentage(self, obj):
        """Calculate fuel storage usage percentage"""
        if obj.fuel_storage_capacity > 0:
            return (obj.current_fuel_stock / obj.fuel_storage_capacity) * 100
        return 0

class AirportDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single airport view"""
    fuel_usage_percentage = serializers.SerializerMethodField()
    available_capacity = serializers.SerializerMethodField()
    
    class Meta:
        model = Airport
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_fuel_usage_percentage(self, obj):
        if obj.fuel_storage_capacity > 0:
            return (obj.current_fuel_stock / obj.fuel_storage_capacity) * 100
        return 0
    
    def get_available_capacity(self, obj):
        return obj.fuel_storage_capacity - obj.current_fuel_stock

class AirportSerializer(serializers.ModelSerializer):
    """Complete serializer for CRUD operations"""
    
    class Meta:
        model = Airport
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')
        extra_kwargs = {
            'airport_code': {'required': True},
            'fuel_storage_capacity': {'required': True, 'min_value': 0},
            'current_fuel_stock': {'min_value': 0},
            'runway_count': {'min_value': 0},
        }
    
    def validate_airport_code(self, value):
        """Validate airport code format (3-4 uppercase letters/numbers)"""
        if len(value) < 3 or len(value) > 4:
            raise serializers.ValidationError(
                "Airport code must be 3 or 4 characters long"
            )
        if not value.isalnum():
            raise serializers.ValidationError(
                "Airport code must contain only letters and numbers"
            )
        
        # Check if airport code already exists
        if self.instance:
            if Airport.objects.exclude(id=self.instance.id).filter(airport_code=value).exists():
                raise serializers.ValidationError("Airport code already exists")
        else:
            if Airport.objects.filter(airport_code=value).exists():
                raise serializers.ValidationError("Airport code already exists")
        
        return value.upper()
    
    def validate_airport_name(self, value):
        """Check if airport name already exists"""
        if self.instance:
            if Airport.objects.exclude(id=self.instance.id).filter(airport_name=value).exists():
                raise serializers.ValidationError("Airport name already exists")
        else:
            if Airport.objects.filter(airport_name=value).exists():
                raise serializers.ValidationError("Airport name already exists")
        return value
    
    def validate_current_fuel_stock(self, value):
        """Validate current fuel stock doesn't exceed capacity"""
        if self.instance:
            capacity = self.instance.fuel_storage_capacity
        else:
            capacity = self.initial_data.get('fuel_storage_capacity', 0)
        
        if value > capacity:
            raise serializers.ValidationError(
                f"Current fuel stock cannot exceed storage capacity ({capacity})"
            )
        return value
    
    def validate(self, data):
        """Cross-field validation"""
        # Check if current stock exceeds capacity when both are provided
        if 'current_fuel_stock' in data and 'fuel_storage_capacity' in data:
            if data['current_fuel_stock'] > data['fuel_storage_capacity']:
                raise serializers.ValidationError({
                    'current_fuel_stock': f"Current fuel stock cannot exceed storage capacity ({data['fuel_storage_capacity']})"
                })
        return data