# airports/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import transaction, models
from django.utils import timezone
from .models import Airport
from .serializers import (
    AirportSerializer,
    AirportListSerializer,
    AirportDetailSerializer
)
from .filters import AirportFilter
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class AirportViewSet(viewsets.ModelViewSet):
    """
    Airport CRUD operations with additional actions
    
    Provides:
    - List all airports (with filtering, searching, ordering)
    - Create new airport
    - Retrieve specific airport
    - Update airport (full/partial)
    - Delete airport
    - Update fuel stock
    - Toggle airport status
    - Get airport statistics
    - Bulk operations
    """
    
    queryset = Airport.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = AirportSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = AirportFilter
    search_fields = [
        'airport_name', 
        'airport_code',
        'city', 
        'country'
    ]
    ordering_fields = [
        'airport_name', 
        'airport_code',
        'city',
        'country',
        'created_at', 
        'updated_at', 
        'status',
        'fuel_storage_capacity',
        'current_fuel_stock',
        'runway_count'
    ]
    ordering = ['airport_name']
    lookup_field = 'id'
    lookup_value_regex = '[0-9a-f-]+'
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return AirportListSerializer
        elif self.action == 'retrieve':
            return AirportDetailSerializer
        return AirportSerializer
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    
    @swagger_auto_schema(
        operation_description="Create a new airport",
        request_body=AirportSerializer,
        responses={
            201: openapi.Response('Airport created', AirportSerializer),
            400: 'Bad Request',
            401: 'Unauthorized'
        }
    )
    def create(self, request, *args, **kwargs):
        """Create a new airport with validation"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        with transaction.atomic():
            airport = serializer.save()
            self._log_activity(request.user, airport, 'CREATE')
            
        return Response(
            {
                'success': True,
                'message': 'Airport created successfully',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    
    @swagger_auto_schema(
        operation_description="Update airport details",
        request_body=AirportSerializer,
        responses={
            200: openapi.Response('Airport updated', AirportSerializer),
            400: 'Bad Request',
            404: 'Not Found'
        }
    )
    def update(self, request, *args, **kwargs):
        """Update airport with validation"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        with transaction.atomic():
            old_status = instance.status
            airport = serializer.save()
            
            action = 'UPDATE'
            if old_status != airport.status:
                action = f'STATUS_CHANGE_{airport.status}'
            
            self._log_activity(request.user, airport, action)
            
        return Response(
            {
                'success': True,
                'message': 'Airport updated successfully',
                'data': serializer.data
            }
        )
    
    @swagger_auto_schema(
        operation_description="Delete an airport",
        responses={
            204: 'No Content',
            404: 'Not Found',
            400: 'Bad Request'
        }
    )
    def destroy(self, request, *args, **kwargs):
        """Delete airport (check for dependencies)"""
        instance = self.get_object()
        
        # Check if airport has any transactions
        # You can add transaction check here if you have transaction model
        
        with transaction.atomic():
            self._log_activity(request.user, instance, 'DELETE')
            instance.delete()
            
        return Response(
            {
                'success': True,
                'message': 'Airport deleted successfully'
            },
            status=status.HTTP_204_NO_CONTENT
        )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get airport statistics"""
        total = Airport.objects.count()
        active = Airport.objects.filter(status=True).count()
        inactive = Airport.objects.filter(status=False).count()
        
        total_capacity = Airport.objects.aggregate(
            total=models.Sum('fuel_storage_capacity')
        )['total'] or 0
        
        total_stock = Airport.objects.aggregate(
            total=models.Sum('current_fuel_stock')
        )['total'] or 0
        
        # Fuel level distribution
        high_fuel = Airport.objects.filter(
            current_fuel_stock__gte=models.F('fuel_storage_capacity') * 0.7
        ).count()
        medium_fuel = Airport.objects.filter(
            current_fuel_stock__gte=models.F('fuel_storage_capacity') * 0.3,
            current_fuel_stock__lt=models.F('fuel_storage_capacity') * 0.7
        ).count()
        low_fuel = Airport.objects.filter(
            current_fuel_stock__lt=models.F('fuel_storage_capacity') * 0.3
        ).count()
        
        # Country wise distribution
        country_stats = Airport.objects.values('country').annotate(
            count=models.Count('id'),
            total_capacity=models.Sum('fuel_storage_capacity')
        ).order_by('-count')
        
        return Response({
            'total': total,
            'active': active,
            'inactive': inactive,
            'total_storage_capacity': total_capacity,
            'total_current_stock': total_stock,
            'overall_usage_percentage': (total_stock / total_capacity * 100) if total_capacity > 0 else 0,
            'fuel_level_distribution': {
                'high': high_fuel,
                'medium': medium_fuel,
                'low': low_fuel
            },
            'country_distribution': country_stats
        })
    
    @action(detail=True, methods=['post'])
    def update_fuel_stock(self, request, id=None):
        """Update fuel stock for an airport"""
        airport = self.get_object()
        new_stock = request.data.get('current_fuel_stock')
        
        if new_stock is None:
            return Response(
                {'error': 'current_fuel_stock field is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            new_stock = float(new_stock)
        except ValueError:
            return Response(
                {'error': 'Invalid stock value'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_stock < 0:
            return Response(
                {'error': 'Fuel stock cannot be negative'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_stock > airport.fuel_storage_capacity:
            return Response(
                {'error': f'Fuel stock cannot exceed storage capacity ({airport.fuel_storage_capacity})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_stock = airport.current_fuel_stock
        airport.current_fuel_stock = new_stock
        airport.save()
        
        self._log_activity(
            request.user,
            airport,
            f'UPDATE_FUEL_STOCK_{new_stock}'
        )
        
        return Response({
            'success': True,
            'id': str(airport.id),
            'airport_name': airport.airport_name,
            'old_stock': old_stock,
            'new_stock': new_stock,
            'capacity': airport.fuel_storage_capacity,
            'usage_percentage': (new_stock / airport.fuel_storage_capacity) * 100,
            'message': f'Fuel stock updated from {old_stock} to {new_stock}'
        })
    
    @action(detail=True, methods=['post'])
    def toggle_status(self, request, id=None):
        """Activate/Deactivate airport"""
        airport = self.get_object()
        old_status = airport.status
        airport.status = not airport.status
        airport.save()
        
        self._log_activity(
            request.user, 
            airport, 
            f'TOGGLE_STATUS_{airport.status}'
        )
        
        return Response({
            'success': True,
            'id': str(airport.id),
            'status': airport.status,
            'message': f'Airport {"activated" if airport.status else "deactivated"} successfully'
        })
    
    @action(detail=False, methods=['get'])
    def low_fuel_alerts(self, request):
        """Get airports with low fuel stock (below 20% capacity)"""
        low_fuel_airports = Airport.objects.filter(
            current_fuel_stock__lt=models.F('fuel_storage_capacity') * 0.2
        )
        
        serializer = AirportListSerializer(low_fuel_airports, many=True)
        
        return Response({
            'count': low_fuel_airports.count(),
            'airports': serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Create multiple airports at once"""
        airports_data = request.data.get('airports', [])
        
        if not airports_data:
            return Response(
                {'error': 'No airports data provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created = []
        errors = []
        
        with transaction.atomic():
            for data in airports_data:
                serializer = AirportSerializer(data=data)
                if serializer.is_valid():
                    airport = serializer.save()
                    created.append(serializer.data)
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
        """Delete multiple airports"""
        airport_ids = request.data.get('ids', [])
        
        if not airport_ids:
            return Response(
                {'error': 'No airport IDs provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        airports = Airport.objects.filter(id__in=airport_ids)
        deleted_count = airports.count()
        
        with transaction.atomic():
            for airport in airports:
                self._log_activity(request.user, airport, 'BULK_DELETE')
            airports.delete()
        
        return Response({
            'success': True,
            'message': f'Successfully deleted {deleted_count} airports',
            'deleted_count': deleted_count
        })
    
    @action(detail=True, methods=['get'])
    def fuel_history(self, request, id=None):
        """Get fuel stock history (placeholder - implement with historical records)"""
        airport = self.get_object()
        
        # This is a placeholder. You would need a FuelStockHistory model
        return Response({
            'airport': airport.airport_name,
            'current_stock': airport.current_fuel_stock,
            'capacity': airport.fuel_storage_capacity,
            'message': 'Fuel history feature coming soon'
        })
    
    def _log_activity(self, user, airport, action):
        """Helper method to log airport activities"""
        try:
            from apps.users.models import UserActivity
            
            UserActivity.objects.create(
                user=user,
                action=f'AIRPORT_{action}',
                ip_address=self.request.META.get('REMOTE_ADDR'),
                details={
                    'airport_id': str(airport.id),
                    'airport_name': airport.airport_name,
                    'airport_code': airport.airport_code,
                    'timestamp': timezone.now().isoformat()
                }
            )
        except ImportError:
            pass