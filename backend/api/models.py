from django.db import models
from django.contrib.auth.models import User
from .regions import *
from django.core.validators import MaxValueValidator, MinValueValidator

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
    card_number = models.PositiveIntegerField(unique=True, primary_key=True)
    card_holder_name = models.TextField(max_length=100)
    MONTH_CHOICES = [(i,i) for i in range(1,13)]
    YEAR_CHOICES = [(i,i) for i in range(2024,2051)]
    expire_month = models.PositiveIntegerField(choices=MONTH_CHOICES)
    expire_year = models.PositiveIntegerField(choices=YEAR_CHOICES)
    cvv = models.PositiveIntegerField(unique=True)

class Address(models.Model):
    street_address = models.TextField(max_length=255)
    city = models.TextField(max_length=255)
    state = models.TextField(max_length=255, blank=True, choices=STATE_CHOICES)
    province_territory = models.TextField(max_length=255, blank=True, choices=PROVICE_TERRITORY_CHOICES)
    zip = models.PositiveIntegerField()
    country = models.TextField(max_length=255, choices=COUNTRY_CHOICES)
    
class Account(models.Model):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    username = models.CharField(max_length=20, unique=True, primary_key=True)
    STATUS_USER = 'U'
    STATUS_SUPERUSER = 'S'
    STATUS_VISITOR = 'V'
    STATUS_VIP = 'VIP'
    STATUS_CHOICES = [
        (STATUS_USER, 'User'),
        (STATUS_SUPERUSER, 'Superuser'),
        (STATUS_VISITOR, 'Visitor'),
        (STATUS_VIP, 'VIP')
    ]
    status = models.CharField(max_length=3, choices=STATUS_CHOICES, default=STATUS_VISITOR)
    email = models.EmailField(unique=True)
    dob = models.DateField(blank=True)
    card_details = models.OneToOneField(CardDetails, on_delete=models.CASCADE, null=True, blank=True)
    paypal_details = models.OneToOneField(PayPalDetails, on_delete=models.CASCADE, null=True, blank=True)
    shipping_address = models.ForeignKey(Address, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=6, decimal_places=2)
    

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Profile(models.Model):
    account = models.OneToOneField(Account, on_delete=models.PROTECT)
    display_name = models.TextField(max_length=255)
    # display_icon = URL from google cloud storage
    average_rating = models.DecimalField(max_digits=1, decimal_places=1)
    slug = models.SlugField(max_length=20, unique=True) # derive from username
    item_count = models.PositiveIntegerField(default=0)

    def save(self, *args, **kwargs):
        if not self.display_name:
            self.display_name = f"{self.account.first_name} {self.account.last_name}"
        super().save(*args, **kwargs)

class Collection(models.Model):
    title = models.TextField(max_length=255)

    def __str__(self):
        return self.title

class Item(models.Model):
    title = models.TextField(max_length=100)
    profile = models.ForeignKey(Profile, on_delete=models.PROTECT)
    # image = URL from google cloud storage
    description = models.TextField(max_length=255)
    selling_price = models.DecimalField(max_digits=6, decimal_places=2)
    highest_bid = models.DecimalField(max_digits=6, decimal_places=2)
    deadline = models.DateTimeField()
    collection = models.ForeignKey(Collection, on_delete=models.SET_NULL, null=True)
    AVAILABLE_CHOICE = 'A'
    BIDDED_OFF_CHOICE = 'B'
    AVAILABILITY_CHOICES = [
        (AVAILABLE_CHOICE, 'Available'),
        (BIDDED_OFF_CHOICE, 'Bidded Off')
    ]
    availability = models.CharField(max_length=1, choices=AVAILABILITY_CHOICES, default=AVAILABLE_CHOICE)
    winning_bid = models.OneToOneField('Bid', null=True, on_delete=models.SET_NULL, related_name='winning_item')

class Bid(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    bid_price = models.DecimalField(max_digits=6, decimal_places=2)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    time_of_bid = models.DateTimeField()
    HIGHEST_CHOICE = '1st'
    SECOND_HIGHEST_CHOICE = '2nd'
    THIRD_HIGHEST_CHOICE = '3rd'
    NOT_HIGHEST_CHOICE = 'F'
    STATUS_CHOICES = [
        (HIGHEST_CHOICE, 'Highest Bid'),
        (SECOND_HIGHEST_CHOICE, 'Second Highest Bid'),
        (THIRD_HIGHEST_CHOICE, 'Third Highest Bid'),
        (NOT_HIGHEST_CHOICE, 'Not In the Top Three')
    ]
    status = models.CharField(max_length=3, choices=STATUS_CHOICES)

class Transaction(models.Model):
    seller = models.OneToOneField(Account, on_delete=models.CASCADE, related_name='to_ship')
    buyer = models.OneToOneField(Account, on_delete=models.CASCADE, related_name='won')
    bid = models.OneToOneField(Bid, on_delete=models.PROTECT)
    PENDING_CHOICE = 'P'
    COMPLETE_CHOICE = 'C'
    STATUS_CHOICES = [
        (PENDING_CHOICE, 'Pending'),
        (COMPLETE_CHOICE, 'Complete')
    ]
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default=PENDING_CHOICE)

class Rating(models.Model):
    rater = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='ratings_received')
    ratee = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='ratings_given')
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])

class Comment(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    time_of_comment = models.DateTimeField(auto_now_add=True)
    description = models.TextField(max_length=1000)

class Save(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    time_saved = models.DateTimeField(auto_now_add=True)










