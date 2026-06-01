from rest_framework import serializers
from .models import Invoice
from suppliers.models import Supplier  # adjust import path to your project


class SupplierMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'company_name']


class InvoiceSerializer(serializers.ModelSerializer):

    # Shows supplier details when reading; accepts supplier ID when writing
    supplier_detail = SupplierMinimalSerializer(
        source='supplier',
        read_only=True
    )

    class Meta:
        model = Invoice
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Add human-readable supplier name directly on the object
        data['company_name'] = (
            instance.supplier.company_name
            if instance.supplier
            else instance.report_type
        )
        return data
