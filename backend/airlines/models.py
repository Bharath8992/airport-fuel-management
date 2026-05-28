from django.db import models
import uuid

class Airline(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    airline_name = models.CharField(max_length=200, unique=True)
    airline_code = models.CharField(max_length=3, unique=True)
    contact_person = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    address = models.TextField()
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_terms = models.IntegerField(default=30)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'airlines'
        ordering = ['airline_name']
    
    def __str__(self):
        return f"{self.airline_name} ({self.airline_code})"