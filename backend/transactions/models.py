from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
import uuid

class FuelTransaction(models.Model):
    FUEL_TYPES = (
        ('JET_A1', 'Jet A-1'),
        ('AVGAS', 'Avgas 100LL'),
        ('JET_B', 'Jet B'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('invoiced', 'Invoiced'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction_number = models.CharField(max_length=50, unique=True)
    supplier = models.ForeignKey('suppliers.Supplier', on_delete=models.PROTECT, related_name='transactions')
    airline = models.ForeignKey('airlines.Airline', on_delete=models.PROTECT, related_name='transactions')
    airport = models.ForeignKey('airports.Airport', on_delete=models.PROTECT, related_name='transactions')
    
    fuel_type = models.CharField(max_length=20, choices=FUEL_TYPES)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    price_per_liter = models.DecimalField(max_digits=10, decimal_places=2)
    
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, editable=False, default=0)
    gst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18)
    gst_amount = models.DecimalField(max_digits=12, decimal_places=2, editable=False, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, editable=False, default=0)
    
    transaction_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    invoice_number = models.CharField(max_length=50, null=True, blank=True)
    
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='transactions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'fuel_transactions'
        ordering = ['-transaction_date']
    
    def save(self, *args, **kwargs):
        self.subtotal = self.quantity * self.price_per_liter
        self.gst_amount = (self.subtotal * self.gst_rate) / 100
        self.total_amount = self.subtotal + self.gst_amount
        
        if not self.transaction_number:
            import time
            self.transaction_number = f"TRX{int(time.time())}{uuid.uuid4().hex[:6].upper()}"
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.transaction_number} - {self.supplier.company_name}"