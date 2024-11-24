from .choices import *
import random
from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now
from django.core.validators import MaxValueValidator, MinValueValidator
from django.contrib.postgres.fields import ArrayField
from django.contrib.auth.hashers import make_password, check_password

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
            self.display_icon = random.choice(avatar[0] for avatar in AVATAR_CHOICES)
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
    asking_price = models.DecimalField(max_digits=6, decimal_places=2)
    highest_bid = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    deadline = models.DateTimeField()
    date_posted = models.DateField(auto_now_add=True)
    total_bids = models.PositiveIntegerField(default=0)
    collection = models.ForeignKey(Collection, on_delete=models.SET_NULL, null=True)
    availability = models.CharField(max_length=1, choices=AVAILABILITY_CHOICES, default=AVAILABLE_CHOICE)
    winning_bid = models.OneToOneField('Bid', null=True, on_delete=models.SET_NULL, related_name='winning_item', default=None)

    def save(self, *args, **kwargs):
        if self.highest_bid is None:
            self.highest_bid = self.asking_price
        super().save(*args, **kwargs)

    def is_expired(self):
        return self.deadline < now()
    
    def is_available(self):
        return not self.is_exppired() and self.availability == AVAILABLE_CHOICE
    
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


class Transaction(models.Model):
    seller = models.OneToOneField(Account, on_delete=models.CASCADE, related_name='to_ship')
    buyer = models.OneToOneField(Account, on_delete=models.CASCADE, related_name='won')
    bid = models.OneToOneField(Bid, on_delete=models.PROTECT)
    status = models.CharField(max_length=1, choices=TRANSACTION_STATUS_CHOICES, default=PENDING_CHOICE)
    estimated_delivery = models.DateField(null=True, blank=True, default=None)
    carrier = models.CharField(null=True, blank=True, default=None)
    shipping_cost = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)


class Rating(models.Model):
    rater = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='ratings_received')
    ratee = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='ratings_given')
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], default=0)


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

class Parcel(models.Model):
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE)
    length = models.DecimalField(max_digits=5, decimal_places=2)
    width = models.DecimalField(max_digits=5, decimal_places=2)
    height = models.DecimalField(max_digits=5, decimal_places=2)
    weight = models.DecimalField(max_digits=5, decimal_places=2)
    distance_unit = models.CharField(max_length=2, choices=DISTANCE_UNIT_CHOICES, default=INCH_CHOICE)
    weight_unit = models.CharField(max_length=2, choices=WEIGHT_UNIT_CHOICES, default=POUND_CHOICE)








