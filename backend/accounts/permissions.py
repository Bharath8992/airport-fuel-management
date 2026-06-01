from rest_framework import permissions

class IsAdminOrSupplier(permissions.BasePermission):
    """
    Custom permission to allow only admin and supplier roles to access
    """
    def has_permission(self, request, view):
        # Allow authenticated users only
        if not request.user.is_authenticated:
            return False
        
        # Admin and supplier roles have access
        return request.user.role in ['admin', 'supplier']
    
    def has_object_permission(self, request, view, obj):
        # Admin can access any object
        if request.user.role == 'admin':
            return True
        
        # Supplier can only access their own objects
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        
        # For SupplierContract objects
        if hasattr(obj, 'supplier'):
            return obj.supplier.created_by == request.user
        
        return False


class IsAdminOnly(permissions.BasePermission):
    """
    Permission to allow only admin users
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to allow only owners of an object or admin to edit it
    """
    def has_object_permission(self, request, view, obj):
        # Admin can access any object
        if request.user.role == 'admin':
            return True
        
        # Check if the user is the owner (created_by field)
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        
        # For User objects
        if hasattr(obj, 'id'):
            return obj.id == request.user.id
        
        return False