# suppliers/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'suppliers', views.SupplierViewSet, basename='supplier')  # Add 'suppliers' prefix here

urlpatterns = [
    path('', include(router.urls)),
]