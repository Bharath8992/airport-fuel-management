# transactions/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import transaction as db_transaction
from django.db import models
from django.utils import timezone
from .models import FuelTransaction
from .serializers import (
    FuelTransactionSerializer,
    FuelTransactionListSerializer,
    FuelTransactionDetailSerializer
)
from .filters import FuelTransactionFilter
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class FuelTransactionViewSet(viewsets.ModelViewSet):
    """
    Fuel Transaction CRUD operations with additional actions
    
    Provides:
    - List all transactions (with filtering, searching, ordering)
    - Create new transaction
    - Retrieve specific transaction
    - Update transaction
    - Delete transaction
    - Update transaction status
    - Generate invoice
    - Get transaction statistics
    - Bulk operations
    """
    
    queryset = FuelTransaction.objects.select_related(
        'supplier', 'airline', 'airport', 'created_by'
    ).all()
    permission_classes = [IsAuthenticated]
    serializer_class = FuelTransactionSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = FuelTransactionFilter
    search_fields = [
        'transaction_number', 
        'invoice_number',
        'supplier__company_name',
        'airline__airline_name',
        'airport__airport_name'
    ]
    ordering_fields = [
        'transaction_number',
        'transaction_date',
        'quantity',
        'total_amount',
        'status',
        'created_at'
    ]
    ordering = ['-transaction_date']
    lookup_field = 'id'
    lookup_value_regex = '[0-9a-f-]+'
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return FuelTransactionListSerializer
        elif self.action == 'retrieve':
            return FuelTransactionDetailSerializer
        return FuelTransactionSerializer
    
    def perform_create(self, serializer):
        """Set created_by on create"""
        serializer.save(created_by=self.request.user)
    
    @swagger_auto_schema(
        operation_description="Create a new fuel transaction",
        request_body=FuelTransactionSerializer,
        responses={
            201: openapi.Response('Transaction created', FuelTransactionSerializer),
            400: 'Bad Request',
            401: 'Unauthorized'
        }
    )
    def create(self, request, *args, **kwargs):
        """Create a new transaction with validation"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        with db_transaction.atomic():
            transaction = serializer.save(created_by=request.user)
            self._log_activity(request.user, transaction, 'CREATE')
            
        return Response(
            {
                'success': True,
                'message': 'Transaction created successfully',
                'data': FuelTransactionDetailSerializer(transaction).data
            },
            status=status.HTTP_201_CREATED
        )
    
    @swagger_auto_schema(
        operation_description="Update transaction details",
        request_body=FuelTransactionSerializer,
        responses={
            200: openapi.Response('Transaction updated', FuelTransactionSerializer),
            400: 'Bad Request',
            404: 'Not Found'
        }
    )
    def update(self, request, *args, **kwargs):
        """Update transaction with validation"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Check if transaction can be updated
        if instance.status in ['completed', 'invoiced']:
            return Response(
                {
                    'success': False,
                    'message': f"Cannot update transaction with status '{instance.status}'"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        with db_transaction.atomic():
            transaction = serializer.save()
            self._log_activity(request.user, transaction, 'UPDATE')
            
        return Response(
            {
                'success': True,
                'message': 'Transaction updated successfully',
                'data': FuelTransactionDetailSerializer(transaction).data
            }
        )
    
    @swagger_auto_schema(
        operation_description="Delete a transaction",
        responses={
            204: 'No Content',
            404: 'Not Found',
            400: 'Bad Request'
        }
    )
    def destroy(self, request, *args, **kwargs):
        """Delete transaction and restore fuel stock"""
        instance = self.get_object()
        
        # Check if transaction can be deleted
        if instance.status in ['completed', 'invoiced']:
            return Response(
                {
                    'success': False,
                    'message': f"Cannot delete transaction with status '{instance.status}'"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with db_transaction.atomic():
            # Restore fuel stock
            airport = instance.airport
            airport.current_fuel_stock += instance.quantity
            airport.save()
            
            self._log_activity(request.user, instance, 'DELETE')
            instance.delete()
            
        return Response(
            {
                'success': True,
                'message': 'Transaction deleted successfully'
            },
            status=status.HTTP_204_NO_CONTENT
        )
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, id=None):
        """Update transaction status"""
        transaction = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'Status field is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_status not in dict(FuelTransaction.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status value'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = transaction.status
        
        with db_transaction.atomic():
            transaction.status = new_status
            
            # Auto-generate invoice number when status changes to invoiced
            if new_status == 'invoiced' and not transaction.invoice_number:
                transaction.invoice_number = self._generate_invoice_number()
            
            transaction.save()
            
            self._log_activity(
                request.user,
                transaction,
                f'STATUS_CHANGE_{old_status}_TO_{new_status}'
            )
        
        return Response({
            'success': True,
            'id': str(transaction.id),
            'old_status': old_status,
            'new_status': new_status,
            'invoice_number': transaction.invoice_number,
            'message': f'Transaction status updated from {old_status} to {new_status}'
        })
    
    @action(detail=True, methods=['post'])
    def generate_invoice(self, request, id=None):
        """Generate invoice for transaction"""
        transaction = self.get_object()
        
        if transaction.invoice_number:
            return Response({
                'success': False,
                'message': f'Invoice already exists: {transaction.invoice_number}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        with db_transaction.atomic():
            transaction.invoice_number = self._generate_invoice_number()
            transaction.status = 'invoiced'
            transaction.save()
            
            self._log_activity(request.user, transaction, 'GENERATE_INVOICE')
        
        return Response({
            'success': True,
            'invoice_number': transaction.invoice_number,
            'message': 'Invoice generated successfully'
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get transaction statistics"""
        # Basic stats
        total_transactions = FuelTransaction.objects.count()
        total_completed = FuelTransaction.objects.filter(status='completed').count()
        total_pending = FuelTransaction.objects.filter(status='pending').count()
        total_cancelled = FuelTransaction.objects.filter(status='cancelled').count()
        total_invoiced = FuelTransaction.objects.filter(status='invoiced').count()
        
        # Financial stats
        total_revenue = FuelTransaction.objects.filter(
            status__in=['completed', 'invoiced']
        ).aggregate(total=models.Sum('total_amount'))['total'] or 0
        
        total_quantity = FuelTransaction.objects.filter(
            status__in=['completed', 'invoiced']
        ).aggregate(total=models.Sum('quantity'))['total'] or 0
        
        # Monthly stats
        current_month = timezone.now().month
        current_year = timezone.now().year
        
        monthly_revenue = FuelTransaction.objects.filter(
            status__in=['completed', 'invoiced'],
            transaction_date__year=current_year,
            transaction_date__month=current_month
        ).aggregate(total=models.Sum('total_amount'))['total'] or 0
        
        # Fuel type distribution
        fuel_type_stats = FuelTransaction.objects.filter(
            status__in=['completed', 'invoiced']
        ).values('fuel_type').annotate(
            total_quantity=models.Sum('quantity'),
            total_revenue=models.Sum('total_amount')
        )
        
        # Supplier stats
        top_suppliers = FuelTransaction.objects.filter(
            status__in=['completed', 'invoiced']
        ).values('supplier__company_name').annotate(
            total_quantity=models.Sum('quantity')
        ).order_by('-total_quantity')[:5]
        
        return Response({
            'overview': {
                'total_transactions': total_transactions,
                'completed': total_completed,
                'pending': total_pending,
                'cancelled': total_cancelled,
                'invoiced': total_invoiced
            },
            'financial': {
                'total_revenue': total_revenue,
                'monthly_revenue': monthly_revenue,
                'total_quantity_liters': total_quantity
            },
            'fuel_type_distribution': fuel_type_stats,
            'top_suppliers': top_suppliers
        })
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Create multiple transactions at once"""
        transactions_data = request.data.get('transactions', [])
        
        if not transactions_data:
            return Response(
                {'error': 'No transactions data provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created = []
        errors = []
        
        with db_transaction.atomic():
            for data in transactions_data:
                serializer = FuelTransactionSerializer(data=data)
                if serializer.is_valid():
                    transaction = serializer.save(created_by=request.user)
                    created.append(FuelTransactionDetailSerializer(transaction).data)
                else:
                    errors.append({
                        'data': data,
                        'errors': serializer.errors
                    })
        
        return Response({
            'success': True,
            'created_count': len(created),
            'error_count': len(errors),
            'created': created,
            'errors': errors
        })
    
    @action(detail=False, methods=['delete'])
    def bulk_delete(self, request):
        """Delete multiple transactions"""
        transaction_ids = request.data.get('ids', [])
        
        if not transaction_ids:
            return Response(
                {'error': 'No transaction IDs provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        transactions = FuelTransaction.objects.filter(
            id__in=transaction_ids,
            status__in=['pending']
        )
        
        deleted_count = transactions.count()
        
        if deleted_count != len(transaction_ids):
            return Response(
                {
                    'success': False,
                    'message': 'Some transactions cannot be deleted (only pending transactions can be deleted)'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with db_transaction.atomic():
            # Restore fuel stock for deleted transactions
            for transaction in transactions:
                airport = transaction.airport
                airport.current_fuel_stock += transaction.quantity
                airport.save()
                self._log_activity(request.user, transaction, 'BULK_DELETE')
            
            transactions.delete()
        
        return Response({
            'success': True,
            'message': f'Successfully deleted {deleted_count} transactions',
            'deleted_count': deleted_count
        })
    
    def _generate_invoice_number(self):
        """Generate unique invoice number"""
        import time
        import uuid
        return f"INV{int(time.time())}{uuid.uuid4().hex[:6].upper()}"
    
    def _log_activity(self, user, transaction, action):
        """Helper method to log transaction activities"""
        try:
            from apps.users.models import UserActivity
            
            UserActivity.objects.create(
                user=user,
                action=f'TRANSACTION_{action}',
                ip_address=self.request.META.get('REMOTE_ADDR'),
                details={
                    'transaction_id': str(transaction.id),
                    'transaction_number': transaction.transaction_number,
                    'amount': str(transaction.total_amount),
                    'timestamp': timezone.now().isoformat()
                }
            )
        except ImportError:
            pass