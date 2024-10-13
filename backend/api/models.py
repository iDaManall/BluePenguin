from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Note(models.Model):
    title = models.CharField(max_length=100) # add a title with max length 100
    content = models.TextField() # textfield for content
    created_at = models.DateTimeField(auto_now_add=True) # automatically populate whenever we make a new instance of this note
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes") # who made this note, if user gone, delete all notes this user has. Related notes allows user object to access all these note objects 

    def __str__(self):
        return self.title