# suppliers/permissions.py
from rest_framework import permissions
from .models import Supplier, SupplierContract

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class IsSupplierOrAdmin(permissions.BasePermission):
    """
    Allows access to supplier users for their own data, admin for all.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if request.user.role == 'admin':
            return True
        
        if request.user.role == 'supplier':
            # For supplier-specific views
            if view.action in ['retrieve', 'update', 'partial_update']:
                supplier_id = view.kwargs.get('pk')
                try:
                    supplier = Supplier.objects.get(id=supplier_id)
                    return supplier.email == request.user.email
                except Supplier.DoesNotExist:
                    return False
            return view.action in ['list', 'stats']
        
        return False