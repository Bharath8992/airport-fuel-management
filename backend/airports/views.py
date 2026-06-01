from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Airport
from .serializers import AirportSerializer, AirportCreateUpdateSerializer

class AirportViewSet(viewsets.ModelViewSet):
    queryset = Airport.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'country', 'city']
    search_fields = ['airport_name', 'airport_code', 'city', 'country']
    ordering_fields = ['airport_name', 'city', 'created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AirportCreateUpdateSerializer
        return AirportSerializer
    
    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        airport = self.get_object()
        airport.status = not airport.status
        airport.save()
        return Response({'status': airport.status, 'message': 'Status updated successfully'})
    
    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        airport = self.get_object()
        quantity = request.data.get('quantity', 0)
        operation = request.data.get('operation', 'add')  # 'add' or 'subtract'
        
        if operation == 'add':
            airport.current_fuel_stock += quantity
        else:
            airport.current_fuel_stock -= quantity
        
        airport.save()
        return Response({
            'current_fuel_stock': airport.current_fuel_stock,
            'message': f'Fuel stock {operation}ed successfully'
        })