from django.contrib.auth.models import User
from rest_framework import serializers
from .models import *
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.urls import reverse

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}} # tells django we want to accept password when creating new user, but not return password when giving info about user

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data) # ** splitting up keyword arguments and passing such as dictionary
        return user
    

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author": {"read_only": True}} # we only read who the author is, not write

class CardDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CardDetails
        fields = ["card_number", "card_holder_name", "expire_month", "expire_year", "cvv"]

class PayPalDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayPalDetails
        fields = ["paypal_email"]

class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = ["street_address", "city", "state", "province_territory", "zip", "country"]
    
# first thing is visitor sign up
class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ["first_name", "last_name", "username", "status", "email", "dob", "card_details", "paypal_details", "shipping_address", "balance"]
        extra_kwargs = {"status": {"read_only":True}, "balance": {"read_only": True}, "password": {"write_only": True}}

    # create new account 
    def create(self, validated_data):
        # you don't want to create a new account with the card details, paypal details, and shipping address
        card_details_data = validated_data.pop("card_details", None)
        paypal_details_data = validated_data.pop("paypal_details", None)
        shipping_address_data = validated_data.pop("shipping_address", None)

        # obtain other validated data 
        first_name = validated_data['first_name']
        last_name = validated_data['last_name']
        email = validated_data['email']
        username = validated_data['username'] # including this in case

        # create account
        account = Account.objects.create(**validated_data) # Note: **validated_data refers to everything you just validated

        # create card details
        if card_details_data:
            card_details = CardDetails.objects.create(**card_details_data)
            account.card_details = card_details
        
        # create paypal details
        if paypal_details_data:
            paypal_details = PayPalDetails.objects.create(**paypal_details_data)
            account.paypal_details = paypal_details

        # create shipping address
        if shipping_address_data:
            shipping_address = ShippingAddress.objects.create(**shipping_address_data)
            account.shipping_address = shipping_address

        # set password
        password = validated_data['password']
        account.set_password(password)
        account.save()

        # send verification email to user
        token = default_token_generator.make_token(account)
        uid = urlsafe_base64_encode(force_bytes(account.pk))
        verification = reverse("verify-email", kwargs={"uidb64": uid, "token": token})
        verification_link = f"http://localhost:8000{verification}"

        send_mail(
            f'Welcome {first_name} {last_name} to Blue Penguin!',
            f'To become a visitor, please click the link below to verify your email address:\n\n{verification_link}',
            'from Blue Penguin Team',
            [email], 
            fail_silently=False
        )

        return account
    
    def update(self, instance, validated_data):
        card_details_data = validated_data.pop("card_details", None)
        paypal_details_data = validated_data.pop("paypal_details", None)
        shipping_address_data = validated_data.pop("shipping_address", None)

        # update account settings
        for attr in ['first_name', 'last_name', 'username', 'email']:
            if attr in validated_data:
                setattr(instance, attr, validated_data.get(attr, getattr(instance, attr)))
        
        # update password separately since it's hashed
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])

        instance.save()

        # update card details
        if card_details_data:
            card_details = instance.card_details
            for attr in ['card_number', 'card_holder_name', 'expire_month', 'expire_year', 'cvv']:
                if attr in card_details_data:
                    setattr(card_details, attr, card_details_data.get(attr, getattr(card_details, attr)))
            card_details.save()
        
        # update paypal details
        if paypal_details_data:
            paypal_details = instance.paypal_details
            for attr in ['paypal_email']:
                if attr in paypal_details_data:
                    setattr(paypal_details, attr, paypal_details_data.get(attr, getattr(paypal_details, attr)))
            paypal_details.save()
        
        # update shipping address
        if shipping_address_data:
            shipping_address = instance.shipping_address
            for attr in ['street_address', 'city', 'state', 'province_territory', 'zip', 'country']:
                if attr in shipping_address_data:
                    setattr(shipping_address, attr, shipping_address_data.get(attr, getattr(shipping_address, attr)))
            shipping_address.save()

        return instance
    
# next do a profile serializer for the account