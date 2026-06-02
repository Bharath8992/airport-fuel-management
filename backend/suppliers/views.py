# suppliers/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from .models import Supplier, SupplierContract
from .serializers import (
    SupplierSerializer, 
    SupplierContractSerializer,
    SupplierListSerializer,
    SupplierDetailSerializer
)
from .permissions import IsAdminUser
from .filters import SupplierFilter
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class SupplierViewSet(viewsets.ModelViewSet):
    """
    Supplier CRUD operations with additional actions
    """
    
    queryset = Supplier.objects.all()
    permission_classes = [IsAuthenticated]  # Change to IsAuthenticated
    serializer_class = SupplierSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = SupplierFilter
    search_fields = [
        'company_name', 
        'contact_person', 
        'email', 
        'phone', 
        'gst_number',
        'address'
    ]
    ordering_fields = [
        'company_name', 
        'created_at', 
        'updated_at', 
        'status'
    ]
    ordering = ['company_name']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return SupplierListSerializer
        elif self.action == 'retrieve':
            return SupplierDetailSerializer
        return SupplierSerializer
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Only admin can modify, but user must be authenticated
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]  # All actions require authentication
        return [permission() for permission in permission_classes]
    
    # suppliers/views.py - Update the create method
@swagger_auto_schema(
    operation_description="Create a new supplier",
    request_body=SupplierSerializer,
    responses={
        201: openapi.Response('Supplier created', SupplierSerializer),
        400: 'Bad Request',
        401: 'Unauthorized'
    }
)
def create(self, request, *args, **kwargs):
    """Create a new supplier with validation"""
    print("Request data:", request.data)  # Debug print
    serializer = self.get_serializer(data=request.data)
    
    if not serializer.is_valid():
        print("Serializer errors:", serializer.errors)  # Debug print
        return Response(
            {
                'success': False,
                'errors': serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    with transaction.atomic():
        supplier = serializer.save()
        
        # Log activity
        self._log_activity(request.user, supplier, 'CREATE')
        
    return Response(
        {
            'success': True,
            'message': 'Supplier created successfully',
            'data': serializer.data
        },
        status=status.HTTP_201_CREATED
    )
    
    @swagger_auto_schema(
        operation_description="Update supplier details",
        request_body=SupplierSerializer,
        responses={
            200: openapi.Response('Supplier updated', SupplierSerializer),
            400: 'Bad Request',
            404: 'Not Found'
        }
    )
    def update(self, request, *args, **kwargs):
        """Update supplier with validation"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        with transaction.atomic():
            old_status = instance.status
            supplier = serializer.save()
            
            # Log activity with status change if applicable
            action = 'UPDATE'
            if old_status != supplier.status:
                action = f'STATUS_CHANGE_{supplier.status}'
            
            self._log_activity(request.user, supplier, action)
            
        return Response(
            {
                'success': True,
                'message': 'Supplier updated successfully',
                'data': serializer.data
            }
        )
    
    @swagger_auto_schema(
        operation_description="Delete a supplier",
        responses={
            204: 'No Content',
            404: 'Not Found',
            400: 'Bad Request'
        }
    )
    def destroy(self, request, *args, **kwargs):
        """Delete supplier (soft delete by checking contracts)"""
        instance = self.get_object()
        
        # Check if supplier has any active contracts
        if instance.contracts.filter(is_active=True).exists():
            return Response(
                {
                    'success': False,
                    'message': 'Cannot delete supplier with active contracts. Deactivate contracts first.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            self._log_activity(request.user, instance, 'DELETE')
            instance.delete()
            
        return Response(
            {
                'success': True,
                'message': 'Supplier deleted successfully'
            },
            status=status.HTTP_204_NO_CONTENT
        )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get supplier statistics"""
        total = Supplier.objects.count()
        active = Supplier.objects.filter(status=True).count()
        inactive = Supplier.objects.filter(status=False).count()
        total_contracts = SupplierContract.objects.filter(
            is_active=True
        ).count()
        
        # Fuel type distribution
        fuel_type_stats = {}
        for supplier in Supplier.objects.all():
            for fuel_type in supplier.fuel_types:
                fuel_type_stats[fuel_type] = fuel_type_stats.get(fuel_type, 0) + 1
        
        return Response({
            'total': total,
            'active': active,
            'inactive': inactive,
            'total_contracts': total_contracts,
            'fuel_type_distribution': fuel_type_stats
        })
    
    @action(detail=True, methods=['get'])
    def contracts(self, request, pk=None):
        """Get all contracts for a supplier"""
        supplier = self.get_object()
        contracts = supplier.contracts.all()
        
        # Filter active/inactive if requested
        active_filter = request.query_params.get('active')
        if active_filter is not None:
            contracts = contracts.filter(is_active=active_filter.lower() == 'true')
        
        serializer = SupplierContractSerializer(contracts, many=True)
        return Response({
            'supplier': supplier.company_name,
            'total': contracts.count(),
            'contracts': serializer.data
        })
    
    @swagger_auto_schema(
        method='post',
        request_body=SupplierContractSerializer,
        responses={
            201: 'Contract created',
            400: 'Bad Request'
        }
    )
    @action(detail=True, methods=['post'])
    def add_contract(self, request, pk=None):
        """Add a contract to supplier"""
        supplier = self.get_object()
        serializer = SupplierContractSerializer(data=request.data)
        
        if serializer.is_valid():
            with transaction.atomic():
                contract = serializer.save(supplier=supplier)
                self._log_activity(request.user, supplier, 'ADD_CONTRACT')
                
            return Response(
                {
                    'success': True,
                    'message': 'Contract added successfully',
                    'data': serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {
                'success': False,
                'errors': serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        """Activate/Deactivate supplier"""
        supplier = self.get_object()
        old_status = supplier.status
        supplier.status = not supplier.status
        supplier.save()
        
        self._log_activity(
            request.user, 
            supplier, 
            f'TOGGLE_STATUS_{supplier.status}'
        )
        
        return Response({
            'success': True,
            'id': supplier.id,
            'status': supplier.status,
            'message': f'Supplier {"activated" if supplier.status else "deactivated"} successfully'
        })
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Create multiple suppliers at once"""
        suppliers_data = request.data.get('suppliers', [])
        
        if not suppliers_data:
            return Response(
                {'error': 'No suppliers data provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created = []
        errors = []
        
        with transaction.atomic():
            for data in suppliers_data:
                serializer = SupplierSerializer(data=data)
                if serializer.is_valid():
                    supplier = serializer.save()
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
        """Delete multiple suppliers"""
        supplier_ids = request.data.get('ids', [])
        
        if not supplier_ids:
            return Response(
                {'error': 'No supplier IDs provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        suppliers = Supplier.objects.filter(id__in=supplier_ids)
        deleted_count = suppliers.count()
        
        # Check for suppliers with active contracts
        suppliers_with_contracts = []
        for supplier in suppliers:
            if supplier.contracts.filter(is_active=True).exists():
                suppliers_with_contracts.append(supplier.company_name)
        
        if suppliers_with_contracts:
            return Response(
                {
                    'error': 'Some suppliers have active contracts',
                    'suppliers': suppliers_with_contracts
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            for supplier in suppliers:
                self._log_activity(request.user, supplier, 'BULK_DELETE')
            suppliers.delete()
        
        return Response({
            'success': True,
            'message': f'Successfully deleted {deleted_count} suppliers',
            'deleted_count': deleted_count
        })
    
    def _log_activity(self, user, supplier, action):
        """Helper method to log supplier activities"""
        try:
            from apps.users.models import UserActivity
            from django.utils import timezone
            
            UserActivity.objects.create(
                user=user,
                action=f'SUPPLIER_{action}',
                ip_address=self.request.META.get('REMOTE_ADDR'),
                details={
                    'supplier_id': str(supplier.id),
                    'supplier_name': supplier.company_name,
                    'timestamp': timezone.now().isoformat()
                }
            )
        except ImportError:
            # If UserActivity model doesn't exist, just pass
            pass