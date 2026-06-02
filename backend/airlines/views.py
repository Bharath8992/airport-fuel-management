# airlines/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import transaction
from django.utils import timezone
from .models import Airline
from .serializers import (
    AirlineSerializer,
    AirlineListSerializer,
    AirlineDetailSerializer
)
from .filters import AirlineFilter
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class AirlineViewSet(viewsets.ModelViewSet):
    """
    Airline CRUD operations with additional actions
    
    Provides:
    - List all airlines (with filtering, searching, ordering)
    - Create new airline
    - Retrieve specific airline
    - Update airline (full/partial)
    - Delete airline
    - Toggle airline status
    - Get airline statistics
    - Bulk operations
    """
    
    queryset = Airline.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = AirlineSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = AirlineFilter
    search_fields = [
        'airline_name', 
        'airline_code',
        'contact_person', 
        'email', 
        'phone', 
        'address'
    ]
    ordering_fields = [
        'airline_name', 
        'airline_code',
        'created_at', 
        'updated_at', 
        'status',
        'credit_limit'
    ]
    ordering = ['airline_name']
    lookup_field = 'id'
    lookup_value_regex = '[0-9a-f-]+'
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return AirlineListSerializer
        elif self.action == 'retrieve':
            return AirlineDetailSerializer
        return AirlineSerializer
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    
    @swagger_auto_schema(
        operation_description="Create a new airline",
        request_body=AirlineSerializer,
        responses={
            201: openapi.Response('Airline created', AirlineSerializer),
            400: 'Bad Request',
            401: 'Unauthorized'
        }
    )
    def create(self, request, *args, **kwargs):
        """Create a new airline with validation"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        with transaction.atomic():
            airline = serializer.save()
            self._log_activity(request.user, airline, 'CREATE')
            
        return Response(
            {
                'success': True,
                'message': 'Airline created successfully',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    
    @swagger_auto_schema(
        operation_description="Update airline details",
        request_body=AirlineSerializer,
        responses={
            200: openapi.Response('Airline updated', AirlineSerializer),
            400: 'Bad Request',
            404: 'Not Found'
        }
    )
    def update(self, request, *args, **kwargs):
        """Update airline with validation"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        with transaction.atomic():
            old_status = instance.status
            airline = serializer.save()
            
            action = 'UPDATE'
            if old_status != airline.status:
                action = f'STATUS_CHANGE_{airline.status}'
            
            self._log_activity(request.user, airline, action)
            
        return Response(
            {
                'success': True,
                'message': 'Airline updated successfully',
                'data': serializer.data
            }
        )
    
    @swagger_auto_schema(
        operation_description="Delete an airline",
        responses={
            204: 'No Content',
            404: 'Not Found',
            400: 'Bad Request'
        }
    )
    def destroy(self, request, *args, **kwargs):
        """Delete airline (check for dependencies)"""
        instance = self.get_object()
        
        # Check if airline has any transactions
        # You can add transaction check here if you have transaction model
        
        with transaction.atomic():
            self._log_activity(request.user, instance, 'DELETE')
            instance.delete()
            
        return Response(
            {
                'success': True,
                'message': 'Airline deleted successfully'
            },
            status=status.HTTP_204_NO_CONTENT
        )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get airline statistics"""
        total = Airline.objects.count()
        active = Airline.objects.filter(status=True).count()
        inactive = Airline.objects.filter(status=False).count()
        total_credit = Airline.objects.aggregate(total=models.Sum('credit_limit'))['total'] or 0
        
        # Credit limit distribution
        high_credit = Airline.objects.filter(credit_limit__gte=1000000).count()
        medium_credit = Airline.objects.filter(credit_limit__gte=500000, credit_limit__lt=1000000).count()
        low_credit = Airline.objects.filter(credit_limit__lt=500000).count()
        
        return Response({
            'total': total,
            'active': active,
            'inactive': inactive,
            'total_credit_limit': total_credit,
            'credit_distribution': {
                'high': high_credit,
                'medium': medium_credit,
                'low': low_credit
            }
        })
    
    @action(detail=True, methods=['post'])
    def toggle_status(self, request, id=None):
        """Activate/Deactivate airline"""
        airline = self.get_object()
        old_status = airline.status
        airline.status = not airline.status
        airline.save()
        
        self._log_activity(
            request.user, 
            airline, 
            f'TOGGLE_STATUS_{airline.status}'
        )
        
        return Response({
            'success': True,
            'id': str(airline.id),
            'status': airline.status,
            'message': f'Airline {"activated" if airline.status else "deactivated"} successfully'
        })
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Create multiple airlines at once"""
        airlines_data = request.data.get('airlines', [])
        
        if not airlines_data:
            return Response(
                {'error': 'No airlines data provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created = []
        errors = []
        
        with transaction.atomic():
            for data in airlines_data:
                serializer = AirlineSerializer(data=data)
                if serializer.is_valid():
                    airline = serializer.save()
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
        """Delete multiple airlines"""
        airline_ids = request.data.get('ids', [])
        
        if not airline_ids:
            return Response(
                {'error': 'No airline IDs provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        airlines = Airline.objects.filter(id__in=airline_ids)
        deleted_count = airlines.count()
        
        with transaction.atomic():
            for airline in airlines:
                self._log_activity(request.user, airline, 'BULK_DELETE')
            airlines.delete()
        
        return Response({
            'success': True,
            'message': f'Successfully deleted {deleted_count} airlines',
            'deleted_count': deleted_count
        })
    
    def _log_activity(self, user, airline, action):
        """Helper method to log airline activities"""
        try:
            from apps.users.models import UserActivity
            
            UserActivity.objects.create(
                user=user,
                action=f'AIRLINE_{action}',
                ip_address=self.request.META.get('REMOTE_ADDR'),
                details={
                    'airline_id': str(airline.id),
                    'airline_name': airline.airline_name,
                    'timestamp': timezone.now().isoformat()
                }
            )
        except ImportError:
            pass