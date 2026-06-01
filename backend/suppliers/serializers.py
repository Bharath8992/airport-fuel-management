# suppliers/serializers.py
from rest_framework import serializers
from .models import Supplier, SupplierContract

class SupplierContractSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.company_name', read_only=True)
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = SupplierContract
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'supplier_name')
    
    def get_is_valid(self, obj):
        return obj.is_active and obj.start_date <= timezone.now().date() <= obj.end_date
    
    def validate(self, data):
        """Validate contract dates"""
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError(
                    "End date must be after start date"
                )
        
        if data.get('price_per_liter') and data['price_per_liter'] <= 0:
            raise serializers.ValidationError(
                "Price per liter must be greater than 0"
            )
        
        return data

class SupplierListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list view"""
    contract_count = serializers.IntegerField(source='contracts.count', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Supplier
        fields = [
            'id', 'company_name', 'contact_person', 'email', 
            'phone', 'status', 'status_display', 'contract_count',
            'fuel_types', 'created_at'
        ]

class SupplierDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with contracts"""
    contracts = SupplierContractSerializer(many=True, read_only=True)
    active_contracts = serializers.SerializerMethodField()
    
    class Meta:
        model = Supplier
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_active_contracts(self, obj):
        active_contracts = obj.contracts.filter(is_active=True)
        return SupplierContractSerializer(active_contracts, many=True).data

class SupplierSerializer(serializers.ModelSerializer):
    """Complete serializer for CRUD operations"""
    contracts = SupplierContractSerializer(many=True, read_only=True)
    
    class Meta:
        model = Supplier
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def validate_gst_number(self, value):
        """Validate GST number format"""
        if value and len(value) != 15:
            raise serializers.ValidationError(
                "GST number must be 15 characters long"
            )
        return value.upper()
    
    def validate_email(self, value):
        """Check if email already exists"""
        if self.instance:
            if Supplier.objects.exclude(id=self.instance.id).filter(email=value).exists():
                raise serializers.ValidationError("Email already exists")
        else:
            if Supplier.objects.filter(email=value).exists():
                raise serializers.ValidationError("Email already exists")
        return value
    
    def validate_phone(self, value):
        """Validate phone number format"""
        if value and not value.isdigit():
            raise serializers.ValidationError("Phone number must contain only digits")
        return value