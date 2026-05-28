from django.db import models
from django.core.files import File
from io import BytesIO
import uuid

class Invoice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(max_length=50, unique=True)
    transaction = models.OneToOneField('transactions.FuelTransaction', on_delete=models.CASCADE)
    pdf_file = models.FileField(upload_to='invoices/', null=True, blank=True)
    generated_at = models.DateTimeField(auto_now_add=True)
    generated_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    
    class Meta:
        db_table = 'invoices'
        ordering = ['-generated_at']
    
    def __str__(self):
        return self.invoice_number