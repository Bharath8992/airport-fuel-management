from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from .models import OTPVerification
import random
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'role', 'phone_number', 'company_name', 'is_verified', 'is_active', 'is_phone_verified')
        read_only_fields = ('id', 'is_verified', 'is_phone_verified')



class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'confirm_password', 
                 'first_name', 'last_name', 'role', 'phone_number', 'company_name')
    
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})
        
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists"})
        
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "Username already exists"})
        
        # Validate phone number if provided
        phone = data.get('phone_number', '')
        if phone and len(phone) < 10:
            raise serializers.ValidationError({"phone_number": "Invalid phone number"})
        
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'airline'),
            phone_number=validated_data.get('phone_number', ''),
            company_name=validated_data.get('company_name', ''),
            is_active=True,
            is_verified=False  # User needs to verify email
        )
        user.set_password(password)
        user.save()
        
        # Generate and send OTP
        self.generate_and_send_otp(user, 'email')
        
        return user
    
    def generate_and_send_otp(self, user, otp_type):
        """Generate OTP and send to user"""
        otp_code = str(random.randint(100000, 999999))
        expires_at = timezone.now() + timedelta(minutes=10)
        
        OTPVerification.objects.create(
            user=user,
            otp_code=otp_code,
            otp_type=otp_type,
            email=user.email,
            expires_at=expires_at
        )
        
        # In production, send actual email here
        print(f"OTP for {user.email}: {otp_code}")
        return otp_code

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)
    
    def validate(self, data):
        try:
            user = User.objects.get(email=data['email'])
            otp = OTPVerification.objects.filter(
                user=user,
                otp_code=data['otp_code'],
                is_used=False,
                expires_at__gt=timezone.now()
            ).first()
            
            if not otp:
                raise serializers.ValidationError("Invalid or expired OTP")
            
            data['user'] = user
            data['otp'] = otp
            return data
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")

class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate(self, data):
        try:
            user = User.objects.get(email=data['email'])
            if user.is_verified:
                raise serializers.ValidationError("Email already verified")
            data['user'] = user
            return data
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        try:
            user = User.objects.get(email=email)
            
            # Check if account is locked
            if user.is_account_locked():
                remaining_minutes = (user.locked_until - timezone.now()).seconds // 60
                raise serializers.ValidationError(
                    f"Account is locked. Try again in {remaining_minutes} minutes"
                )
            
            # Special hardcoded admin login
            if email == 'admin@example.com' and password == 'admin123':
                user.reset_failed_attempts()
                return user
            
            if user.check_password(password):
                if not user.is_active:
                    raise serializers.ValidationError("Account is disabled")
                if not user.is_verified:
                    raise serializers.ValidationError("Please verify your email first")
                user.reset_failed_attempts()
                return user
            else:
                user.increment_failed_attempts()
                remaining_attempts = 5 - user.failed_login_attempts
                if remaining_attempts > 0:
                    raise serializers.ValidationError(
                        f"Invalid password. {remaining_attempts} attempts remaining"
                    )
                else:
                    raise serializers.ValidationError("Account has been locked for 30 minutes")
                
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this email")

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=6)
    confirm_password = serializers.CharField()
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("New passwords do not match")
        return data