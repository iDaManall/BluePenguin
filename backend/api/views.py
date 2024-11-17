# essentially writing simple views that allows us to create new users
from .serializers import *
from .models import *
from .permissions import *
from .filters import *

from django.shortcuts import render
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.db.models.aggregates import Avg, Count
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_str
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import NotFound
from rest_framework.filters import SearchFilter, OrderingFilter


'''
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
'''

# use this to register and update account settings
class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    # user registration
    @action(detail=False, methods=['post'], url_path='register', permission_classes=[AllowAny])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            try:
                serializer.save() # this is supposed to call the create() method in the serializer
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except IntegrityError: # if you put attribs as unique=True in the model class
                return Response({"error": "Username or email already in use"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # UPDATE all basic info like first name, last name, email, username, and password
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsOwner], url_path='update-account-settings')
    def update_settings(self, request, pk=None):
        account = self.get_object() # since you are updating an account, get the account object

        serializer = self.get_serializer(account, data=request.data, partial=True) # allows partial update

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    # set shipping address
    @action(detail=True, methods=['post', 'patch'], permission_classes=[IsAuthenticated, IsOwner], url_path='set-shipping-address')
    def set_shipping_address(self, request, pk=None):
        account = self.get_object(pk)

        if request.method == 'POST':
            serializer = ShippingAddressSerializer(data=request.data)

            if serializer.is_valid():
                shipping_address = serializer.save() 
                account.shipping_address = shipping_address
                account.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'PATCH':
            shipping_address = account.shipping_address # this indicates ur updating the shipping_address attribute in account

            serializer = ShippingAddressSerializer(shipping_address, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
    # set card details
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsOwner], url_path='set-card-details')
    # if detail=True, this means the URL would include {pk}/set-card-details
    def set_card_details(self, request):
        account = self.get_object()

        if request.method == 'POST':
            # creating new card details
            serializer = CardDetailsSerializer(data=request.data)

            if serializer.is_valid():
                try:
                    card_details = serializer.save()  # save the card details
                    account.card_details = card_details  # associate the card details with the account
                    account.save()  # save the account
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                except IntegrityError:
                    return Response({"error": "Card number already in use"}, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif request.method == 'PATCH':
            # updating existing card details
            card_details = account.card_details  # get existing card details

            serializer = CardDetailsSerializer(card_details, data=request.data, partial=True)

            if serializer.is_valid():
                try:
                    serializer.save()  # save the updated card details
                    return Response(serializer.data, status=status.HTTP_200_OK)
                except IntegrityError:
                    return Response({"error": "Card number already in use"}, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    # set paypal details
    @action(detail=True, methods=['post', 'patch'], permission_classes=[IsAuthenticated, IsOwner], url_path='set-paypal-details')
    def update_paypal_details(self, request, pk=None):
        account = self.get_object()

        if request.method == 'POST':
            serializer = PayPalDetailsSerializer(data=request.data)

            if serializer.is_valid():
                try:
                    paypal_details = serializer.save()
                    account.paypal_details = paypal_details
                    account.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                except IntegrityError:
                    return Response({"error": "PayPal email already in use"}, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'PATCH':
            paypal_details = account.paypal_details

            serializer = PayPalDetailsSerializer(paypal_details, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

'''
@api_view(['GET'])
def verify_email(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_encode(uidb64))
        account = Account.objects.get(pk=uid)
    except Exception as e:
        account = None
    
    if account and default_token_generator.check_token(account, token):
        account.is_verified = True
        account.save()
        return Response({"message": "Email verified successfully"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Email verification failed."}, status=status.HTTP_400_BAD_REQUEST)
'''

class SignInView(TokenObtainPairView):
    serializer_class = SignInSerializer

class SignOutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "User logged out successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        

# profile view 
class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer = ProfileSerializer
    permission_classes = [IsAuthenticated]

    # view profile
    # note: the action decorator is used to create custom actions on the viewset
    def retrieve(self, request, *args, **kwargs):
        username = kwargs.get('pk')

        try:
            profile = Profile.objects.get(account__user__username=username)
            serializer = self.get_serializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Profile.DoesNotExist:
            raise NotFound({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # update profile
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsOwner], url_path='edit-profile')
    def update_profile(self, request, pk=None):
        profile = self.get_object()

        serializer = ProfileSerializer(profile, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsNotOwner], url_path='rate-profile')
    def rate_profile(self, request, pk=None):
        ratee = self.get_object()

        serializer = RatingSerializer(data=request.data, context={"request": request, "ratee": ratee})

        if serializer.is_valid():
            serializer.save()
            avg_rating = Rating.objects.filter(ratee=ratee).aggregate(Avg('rating'))
            profile.average_rating = avg_rating
            profile.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated], url_path='saves')
    def view_saves(self, request):
        profile = self.get_object()
        saves = Save.objects.filter(profile=profile)
        serializer = SaveSerializer(saves, many=True)

        return Response(serializer.data)
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated, IsOwner], url_path='delete-saved-item')
    def delete_save(self, request):
        save_id = request.data.get('id', None)

        try:
            save = Save.objects.get(id=save_id)
        except Save.DoesNotExist:
            raise NotFound(detail="Save not found")
        
        save.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='report-user')
    def report(self, request):
        reportee = self.get_object()

        serializer = ReportSerializer(data=request.data, context={"request": request, "reportee": reportee})

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# now work on item views
class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer()
    search_fields = ['title', 'description', 'collection']
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ItemFilter
    lookup_field = 'title'
    # basic actions you can do from the filterset_class in ItemFilter:
    ## browse items by collection: api/items/?collection__title={title}&ordering=total_bids&availability=available
    ## browse items by profile: api/items/?profile__account_id={id}&ordering=-date_posted&availability=available ;; DO NOT FORGET TO PUT - BEFORE date_posted IF YOU WANT TO SORT BY MOST RECENT
    ## browse unavailable items by profile: api/items/?profile__account_id={id}&ordering=-date_posted&availability=sold
    ## browse items by highest bid AND collection: api/items/?collection__title={title}&ordering=total_bids&availability=available&highest_bid__gt={int}&highest_bid__lt={int}
    ## browse items by search (including filters): api/items/?search={fields}&availability=available{whatever filters}
    

    # create and view an item
    # you can edit an item's description but nothing else?
    # delete an item

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsNotVisitor], url_path='post-item')
    def create_new_item(self, request):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            item = serializer.save()
            profile = item.profile
            item_count = Item.objects.filter(profile=profile).aggregate(Count('id'))
            profile.item_count = item_count
            profile.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated, IsOwner], url_path='delete-item')
    def delete_item(self, request, pk=None):
        item = self.get_object()
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='comment')
    def comment(self, request):
        # configure the correct item and profile that commented
        item = self.get_object()
        parent = None

        serializer = CommentSerializer(data=request.data, context={'request': request, 'item': item, 'parent': parent})

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[AllowAny], url_path='comments')
    def view_comments(self, request):
        item = self.get_object()
        comments = Comment.objects.filter(item=item)

        serializer = CommentSerializer(comments, many=True)

        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='reply')
    def reply(self, request):
        item = self.get_object()
        parent_id = request.data.get('parent', None) # if you can't get something from self.object, then its probably in the request - gets the pk
        parent = Comment.objects.get(id=parent_id)

        serializer = CommentSerializer(data=request.data, context={'request': request, 'item': item, 'parent': parent})

        if serializer.valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny], url_path='replies')
    def view_replies(self, request):
        parent_id = request.data.get('parent', None)
        parent = Comment.objects.get(id=parent_id)
        replies = Comment.objects.filter(parent=parent)

        serializer = CommentSerializer(replies, many=True)

        return Response(serializer.data)
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated, IsOwner], url_path='delete-comment')
    def delete_comment(self, request):
        comment_id = request.data.get('id', None)

        try:
            comment = Comment.objects.get(id=comment_id)
        except Comment.DoesNotExist:
            raise NotFound(detail="Comment does not exist.")
        
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post', 'delete'], permission_classes=['IsAuthenticated'], url_path='like-comment')
    def like_comment(self, request):
            comment_id = request.get.data('id', None)

            try:
                comment = Comment.objects.get(id=comment_id)
                serializer = LikeSerializer(data=request.data, context={'request': request, 'comment': comment})
            except Comment.DoesNotExist:
                raise NotFound(detail="Comment does not exist.")

            if request.method == 'POST':
                if serializer.is_valid():
                    serializer.save()
                    likes_count = Like.objects.filter(comment=comment).aggregate(Count('id'))
                    comment.likes = likes_count
                    comment.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_404_NOT_FOUND)
        
            elif request.method == 'DELETE':
                like = Like.objects.filter(comment=comment, user=request.user).first()
                like.delete()

                likes_count = Like.objects.filter(comment=comment).aggregate(Count('id'))
                comment.likes = likes_count
                comment.save()

                return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], permission_classes=['IsAuthenticated'], url_path='like-comment')
    def dislike_comment(self, request):
        comment_id = request.get.data('id', None)

        try:
            comment = Comment.objects.get(id=comment_id)
            serializer = DislikeSerializer(data=request.data, context={'request': request, 'comment': comment})
        except Comment.DoesNotExist:
            raise NotFound(detail="Comment does not exist.")

        if request.method == 'POST':
            if serializer.is_valid():
                serializer.save()
                dislikes = Dislike.objects.filter(comment=comment).aggregate(Count('id'))
                comment.dislikes = dislikes
                comment.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_404_NOT_FOUND)
        
        elif request.method == 'DELETE':
            like = Like.objects.filter(comment=comment, user=request.user).first()
            like.delete()

            likes_count = Like.objects.filter(comment=comment).aggregate(Count('id'))
            comment.likes = likes_count
            comment.save()

            return Response(status=status.HTTP_204_NO_CONTENT)


    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated], url_path='save-item')
    def save_item(self, request):
        item = self.get_object()
        serializer = SaveSerializer(data=request.data, context={'request': request, 'item': item})

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_404_NOT_FOUND)