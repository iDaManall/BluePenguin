from rest_framework.permissions import BasePermission
from rest_framework import permissions
from .models import *
from .choices import *
from django.conf import settings
import jwt
from jwt.exceptions import InvalidTokenError
    
class IsOwner(BasePermission):
    def has_object_permission(self, request, obj):
        if isinstance(obj, Profile):
            return obj.account.user == request.user
        
        elif isinstance(obj, Item):
            return obj.profile.account.user == request.user
        
        elif isinstance(obj, Account):
            return obj.user == request.user
        
        return False
    
'''    
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
'''

class IsSeller(BasePermission):
    def has_object_permission(self, request, view, obj):
        # obj is transaction
        return obj.bid.seller.user == request.user 
'''
class IsNotSeller(BasePermission):
    def has_object_permission(self, request, view, obj):
        # obj is item
        return obj.profile.account.user != request.user
'''

class IsBuyer(BasePermission):
    def has_object_permission(self, request, view, obj):
        # obj is transaction
        return obj.bid.buyer.user == request.user

'''
class IsNotSuspended(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        account = user.account
        return account.is_suspended == False

class IsSuspended(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        account = user.account
        return account.is_suspended == True

class IsSupabaseAuthenticated(permissions.BasePermission):
    def has_permission(self, request, view):
        try:
            # Get the auth header
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return False

            # Extract token
            token = auth_header.split(' ')[1]

            # Verify token with Supabase public key
            # You'll need to add SUPABASE_JWT_PUBLIC_KEY to your settings
            decoded = jwt.decode(
                token,
                settings.SUPABASE_JWT_PUBLIC_KEY,
                algorithms=['RS256'],
                audience='authenticated'
            )

            # Check if the user in the token matches request.user
            if str(request.user.email) != decoded.get('email'):
                return False

            return True

        except InvalidTokenError:
            return False
        except Exception:
            return False
'''