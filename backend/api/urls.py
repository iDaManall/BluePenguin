# Inside api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'accounts', AccountViewSet, basename='account')
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'items', ItemViewSet, basename='item')
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    # auth routes
    path('auth/signin/', SignInView.as_view(), name='signin'),
    path('auth/signout/', SignOutView.as_view(), name='signout'),

    # include all viewset URLs under api/
    path('', include(router.urls)),

    # explore page
    path('explore/trending-categories', shop_trending_categories, name='shop-trending-categories'),
    path('explore/recent-bids/', shop_recent_bids, name='shop-recent-bids'),
    path('shop/popular/', shop_popular_items, name='shop-popular'),
    path('shop/cheapest-popular/', shop_cheapest_in_popular, name='shop-cheapest-popular'),
    path('shop/by-rating/', shop_by_rating, name='shop-by-rating'),

]
