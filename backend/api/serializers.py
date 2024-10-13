from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note

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
