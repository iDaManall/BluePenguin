# Inside api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'accounts', AccountViewSet, basename='account')
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'items', ItemViewSet, basename='item')
# /api/accounts/register

urlpatterns = [
    # auth routes
    path('auth/signin/', SignInView.as_view(), name='signin'),
    path('auth/signout/', SignOutView.as_view(), name='signout'),

    # include all viewset URLs under api/
    path('', include(router.urls)),
]
