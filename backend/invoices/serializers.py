from rest_framework import serializers
from .models import Invoice
from transactions.serializers import FuelTransactionSerializer

class InvoiceSerializer(serializers.ModelSerializer):
    transaction_details = FuelTransactionSerializer(source='transaction', read_only=True)
    
    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = ('id', 'invoice_number', 'generated_at')