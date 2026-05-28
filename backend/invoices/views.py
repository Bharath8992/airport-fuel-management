from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from .models import Invoice
from .serializers import InvoiceSerializer
from .utils import InvoicePDFGenerator
from transactions.models import FuelTransaction

class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Invoice.objects.select_related('transaction', 'generated_by').all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        transaction_id = request.data.get('transaction_id')
        
        try:
            transaction = FuelTransaction.objects.get(id=transaction_id)
        except FuelTransaction.DoesNotExist:
            return Response({'error': 'Transaction not found'}, status=404)
        
        if hasattr(transaction, 'invoice'):
            return Response({'error': 'Invoice already exists'}, status=400)
        
        import uuid
        import time
        invoice_number = f"INV{int(time.time())}{uuid.uuid4().hex[:6].upper()}"
        
        invoice = Invoice.objects.create(
            invoice_number=invoice_number,
            transaction=transaction,
            generated_by=request.user
        )
        
        pdf_file = InvoicePDFGenerator.generate(invoice, transaction)
        invoice.pdf_file.save(f"invoice_{invoice_number}.pdf", pdf_file)
        invoice.save()
        
        transaction.status = 'invoiced'
        transaction.invoice_number = invoice_number
        transaction.save()
        
        serializer = self.get_serializer(invoice)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        invoice = self.get_object()
        
        if not invoice.pdf_file:
            return Response({'error': 'PDF file not found'}, status=404)
        
        response = HttpResponse(invoice.pdf_file.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="invoice_{invoice.invoice_number}.pdf"'
        
        return response