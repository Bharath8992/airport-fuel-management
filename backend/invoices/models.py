from django.db import models
from django.conf import settings
from suppliers.models import Supplier
import uuid

class Invoice(models.Model):

    REPORT_TYPE_CHOICES = [
        ('daily', 'Daily Report'),
        ('monthly', 'Monthly Report'),
    ]

    # Keep UUID as primary key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    invoice_number = models.CharField(
        max_length=100,
        unique=True
    )

    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoices'
    )

    report_type = models.CharField(
        max_length=20,
        choices=REPORT_TYPE_CHOICES,
        default='daily'
    )

    total_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    total_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )

    pdf_file = models.FileField(
        upload_to='invoices/',
        null=True,
        blank=True
    )

    generated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'invoices'
        ordering = ['-created_at']

    def __str__(self):
        return self.invoice_number