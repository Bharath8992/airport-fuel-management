from django.db import models
import uuid

class Airport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    airport_name = models.CharField(max_length=200)
    airport_code = models.CharField(max_length=4, unique=True)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='India')
    runway_count = models.IntegerField(default=1)
    fuel_storage_capacity = models.DecimalField(max_digits=12, decimal_places=2)
    current_fuel_stock = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'airports'
        ordering = ['airport_name']
    
    def __str__(self):
        return f"{self.airport_name} ({self.airport_code})"