from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from .models import FuelTransaction
from .serializers import FuelTransactionSerializer, FuelTransactionCreateUpdateSerializer

class FuelTransactionViewSet(viewsets.ModelViewSet):
    queryset = FuelTransaction.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'fuel_type', 'supplier', 'airline', 'airport']
    search_fields = ['transaction_number', 'invoice_number']
    ordering_fields = ['transaction_date', 'total_amount', 'created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return FuelTransactionCreateUpdateSerializer
        return FuelTransactionSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        transaction = self.get_object()
        new_status = request.data.get('status')
        invoice_number = request.data.get('invoice_number', None)
        
        if new_status not in dict(FuelTransaction.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        transaction.status = new_status
        if invoice_number:
            transaction.invoice_number = invoice_number
        transaction.save()
        
        return Response({
            'status': transaction.status,
            'message': f'Transaction status updated to {transaction.get_status_display()}'
        })
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        total_transactions = self.queryset.count()
        total_amount = self.queryset.aggregate(total=models.Sum('total_amount'))['total'] or 0
        pending = self.queryset.filter(status='pending').count()
        completed = self.queryset.filter(status='completed').count()
        cancelled = self.queryset.filter(status='cancelled').count()
        invoiced = self.queryset.filter(status='invoiced').count()
        
        return Response({
            'total_transactions': total_transactions,
            'total_amount': total_amount,
            'pending': pending,
            'completed': completed,
            'cancelled': cancelled,
            'invoiced': invoiced,
        })