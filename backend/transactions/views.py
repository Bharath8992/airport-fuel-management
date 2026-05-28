from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from .models import FuelTransaction
from .serializers import FuelTransactionSerializer

class FuelTransactionViewSet(viewsets.ModelViewSet):
    queryset = FuelTransaction.objects.select_related('supplier', 'airline', 'airport').all()
    serializer_class = FuelTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'fuel_type', 'supplier', 'airline']
    search_fields = ['transaction_number', 'invoice_number']
    ordering_fields = ['transaction_date', 'total_amount']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        today = timezone.now().date()
        start_of_month = today.replace(day=1)
        start_of_week = today - timedelta(days=today.weekday())
        
        stats = {
            'total_transactions': self.queryset.count(),
            'total_suppliers': self.queryset.values('supplier').distinct().count(),
            'total_airlines': self.queryset.values('airline').distinct().count(),
            'today_fuel': float(self.queryset.filter(
                transaction_date__date=today, status='completed'
            ).aggregate(total=Sum('quantity'))['total'] or 0),
            'weekly_fuel': float(self.queryset.filter(
                transaction_date__date__gte=start_of_week, status='completed'
            ).aggregate(total=Sum('quantity'))['total'] or 0),
            'monthly_revenue': float(self.queryset.filter(
                transaction_date__date__gte=start_of_month, status='completed'
            ).aggregate(total=Sum('total_amount'))['total'] or 0),
        }
        
        # Recent transactions
        recent = self.queryset.order_by('-transaction_date')[:10]
        stats['recent_transactions'] = FuelTransactionSerializer(recent, many=True).data
        
        # Weekly trend
        weekly_trend = []
        for i in range(6, -1, -1):
            date = today - timedelta(days=i)
            daily = self.queryset.filter(
                transaction_date__date=date, status='completed'
            ).aggregate(total=Sum('quantity'))['total'] or 0
            weekly_trend.append({'date': date.strftime('%Y-%m-%d'), 'fuel': float(daily)})
        
        stats['weekly_trend'] = weekly_trend
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        transaction = self.get_object()
        if transaction.status == 'cancelled':
            return Response({'error': 'Transaction already cancelled'}, status=400)
        
        # Restore fuel stock
        transaction.airport.current_fuel_stock += transaction.quantity
        transaction.airport.save()
        
        transaction.status = 'cancelled'
        transaction.save()
        
        return Response({'message': 'Transaction cancelled successfully'})