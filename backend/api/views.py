# essentially writing simple views that allows us to create new users
from .serializers import *
from .models import *

from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError

# Create your views here.
class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user) # get all notes by this author
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user) # we manually add the author since its read only otherwise
        else:
            print(serializer.errors)

class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    # valid notes we can delete essentially
    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user) # get all notes by this author

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all() #list of all diff objects that we're looking at when creating new one to prevent duplicates
    serializer_class = UserSerializer #class tells view what data to accept to make new user
    permission_classes = [AllowAny] #allow anyone to call this to create new user

# use this to register and update account settings
class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer = AccountSerializer
    permission_classes = [IsAuthenticated]

    # user registration
    @action(detail=False, methods=['post'], url_path='register')
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save() # this is supposed to call the create() method in the serializer
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except IntegrityError as e: # if you put attribs as unique=True in the model class
                return Response({"error": "Username or email already exists"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # update all basic info like first name, last name, email, username, and password
    @action(detail=True, methods=['patch'], url_path='update-account-settings')
    def update_settings(self, request, pk=None):
        account = self.get_object() # since you are updating an account, get the account object
        serializer = self.get_serializer(account, data=request.data, partial=True) # allows partial update
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # update shipping address
    @action(detail=True, methods=['patch'], url_path='update-shipping-address')
    def update_shipping_address(self, request, pk=None):
        account = self.get_object()
        shipping_address = account.shipping_address
        serializer = ShippingAddressSerializer(shipping_address, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # update card details
    @action(detail=True, methods=['patch'], url_path='update-card-details')
    def update_card_details(self, request, pk=None):
        account = self.get_object()
        card_details = account.card_details
        serializer = CardDetailsSerializer(card_details, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # update paypal details
    @action(detail=True, methods=['patch'], url_path='update-paypal-details')
    def update_paypal_details(self, request, pk=None):
        account = self.get_object()
        paypal_details = account.paypal_details
        serializer = PayPalDetailsSerializer(paypal_details, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)