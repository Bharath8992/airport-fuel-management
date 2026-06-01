from django.urls import path
from .views import (
    RegisterView, LoginView, ProfileView, 
    ChangePasswordView, LogoutView, CreateAdminView,
    VerifyOTPView, ResendOTPView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('create-admin/', CreateAdminView.as_view(), name='create-admin'),
]