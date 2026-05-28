from rest_framework import serializers
from .models import Supplier, SupplierContract

class SupplierContractSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplierContract
        fields = '__all__'
        read_only_fields = ('id', 'created_at')

class SupplierSerializer(serializers.ModelSerializer):
    contracts = SupplierContractSerializer(many=True, read_only=True)
    
    class Meta:
        model = Supplier
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

class SupplierCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')