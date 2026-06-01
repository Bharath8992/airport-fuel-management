from rest_framework import serializers
from .models import Airport

class AirportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Airport
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

class AirportCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Airport
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')