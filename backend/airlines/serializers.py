from rest_framework import serializers
from .models import Airline  # Only import Airline, not User

class AirlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Airline
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')