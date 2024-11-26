from .choices import *
from .utils import EmailNotifications
import random
from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now
from django.core.validators import MaxValueValidator, MinValueValidator
from django.contrib.postgres.fields import ArrayField
from django.contrib.auth.hashers import make_password, check_password
from django.db.models.aggregates import Avg
from django.db.models import Q
from supabase import Client, create_client
from django.conf import settings

# Create your models here.
class Note(models.Model):
    title = models.CharField(max_length=100) # add a title with max length 100
    content = models.TextField() # textfield for content
    created_at = models.DateTimeField(auto_now_add=True) # automatically populate whenever we make a new instance of this note
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes") # who made this note, if user gone, delete all notes this user has. Related notes allows user object to access all these note objects 

    def __str__(self):
        return self.title
    
    
class PayPalDetails(models.Model):
    paypal_email = models.EmailField(unique=True)

    def __str__(self):
        return self.paypal_email

class CardDetails(models.Model):
    card_number = models.CharField(unique=True)
    card_holder_name = models.TextField(max_length=100)
    
    MONTH_CHOICES = [(i, i) for i in range(1, 13)]
    YEAR_CHOICES = [(i, i) for i in range(2024, 2051)]
    
    expire_month = models.PositiveIntegerField(choices=MONTH_CHOICES)
    expire_year = models.PositiveIntegerField(choices=YEAR_CHOICES)
    is_valid = models.BooleanField(default=False)  # Verified through CVV



class ShippingAddress(models.Model):
    street_address = models.TextField(max_length=255)
    address_line_2 = models.TextField(max_length=255, blank=True)
    city = models.TextField(max_length=255)
    state = models.TextField(max_length=255, blank=True)
    zip = models.TextField(blank=True)
    country = models.TextField(max_length=255, choices=COUNTRY_CHOICES)

    def __str__(self):
        return f"{self.street_address} {self.city}, {self.state} {self.zip}, {self.country}"


class Account(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=3, choices=USER_STATUS_CHOICES, default=STATUS_VISITOR)
    card_details = models.OneToOneField(CardDetails, on_delete=models.CASCADE, null=True, blank=True, default=None)
    paypal_details = models.OneToOneField(PayPalDetails, on_delete=models.CASCADE, null=True, blank=True, default=None)
    shipping_address = models.ForeignKey(ShippingAddress, on_delete=models.CASCADE, null=True, blank=True, default=None)
    balance = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, default=0.00)
    is_suspended = models.BooleanField(default=False)
    suspension_fine_paid = models.BooleanField(default=False)
    suspension_strikes = models.PositiveIntegerField(default=0)
    points = models.PositiveIntegerField(null=True, blank=True, default=0)

    def delete_account_user_profile(self):
        try:
            user = self.user 

            supabase = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY,
            )

            for user_data in supabase.auth.admin.list_users():
                if user_data.email == self.user.email:
                    supabase.auth.admin.delete_user(user_data.id)
                    break

            self.profile.delete()

            self.delete()

            user.delete()

            return True
        except:
            return False
        
    def become_VIP(self):
        if self.status == STATUS_USER:
            self.status = STATUS_VIP
            self.save()
    
    def revoke_VIP(self):
        if self.status == STATUS_VIP:
            self.status = STATUS_USER
            self.save()

    def check_vip_eligibility(self):
        transaction_count = Transaction.objects.filter(
                Q(seller=self) | Q(buyer=self)
        ).count()

        has_reports = Report.objects.filter(reportee=self.profile).exists()
        balance_sufficient = self.balance > 5000

        if self.status == STATUS_USER and transaction_count > 5 and not has_reports and balance_sufficient:
            self.become_VIP()
            EmailNotifications.notify_VIP_status_earned(self.user)
        elif self.status == STATUS_VIP:
            if has_reports or not balance_sufficient:
                self.revoke_VIP()
                EmailNotifications.notify_VIP_status_revoked(self.user)

    def get_VIP_discount(self, actual_price):
        if self.status == STATUS_VIP:
            # get a 10% discount ; means that you get 10% of the price added back to balance
            new_price = actual_price * 0.10
            self.balance += new_price
            self.save()
    
    # amount is amount paid during transaction
    def update_points(self, amount):
        points_earned = amount
        total_points = self.points
        total_points += points_earned
        self.points = total_points
        self.save()
        

    '''
    def set_password(self, user_password):
        self.password = make_password(user_password)
    
    def check_user_password(self, user_password):
        return check_password(user_password, self.password)
    '''


