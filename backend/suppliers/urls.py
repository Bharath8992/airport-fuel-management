# suppliers/urls.py - CHANGE THIS
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.SupplierViewSet, basename='supplier')  # CHANGE: Remove 'suppliers/' from here

urlpatterns = [
    path('', include(router.urls)),
]