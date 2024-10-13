# essentially writing simple views that allows us to create new users
from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, NoteSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note

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