from django_filters import FilterSet, CharFilter
from .models import *

class ItemFilter(FilterSet):
    availability = CharFilter(field_name='availability', lookup_expr='iexact')
    class Meta:
        model = Item
        fields = {
            'collection__title': ['iexact'],
            'profile__account_id': ['exact'],
            'highest_bid': ['gt', 'lt']
        }