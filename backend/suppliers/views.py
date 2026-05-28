from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Supplier, SupplierContract
from .serializers import SupplierSerializer, SupplierCreateUpdateSerializer, SupplierContractSerializer

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'fuel_types']
    search_fields = ['company_name', 'contact_person', 'email', 'gst_number']
    ordering_fields = ['company_name', 'created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return SupplierCreateUpdateSerializer
        return SupplierSerializer
    
    @action(detail=True, methods=['get'])
    def contracts(self, request, pk=None):
        supplier = self.get_object()
        contracts = supplier.contracts.all()
        serializer = SupplierContractSerializer(contracts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_contract(self, request, pk=None):
        supplier = self.get_object()
        serializer = SupplierContractSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(supplier=supplier)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        supplier = self.get_object()
        supplier.status = not supplier.status
        supplier.save()
        return Response({'status': supplier.status, 'message': 'Status updated'})