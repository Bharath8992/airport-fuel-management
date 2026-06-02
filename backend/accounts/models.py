from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
import random
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('supplier', 'Fuel Supplier'),
        ('airline', 'Airline'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='airline')
    phone_number = models.CharField(max_length=15, blank=True)
    company_name = models.CharField(max_length=200, blank=True)
    is_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'users'
        
    def __str__(self):
        return f"{self.email} ({self.role})"
    
    def is_account_locked(self):
        if self.locked_until and timezone.now() < self.locked_until:
            return True
        return False
    
    def increment_failed_attempts(self):
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= 5:
            self.locked_until = timezone.now() + timedelta(minutes=30)
        self.save()
    
    def reset_failed_attempts(self):
        self.failed_login_attempts = 0
        self.locked_until = None
        self.save()

# ... OTPVerification and UserActivity models remain the same ...

class OTPVerification(models.Model):
    OTP_TYPE_CHOICES = (
        ('email', 'Email Verification'),
        ('phone', 'Phone Verification'),
        ('password_reset', 'Password Reset'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otps')
    otp_code = models.CharField(max_length=6)
    otp_type = models.CharField(max_length=20, choices=OTP_TYPE_CHOICES)
    email = models.EmailField(null=True, blank=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'otp_verifications'
        ordering = ['-created_at']
    
    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at
    
    def __str__(self):
        return f"OTP for {self.user.email} - {self.otp_code}"

class UserActivity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    action = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True)
    details = models.JSONField(default=dict)
    
    class Meta:
        db_table = 'user_activities'
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"{self.user.email} - {self.action}"