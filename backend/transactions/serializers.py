from rest_framework import serializers
from .models import FuelTransaction

class FuelTransactionSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.company_name', read_only=True)
    airline_name = serializers.CharField(source='airline.airline_name', read_only=True)
    airport_name = serializers.CharField(source='airport.airport_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = FuelTransaction
        fields = '__all__'
        read_only_fields = ('id', 'transaction_number', 'subtotal', 'gst_amount', 
                           'total_amount', 'created_at', 'updated_at')
    
    def validate(self, data):
        airport = data.get('airport')
        quantity = data.get('quantity')
        
        if airport and quantity > airport.current_fuel_stock:
            raise serializers.ValidationError(
                f"Insufficient fuel stock. Available: {airport.current_fuel_stock} liters"
            )
        
        return data
    
    def create(self, validated_data):
        airport = validated_data.get('airport')
        quantity = validated_data.get('quantity')
        airport.current_fuel_stock -= quantity
        airport.save()
        
        return super().create(validated_data)