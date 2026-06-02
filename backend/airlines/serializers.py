# airlines/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import Airline

class AirlineListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list view"""
    
    class Meta:
        model = Airline
        fields = [
            'id', 'airline_name', 'airline_code', 'contact_person',
            'email', 'phone', 'credit_limit', 'status', 
            'payment_terms', 'created_at'
        ]

class AirlineDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single airline view"""
    
    class Meta:
        model = Airline
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

class AirlineSerializer(serializers.ModelSerializer):
    """Complete serializer for CRUD operations"""
    
    class Meta:
        model = Airline
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')
        extra_kwargs = {
            'address': {'required': True},
            'airline_code': {'required': True},
        }
    
    def validate_airline_code(self, value):
        """Validate airline code format (3 uppercase letters)"""
        if len(value) != 3:
            raise serializers.ValidationError(
                "Airline code must be exactly 3 characters long"
            )
        if not value.isalpha():
            raise serializers.ValidationError(
                "Airline code must contain only letters"
            )
        return value.upper()
    
    def validate_airline_name(self, value):
        """Check if airline name already exists"""
        if self.instance:
            if Airline.objects.exclude(id=self.instance.id).filter(airline_name=value).exists():
                raise serializers.ValidationError("Airline name already exists")
        else:
            if Airline.objects.filter(airline_name=value).exists():
                raise serializers.ValidationError("Airline name already exists")
        return value
    
    def validate_email(self, value):
        """Check if email already exists"""
        if self.instance:
            if Airline.objects.exclude(id=self.instance.id).filter(email=value).exists():
                raise serializers.ValidationError("Email already exists")
        else:
            if Airline.objects.filter(email=value).exists():
                raise serializers.ValidationError("Email already exists")
        return value
    
    def validate_phone(self, value):
        """Validate phone number format"""
        if value and not value.isdigit():
            raise serializers.ValidationError("Phone number must contain only digits")
        return value
    
    def validate_credit_limit(self, value):
        """Validate credit limit"""
        if value < 0:
            raise serializers.ValidationError("Credit limit cannot be negative")
        return value
    
    def validate_payment_terms(self, value):
        """Validate payment terms"""
        if value < 0:
            raise serializers.ValidationError("Payment terms cannot be negative")
        return value