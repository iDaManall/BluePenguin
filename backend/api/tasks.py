from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Item, Bid
from .choices import *
from .utils import EmailNotifications
from django.contrib.auth.models import User


@shared_task
def check_auction_deadlines():
    
    # send relevant emails for items sold in 24h
    items_ending_in_24h = Item.objects.filter(
        deadline__lte=timezone.now() + timedelta(days=1),
        deadline__gt=timezone.now(),
        availability = AVAILABLE_CHOICE
    )

    for item in items_ending_in_24h:
        EmailNotifications.notify_deadline_24h(
            item.profile.account.user,
            item,
            is_seller=True
        )

        bidders = User.objects.filter(account__profile__bid__item=item).distinct()
        for bidder in bidders:
            EmailNotifications.notify_deadline_24h(
                bidder,
                item,
                is_seller=False
            )

    # perform proper actions for items sold
    items_ended = Item.objects.filter(
        deadline__lte=timezone.now(),
        availability=AVAILABLE_CHOICE,
    )

    for item in items_ended:
        EmailNotifications.notify_deadline_to_seller(
            item.profile.account.user,
            item,
        )

        if item.highest_bid:
            EmailNotifications.notify_bid_won(
                item.winning_bid.profile.account.user,
                item,
                item.winning_bid.bid_price,
            )