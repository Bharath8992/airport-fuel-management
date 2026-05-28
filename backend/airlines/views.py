from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Airline
from .serializers import AirlineSerializer

class AirlineViewSet(viewsets.ModelViewSet):
    queryset = Airline.objects.all()
    serializer_class = AirlineSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['airline_name', 'airline_code', 'contact_person', 'email']
    ordering_fields = ['airline_name', 'credit_limit']
    
    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        airline = self.get_object()
        airline.status = not airline.status
        airline.save()
        return Response({'status': airline.status, 'message': 'Status updated'})