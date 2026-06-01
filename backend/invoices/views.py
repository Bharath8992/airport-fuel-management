# invoices/views.py
from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse
from django.db.models import Sum
from django.utils import timezone
from django.core.files.base import ContentFile
from datetime import datetime, timedelta
import uuid
import io

from .models import Invoice
from .serializers import InvoiceSerializer
from .utils import InvoicePDFGenerator
from transactions.models import FuelTransaction
from suppliers.models import Supplier


class InvoiceViewSet(ListModelMixin, RetrieveModelMixin, GenericViewSet):
    queryset = Invoice.objects.select_related('supplier', 'generated_by').all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='generate')
    def generate_invoice(self, request):
        """Generate a new invoice"""
        print("=" * 50)
        print("GENERATE INVOICE CALLED")
        print("Request method:", request.method)
        print("Request data:", request.data)
        print("=" * 50)
        
        report_type = request.data.get('report_type')
        supplier_id = request.data.get('supplier_id')
        date_str = request.data.get('date')

        # Validation
        if not report_type:
            return Response(
                {'error': 'report_type is required (daily or monthly)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if report_type not in ['daily', 'monthly']:
            return Response(
                {'error': 'report_type must be "daily" or "monthly"'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get transactions
        transactions = FuelTransaction.objects.select_related('supplier', 'airline')
        
        # Handle date filtering
        today = timezone.now().date()
        
        if report_type == 'daily':
            if date_str:
                filter_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            else:
                filter_date = today
            
            period_label = filter_date.strftime('%d %b %Y')
            
            # Create timezone-aware datetime range
            start_datetime = timezone.make_aware(
                datetime.combine(filter_date, datetime.min.time())
            )
            end_datetime = timezone.make_aware(
                datetime.combine(filter_date, datetime.max.time())
            )
            
            print(f"Filtering daily: {start_datetime} to {end_datetime}")
            transactions = transactions.filter(
                transaction_date__range=(start_datetime, end_datetime)
            )
            
        else:  # monthly
            if date_str:
                filter_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                year, month = filter_date.year, filter_date.month
            else:
                year, month = today.year, today.month
            
            period_label = datetime(year, month, 1).strftime('%B %Y')
            
            # Create timezone-aware date range for the month
            start_date = timezone.make_aware(datetime(year, month, 1))
            if month == 12:
                end_date = timezone.make_aware(datetime(year + 1, 1, 1)) - timedelta(seconds=1)
            else:
                end_date = timezone.make_aware(datetime(year, month + 1, 1)) - timedelta(seconds=1)
            
            print(f"Filtering monthly: {start_date} to {end_date}")
            transactions = transactions.filter(
                transaction_date__range=(start_date, end_date)
            )

        # Filter by supplier
        supplier_obj = None
        if supplier_id:
            try:
                supplier_obj = Supplier.objects.get(id=supplier_id)
                transactions = transactions.filter(supplier=supplier_obj)
                print(f"Filtered by supplier: {supplier_obj.company_name}")
            except Supplier.DoesNotExist:
                return Response(
                    {'error': 'Supplier not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

        # Check if transactions exist
        transaction_count = transactions.count()
        print(f"Found {transaction_count} transactions")
        
        if transaction_count == 0:
            return Response(
                {'error': f'No transactions found for {period_label}'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Calculate totals
        totals = transactions.aggregate(
            total_qty=Sum('quantity'),
            total_amt=Sum('total_amount')
        )
        total_quantity = totals['total_qty'] or 0
        total_amount = totals['total_amt'] or 0
        
        print(f"Totals - Quantity: {total_quantity}, Amount: {total_amount}")
        
        # Generate invoice number
        timestamp = int(timezone.now().timestamp())
        invoice_number = f"INV-{timestamp}-{uuid.uuid4().hex[:6].upper()}"

        # Create invoice
        invoice = Invoice.objects.create(
            invoice_number=invoice_number,
            supplier=supplier_obj,
            report_type=report_type,
            total_quantity=total_quantity,
            total_amount=total_amount,
            generated_by=request.user
        )
        
        print(f"Invoice created: {invoice_number}")

        # Generate PDF
        try:
            pdf_file = InvoicePDFGenerator.generate(
                invoice, 
                transactions, 
                report_type, 
                period_label
            )
            
            # Save PDF
            invoice.pdf_file.save(f'{invoice_number}.pdf', pdf_file, save=True)
            print(f"PDF saved successfully")
            
        except Exception as e:
            print(f"PDF Generation Error: {str(e)}")
            import traceback
            traceback.print_exc()
            # Delete the invoice if PDF generation fails
            invoice.delete()
            return Response(
                {'error': f'Failed to generate PDF: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Return response
        serializer = self.get_serializer(invoice)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='download')
    def download_invoice(self, request, pk=None):
        """Download invoice PDF"""
        invoice = self.get_object()
        
        if not invoice.pdf_file:
            return Response(
                {'error': 'PDF file not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if file exists
        if not invoice.pdf_file.storage.exists(invoice.pdf_file.name):
            return Response(
                {'error': 'PDF file not found on disk'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        response = FileResponse(
            invoice.pdf_file.open('rb'),
            content_type='application/pdf'
        )
        response['Content-Disposition'] = f'attachment; filename="{invoice.invoice_number}.pdf"'
        return response