from rest_framework import serializers
from .models import FuelTransaction

class FuelTransactionSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.company_name', read_only=True)
    airline_name = serializers.CharField(source='airline.airline_name', read_only=True)
    airport_name = serializers.CharField(source='airport.airport_name', read_only=True)
    airport_code = serializers.CharField(source='airport.airport_code', read_only=True)
    
    class Meta:
        model = FuelTransaction
        fields = '__all__'
        read_only_fields = ('id', 'transaction_number', 'subtotal', 'gst_amount', 'total_amount', 'created_at', 'updated_at')

class FuelTransactionCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FuelTransaction
        fields = '__all__'
        read_only_fields = ('id', 'transaction_number', 'subtotal', 'gst_amount', 'total_amount', 'created_at', 'updated_at')