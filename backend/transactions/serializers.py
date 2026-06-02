# transactions/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import FuelTransaction
from suppliers.models import Supplier
from airlines.models import Airline
from airports.models import Airport

class FuelTransactionListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list view"""
    supplier_name = serializers.CharField(source='supplier.company_name', read_only=True)
    airline_name = serializers.CharField(source='airline.airline_name', read_only=True)
    airport_name = serializers.CharField(source='airport.airport_name', read_only=True)
    fuel_type_display = serializers.CharField(source='get_fuel_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = FuelTransaction
        fields = [
            'id', 'transaction_number', 'supplier_name', 'airline_name', 
            'airport_name', 'fuel_type', 'fuel_type_display', 'quantity',
            'total_amount', 'transaction_date', 'status', 'status_display',
            'invoice_number', 'created_at'
        ]

class FuelTransactionDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single transaction view"""
    supplier_name = serializers.CharField(source='supplier.company_name', read_only=True)
    supplier_id = serializers.UUIDField(source='supplier.id', read_only=True)
    airline_name = serializers.CharField(source='airline.airline_name', read_only=True)
    airline_id = serializers.UUIDField(source='airline.id', read_only=True)
    airport_name = serializers.CharField(source='airport.airport_name', read_only=True)
    airport_id = serializers.UUIDField(source='airport.id', read_only=True)
    fuel_type_display = serializers.CharField(source='get_fuel_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.email', read_only=True, default=None)
    
    class Meta:
        model = FuelTransaction
        fields = '__all__'
        read_only_fields = ('id', 'transaction_number', 'subtotal', 'gst_amount', 
                           'total_amount', 'created_at', 'updated_at')

class FuelTransactionSerializer(serializers.ModelSerializer):
    """Complete serializer for CRUD operations"""
    
    class Meta:
        model = FuelTransaction
        fields = '__all__'
        read_only_fields = ('id', 'transaction_number', 'subtotal', 'gst_amount', 
                           'total_amount', 'created_at', 'updated_at')
        extra_kwargs = {
            'created_by': {'read_only': True},
            'transaction_date': {'required': True},
        }
    
    def validate_quantity(self, value):
        """Validate quantity"""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value
    
    def validate_price_per_liter(self, value):
        """Validate price per liter"""
        if value <= 0:
            raise serializers.ValidationError("Price per liter must be greater than 0")
        return value
    
    def validate_gst_rate(self, value):
        """Validate GST rate"""
        if value < 0 or value > 100:
            raise serializers.ValidationError("GST rate must be between 0 and 100")
        return value
    
    def validate_transaction_date(self, value):
        """Validate transaction date is not in future"""
        if value > timezone.now():
            raise serializers.ValidationError("Transaction date cannot be in the future")
        return value
    
    def validate(self, data):
        """Cross-field validation"""
        # Check if supplier is active
        if data.get('supplier') and not data['supplier'].status:
            raise serializers.ValidationError({
                'supplier': "Selected supplier is not active"
            })
        
        # Check if airline is active
        if data.get('airline') and not data['airline'].status:
            raise serializers.ValidationError({
                'airline': "Selected airline is not active"
            })
        
        # Check if airport is active
        if data.get('airport') and not data['airport'].status:
            raise serializers.ValidationError({
                'airport': "Selected airport is not active"
            })
        
        # Check if airport has enough fuel stock
        if data.get('airport') and data.get('quantity'):
            if data['airport'].current_fuel_stock < data['quantity']:
                raise serializers.ValidationError({
                    'quantity': f"Insufficient fuel stock. Available: {data['airport'].current_fuel_stock} liters"
                })
        
        return data
    
    def create(self, validated_data):
        """Create transaction and update airport fuel stock"""
        transaction = super().create(validated_data)
        
        # Update airport fuel stock
        airport = transaction.airport
        airport.current_fuel_stock -= transaction.quantity
        airport.save()
        
        return transaction
    
    def update(self, instance, validated_data):
        """Handle updates with stock adjustments"""
        old_quantity = instance.quantity
        new_quantity = validated_data.get('quantity', old_quantity)
        
        # Update the instance
        transaction = super().update(instance, validated_data)
        
        # Adjust airport fuel stock if quantity changed
        if old_quantity != new_quantity:
            airport = transaction.airport
            # Remove old quantity and add new quantity
            airport.current_fuel_stock = airport.current_fuel_stock + old_quantity - new_quantity
            airport.save()
        
        return transaction