class Profile(models.Model):    
    account = models.OneToOneField(Account, on_delete=models.PROTECT)
    display_name = models.TextField(max_length=255)
    display_icon = models.URLField(max_length=255, blank=True, null=True, choices=AVATAR_CHOICES, default=None)
    average_rating = models.DecimalField(max_digits=1, decimal_places=1, default=0.0)
    item_count = models.PositiveIntegerField(default=0)
    description = models.TextField(max_length=255, blank=True, null=True)
    
    def save(self, *args, **kwargs):
        if self.display_icon is None:
            avatar_choices = [avatar[0] for avatar in AVATAR_CHOICES]
            self.display_icon = random.choice(avatar_choices)
        super().save(*args, **kwargs)


class Collection(models.Model):
    title = models.TextField(max_length=255)

    def __str__(self):
        return self.title


class Item(models.Model):
    title = models.TextField(max_length=100)
    image_urls = models.JSONField(default=list)
    profile = models.ForeignKey(Profile, on_delete=models.PROTECT)
    description = models.TextField(max_length=255)
    selling_price = models.DecimalField(max_digits=6, decimal_places=2) # asking_price
    highest_bid = models.DecimalField(max_digits=6, decimal_places=2, default=0.00) # before the deadline
    deadline = models.DateTimeField()
    date_posted = models.DateField(auto_now_add=True)
    total_bids = models.PositiveIntegerField(default=0)
    collection = models.ForeignKey(Collection, on_delete=models.SET_NULL, null=True)
    availability = models.CharField(max_length=1, choices=AVAILABILITY_CHOICES, default=AVAILABLE_CHOICE)
    winning_bid = models.OneToOneField('Bid', null=True, on_delete=models.SET_NULL, related_name='winning_item', default=None)
    minimum_bid = models.DecimalField(max_digits=10, decimal_places=2,help_text="Minimum bid amount allowed", default=1.00)
    maximum_bid = models.DecimalField(max_digits=10, decimal_places=2,help_text="Maximum bid amount allowed", default=1000000.00)
    def save(self, *args, **kwargs):
        if self.highest_bid is None:
            self.highest_bid = self.selling_price
        super().save(*args, **kwargs)

    def is_expired(self):
        return self.deadline < now()
    
    def is_available(self):
        return not self.is_expired() and self.availability == AVAILABLE_CHOICE
    
    def select_winning_bid(self):
        if self.is_expired() and self.total_bids > 0:
            winning_bid = Bid.objects.filter(
                item=self,
                bid_price=self.highest_bid
            ).order_by('time_of_bid').first()

            if winning_bid:
                self.winning_bid = winning_bid
                self.availability = SOLD_CHOICE
                self.save()
                return winning_bid
        return None
    

class Bid(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    bid_price = models.DecimalField(max_digits=6, decimal_places=2)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    time_of_bid = models.DateTimeField()
    status = models.CharField(max_length=3, choices=BID_STATUS_CHOICES)
    winner_status = models.CharField(max_length=1, choices=WINNING_STATUS_CHOICES, default=WINNING_INELIGIBLE_CHOICE)


class Transaction(models.Model):
    seller = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='to_ship')
    buyer = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='won')
    bid = models.OneToOneField(Bid, on_delete=models.PROTECT)
    status = models.CharField(max_length=1, choices=TRANSACTION_STATUS_CHOICES, default=PENDING_CHOICE)
    estimated_delivery = models.DateField(null=True, blank=True, default=None)
    carrier = models.CharField(null=True, blank=True, default=None)
    shipping_cost = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)


