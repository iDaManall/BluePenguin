from rest_framework.permissions import BasePermission
from rest_framework import permissions
from .models import *
    
class IsOwner(BasePermission):
    def has_object_permission(self, request, obj):
        if isinstance(obj, Profile):
            return obj.account.user == request.user
        
        elif isinstance(obj, (Item, Comment)):
            return obj.profile.account.user == request.user
        
        elif isinstance(obj, Account):
            return obj.user == request.user
        
        return False
    
    
class IsNotOwner(BasePermission):
    def has_object_permission(self, request, obj):
        if isinstance(obj, Profile):
            return obj.account.user != request.user
        
        elif isinstance(obj, (Item, Comment, Save)):
            return obj.profile.account.user != request.user
        
        elif isinstance(obj, Account):
            return obj.user != request.user
        
        return False
    
class CanBidOn(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.availability == 'A'
    
class IsNotVisitor(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        status = user.account.status

        return status != 'V'