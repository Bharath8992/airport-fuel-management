from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Airport
from .serializers import AirportSerializer

class AirportViewSet(viewsets.ModelViewSet):
    queryset = Airport.objects.all()
    serializer_class = AirportSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'country']
    search_fields = ['airport_name', 'airport_code', 'city']
    ordering_fields = ['airport_name', 'fuel_storage_capacity']
    
    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        airport = self.get_object()
        quantity = request.data.get('quantity', 0)
        operation = request.data.get('operation', 'add')
        
        if operation == 'add':
            airport.current_fuel_stock += quantity
        elif operation == 'deduct':
            if airport.current_fuel_stock >= quantity:
                airport.current_fuel_stock -= quantity
            else:
                return Response({'error': 'Insufficient stock'}, status=400)
        
        airport.save()
        return Response({'current_fuel_stock': airport.current_fuel_stock})