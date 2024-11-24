from rest_framework.permissions import BasePermission
from rest_framework import permissions
from .models import *
from .choices import *
    
class IsOwner(BasePermission):
    def has_object_permission(self, request, obj):
        if isinstance(obj, Profile):
            return obj.account.user == request.user
        
        elif isinstance(obj, Item):
            return obj.profile.account.user == request.user
        
        elif isinstance(obj, Account):
            return obj.user == request.user
        
        return False
    
    
class IsNotOwner(BasePermission):
    def has_object_permission(self, request, obj):
        if isinstance(obj, Profile):
            return obj.account.user != request.user
        
        elif isinstance(obj, Item):
            return obj.profile.account.user != request.user
        
        elif isinstance(obj, Account):
            return obj.user != request.user
        
        return False
    
class IsCommentOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        # obj is item
        comment_id = request.data.get('id')
        if comment_id:
            comment = Comment.objects.get(id=comment_id)
            return comment.profile.account.user == request.user
        
class IsNotCommentOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        # obj is item
        comment_id = request.data.get('id')
        if comment_id:
            comment = Comment.objects.get(id=comment_id)
            return comment.profile.account.user != request.user
        
class IsSaveOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Profile):
            return obj.account.user == request.user
        elif isinstance(obj, Item):
            return obj.profile.account.user == request.user
        return False
    
class IsNotSaveOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Profile):
            return obj.account.user != request.user
        elif isinstance(obj, Item):
            return obj.profile.account.user != request.user
        return False
    
class CanBidOn(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.availability == AVAILABLE_CHOICE
    
class IsNotVisitor(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        status = user.account.status

        return status != STATUS_VISITOR

class IsVisitor(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        status = user.account.status

        return status == STATUS_VISITOR
    
class IsSeller(BasePermission):
    def has_object_permission(self, request, view, obj):
        # obj is transaction
        return obj.bid.seller.user == request.user 

class IsNotSeller(BasePermission):
    def has_object_permission(self, request, view, obj):
        # obj is item
        return obj.profile.account.user != request.user

class IsBuyer(BasePermission):
    def has_object_permission(self, request, view, obj):
        # obj is transaction
        return obj.bid.buyer.user == request.user
    