class Rating(models.Model):
    rater = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='ratings_given')
    ratee = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='ratings_received')
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], default=0)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        ratee = self.ratee
        ratee_user = ratee.account.user
        ratings = Rating.objects.filter(ratee=ratee)

        if ratings.count() >= 3:
            avg_rating = ratings.aggregate(Avg('rating'))['rating__avg']
            is_vip = False
            if avg_rating < 2 or avg_rating > 4:
                if ratee.account.status == STATUS_VIP:
                    ratee.account.status = STATUS_USER
                    is_vip = True
                else:
                    ratee.account.is_suspended = True

                ratee.account.suspension_strikes += 1

                ratee_items = Item.objects.filter(profile=ratee)
                ratee_items.delete()
                ratee.account.save()

                buyers = Transaction.objects.filter(seller=ratee).select_related('buyer__user').values_list('buyer__user', flat=True).distinct()
                for buyer in buyers:
                    items = Transaction.objects.filter(seller=ratee, buyer__user=buyer).select_related('bid__item').values_list('bid__item__title', flat=True)
                    item_titles = list(items)
                    EmailNotifications.notify_items_deleted(buyer, item_titles)

                reason = "Average rating has reached less than 2 -- Too mean." if avg_rating < 2 else "Average rating has reached greater than 4 -- Too generous."
                EmailNotifications.notify_account_suspended(ratee_user, reason, is_vip)

                if ratee.account.suspension_strikes >= 3:
                    EmailNotifications.notify_account_permanently_suspended(ratee_user)
                    ratee.account.delete_account_user_profile()
    

class Comment(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    date_of_comment = models.DateTimeField(auto_now_add=True)
    time_of_comment = models.TimeField(auto_now_add=True)
    text = models.TextField(max_length=1000)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')

class Like(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="likes")
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name="likes")

class Dislike(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="dislikes")
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name="dislikes")

class Save(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, default=None)
    time_saved = models.DateTimeField(auto_now_add=True)

class Report(models.Model):
    reporter = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='reports_given')
    reportee = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='reports_received')
    report = models.TextField(max_length=1000)
    status = models.CharField(max_length=1, choices=REQUEST_STATUS_CHOICES, default=REQUEST_PENDING_CHOICE)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        reportee = self.reportee
        reportee.account.check_vip_eligibility()

        reporter_user = self.reporter.account.user
        EmailNotifications.notify_report_received(reporter_user)

class Parcel(models.Model):
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE)
    length = models.DecimalField(max_digits=5, decimal_places=2)
    width = models.DecimalField(max_digits=5, decimal_places=2)
    height = models.DecimalField(max_digits=5, decimal_places=2)
    weight = models.DecimalField(max_digits=5, decimal_places=2)
    distance_unit = models.CharField(max_length=2, choices=DISTANCE_UNIT_CHOICES, default=INCH_CHOICE)
    weight_unit = models.CharField(max_length=2, choices=WEIGHT_UNIT_CHOICES, default=POUND_CHOICE)

class QuitRequest(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    reason = models.TextField(max_length=1000)
    status = models.CharField(max_length=1, choices=REQUEST_STATUS_CHOICES, default=REQUEST_PENDING_CHOICE)

class UserApplication(models.Model):
    account = models.ForeignKey('Account', on_delete=models.CASCADE)
    status = models.CharField(
        max_length=1,
        choices=REQUEST_STATUS_CHOICES,
        default=REQUEST_PENDING_CHOICE
    )
    captcha_completed = models.BooleanField(default=False)
    time_of_application = models.DateTimeField(auto_now_add=True)

