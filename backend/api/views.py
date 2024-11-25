# essentially writing simple views that allows us to create new users
from .serializers import *
from .models import *
from .permissions import *
from .filters import *
from .utils import EmailNotifications

from django.shortcuts import render
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.db.models.aggregates import Avg, Count, Max
from django.utils import timezone
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
from rest_framework.views import APIView
from django.conf import settings
from supabase import create_client
from django.core.cache import cache

from decimal import Decimal
from time import sleep
import shippo


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
                user = serializer.save() # this is supposed to call the create() method in the serializer
                sleep(1)

                supabase = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_ANON_KEY
                )

                print(f"Creating Supabase user for {request.data['email']}")

                auth_response = supabase.auth.sign_up({
                                'email': request.data['email'],
                                'password': request.data['password'],
                })

                print("Supabase user created successfully")

                return Response({
                    'user': serializer.data,
                    'access_token': auth_response.session.access_token if auth_response.session else None,
                    'refresh_token': auth_response.session.refresh_token if auth_response.session else None
                    }, status=status.HTTP_201_CREATED)
            except IntegrityError: # if you put attribs as unique=True in the model class
                return Response({"error": "Username or email already in use"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                print(f"Registration error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # UPDATE all basic info like first name, last name, email, username, and password
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsOwner, IsNotSuspended], url_path='update-account-settings')
    def update_settings(self, request, pk=None):
        account = self.get_object() # since you are updating an account, get the account object

        serializer = self.get_serializer(account, data=request.data, partial=True) # allows partial update

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # set shipping address
    @action(detail=True, methods=['post', 'patch'], permission_classes=[IsAuthenticated, IsOwner, IsNotVisitor, IsNotSuspended], url_path='set-shipping-address')
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
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsOwner, IsNotVisitor, IsNotSuspended], url_path='set-card-details')
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
    @action(detail=True, methods=['post', 'patch'], permission_classes=[IsAuthenticated, IsOwner, IsNotVisitor, IsNotSuspended], url_path='set-paypal-details')
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
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsNotVisitor, IsNotSuspended], url_path='view-pending-bids')
    def view_pending_bids(self, request):
        try:
            account = self.get_object()
            profile = account.profile
            pending_bids = Bid.objects.filter(profile=profile, item__availability=AVAILABLE_CHOICE).select_related('item')

            serializer = BidSerializer(pending_bids, many=True)
            return Response(
                {
                    'pending_bids': serializer.data,
                    'count': pending_bids.count()
                }
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to fetch transactions: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsNotSuspended], url_path='view-current-balance')
    def view_current_balance(self, request, pk=None):
        account = self.get_object()
        try:
            current_balance = account.balance
            return Response({"balance": current_balance})
        except Exception as e:
            return Response({"error": f"Failed to fetch account balance: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsNotVisitor, IsNotSuspended], url_path='add-to-balance')
    def add_to_balance(self, request, pk=None):
        account = self.get_object()
        balance = account.balance
        try:
            amount = Decimal(request.data.get('amount', 0))
            if amount <= 0:
                return Response({"error": "Must enter a positive amount of money."}, status=status.HTTP_400_BAD_REQUEST)

            balance += amount
            account.balance = balance
            account.save()

            return Response(
                {
                    "message": f"Added ${amount:.2f} to balance.",
                    "balance": account.balance
                }
            )
        except (TypeError, ValueError):
            return Response(
                {"error": "Invalid amount entered."},
                status=status.HTTP_400_BAD_REQUEST,
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsNotVisitor, IsSuspended], url_path='pay-suspension-fine')
    def pay_suspension_fine(self, request, pk=None):
        account = self.get_object()
        account.balance -= 50.00
        account.is_suspended = False
        account.suspension_fine_paid = True
        account.save() 

        if account.balance < 0:
            current_balance = account.balance()
            account_user = account.user
            EmailNotifications.notify_account_balance_insufficient(account_user, current_balance)

        return Response(
            {
                'success': True,
                'message': 'Fine paid successfully.',
            }
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsNotVisitor, IsNotSuspended], url_path='request-quit')
    def request_quit(self, request, pk=None):
        user = request.user
        account = user.account

        existing_request = QuitRequest.objects.filter(
            account=account,
            status=REQUEST_PENDING_CHOICE
        ).exists()
        
        if existing_request:
            return Response(
                {"error": "You already have a pending quit request"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        username = user.username
        email = user.email
        reason = request.data.get('reason')
        if reason:
            serializer = QuitRequestSerializer(request.data, context={"request": request, "username": username, "email": email, "reason": reason})
            if serializer.is_valid():
                serializer.save()
                EmailNotifications.notify_quit_application_received(user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SignInView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            email = request.data.get('email')
            password = request.data.get('password')

            print(f"Attempting login for email: {email}")

            if not email or not password:
                return Response(
                    {'error': 'Email and password are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                # Verify the user exists in Django first
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                print(f"User with email {email} not found in Django")
                return Response(
                    {'error': 'Invalid login credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Add error handling for Supabase client creation
            try:
                supabase = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_ANON_KEY,
                )
                print("Supabase client created successfully")
            except Exception as e:
                print(f"Supabase client creation error: {str(e)}")
                return Response(
                    {'error': 'Authentication service unavailable'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

            print("Attempting Supabase authentication...")
            # sign in, get session
            try:
                auth_response = supabase.auth.sign_in_with_password({
                    'email': email,
                    'password': password,
                })
                print("Supabase authentication successful")
            except Exception as e:
                print(f"Supabase authentication error: {str(e)}")
                return Response(
                    {'error': 'Invalid login credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            user_data = {
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }

            response = Response(
                {   
                    'user': user_data,
                    'access_token': auth_response.session.access_token,
                    'refresh_token': auth_response.session.refresh_token,
                    'expires_at': auth_response.session.expires_at,
                }
            )

            # Set CORS headers explicitly
            # response["Access-Control-Allow-Credentials"] = "true"
            return response
        
        except Exception as e:
            print(f"Sign-in error: {str(e)}")  # Add detailed logging
            return Response(
                {'error': 'Invalid login credentials'},
                status=status.HTTP_401_UNAUTHORIZED,
            )


    # serializer_class = SignInSerializer ;; if nothing works, go back to this

class SignOutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            supabase = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_ANON_KEY
            )

            auth_header = request.META.get('HTTP_AUTHORIZATION')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')
                supabase.auth.sign_out(token)

            return Response({"message": "User logged out successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Invalid token"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        

# profile view 
class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [AllowAny, IsNotSuspended]

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
    # /api/profiles/edit-profile
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsOwner], url_path='edit-profile')
    def update_profile(self, request, pk=None):
        profile = self.get_object()

        serializer = ProfileSerializer(profile, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # /api/profiles/rate-profile
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsNotOwner, IsNotVisitor], url_path='rate-profile')
    def rate_profile(self, request, pk=None):
        ratee = self.get_object()
        ratee_account = ratee.account
        rater_account = request.user.account
        rater_transactions_as_seller = Transaction.objects.filter(seller=rater_account, buyer=ratee)
        rater_transactions_as_buyer = Transaction.objects.filter(seller=ratee_account, buyer=rater_account)

        if not rater_transactions_as_seller.exists() and not rater_transactions_as_buyer.exists():
            return Response({
                "message": "You cannot rate this user as you have not performed any transactions with them."
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = RatingSerializer(data=request.data, context={"request": request, "ratee": ratee})

        if serializer.is_valid():
            serializer.save()
            avg_rating = Rating.objects.filter(ratee=ratee).aggregate(Avg('rating'))
            ratee.average_rating = avg_rating['rating__avg']
            ratee.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # /api/profiles/saves
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsSaveOwner], url_path='saves')
    def view_saves(self, request):
        profile = self.get_object()
        saves = Save.objects.filter(profile=profile)
        serializer = SaveSerializer(saves, many=True)

        return Response(serializer.data)
    
    # /api/profiles/delete-saved-item
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated, IsSaveOwner], url_path='delete-saved-item')
    def delete_save(self, request):
        save_id = request.data.get('id', None)

        try:
            save = Save.objects.get(id=save_id)
        except Save.DoesNotExist:
            raise NotFound(detail="Save not found")
        
        save.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
    
    # /api/profiles/report-user
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsNotVisitor], url_path='report-user')
    def report(self, request):
        reportee = self.get_object()
        reportee_account = reportee.account
        reporter_account = request.user.account

        completed_transactions = Transaction.objects.filter(seller=reportee_account, buyer=reporter_account)

        if not completed_transactions.exists():
            return Response(
                {
                    "message": "You cannot report this user since you have not performed any transactions with them."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ReportSerializer(data=request.data, context={"request": request, "reportee": reportee})

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get', 'post'], permission_classes=[IsAuthenticated, IsVisitor], url_path='apply-to-be-user')
    def apply_to_be_user(self, request, pk=None):
        # get captcha
        if request.method == 'GET':
            question_data = generate_random_arithmetic_question()
            request.session['captcha_answer'] = question_data['answer']
            return Response({
                "question": question_data['question']
            })
        # verify captcha
        elif request.method == 'POST':
            user_answer = request.data.get('answer')
            actual_answer = request.session.get('captcha_answer')

            if int(user_answer) == actual_answer:
                return Response({"valid": True})
            return Response({"valid": False})


# now work on item views
class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [AllowAny, IsNotSuspended]
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
    
    # 25-50
    # 50-100
    # api/items/?search={sudgkjasals}&availability=available&highest_bid__gt=25&highest_bid__lt=50
    # create and view an item
    # you can edit an item's description but nothing else?
    # delete an item

    # /api/items/post-item
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsNotVisitor], url_path='post-item')
    def create_new_item(self, request):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            item = serializer.save()
            profile = item.profile
            item_count = Item.objects.filter(profile=profile).count()
            profile.item_count = item_count
            profile.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    # /api/items/{pk}/delete-item
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated, IsOwner, IsNotVisitor], url_path='delete-item')
    def delete_item(self, request, pk=None):
        item = self.get_object()
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    # /api/items/{pk}/comment
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='comment')
    def comment(self, request):
        # configure the correct item and profile that commented
        item = self.get_object()
        item_account = item.profile.account
        if item_account.is_suspended():
            return Response({"error": "You cannot interact with this user's items since they have been suspended."})
        parent = None

        serializer = CommentSerializer(data=request.data, context={'request': request, 'item': item, 'parent': parent})

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # /api/items/{pk}/view_comments
    @action(detail=True, methods=['get'], permission_classes=[AllowAny], url_path='comments')
    def view_comments(self, request):
        item = self.get_object()
        comments = Comment.objects.filter(item=item)

        serializer = CommentSerializer(comments, many=True)

        return Response(serializer.data)
    
    # /api/items/{pk}/reply
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='reply')
    def reply(self, request):
        item = self.get_object()
        item_account = item.profile.account
        if item_account.is_suspended():
            return Response({"error": "You cannot interact with this user's items since they have been suspended."})
        
        parent_id = request.data.get('parent', None) # if you can't get something from self.object, then its probably in the request - gets the pk
        parent = Comment.objects.get(id=parent_id)

        serializer = CommentSerializer(data=request.data, context={'request': request, 'item': item, 'parent': parent})

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # /api/items/{pk}/replies/?parent=<id>
    @action(detail=True, methods=['get'], permission_classes=[AllowAny], url_path='replies')
    def view_replies(self, request):
        parent_id = request.query_params.get('parent', None)
        parent = Comment.objects.get(id=parent_id)
        replies = Comment.objects.filter(parent=parent)

        serializer = CommentSerializer(replies, many=True)

        return Response(serializer.data)
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated, IsCommentOwner], url_path='delete-comment')
    def delete_comment(self, request):
        comment_id = request.data.get('id', None)

        try:
            comment = Comment.objects.get(id=comment_id)
        except Comment.DoesNotExist:
            raise NotFound(detail="Comment does not exist.")
        
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post', 'delete'], permission_classes=[IsAuthenticated], url_path='like-comment')
    def like_comment(self, request):
            item = self.get_object()
            item_account = item.profile.account
            if item_account.is_suspended():
                return Response({"error": "You cannot interact with this user's items since they have been suspended."})
        

            comment_id = request.data.get('id', None)

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
                like = Like.objects.filter(comment=comment, profile=request.user.account.profile).first()
                like.delete()

                likes_count = Like.objects.filter(comment=comment).aggregate(Count('id'))
                comment.likes = likes_count
                comment.save()

                return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post', 'delete'], permission_classes=[IsAuthenticated], url_path='dislike-comment')
    def dislike_comment(self, request):
        item = self.get_object()
        item_account = item.profile.account
        if item_account.is_suspended():
            return Response({"error": "You cannot interact with this user's items since they have been suspended."})

        comment_id = request.data.get('id', None)

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
            dislike = Dislike.objects.filter(comment=comment, profile=request.user.account.profile).first()
            dislike.delete()

            dislikes_count = Dislike.objects.filter(comment=comment).aggregate(Count('id'))
            comment.dislikes = dislikes_count
            comment.save()

            return Response(status=status.HTTP_204_NO_CONTENT)


    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated], url_path='save-item')
    def save_item(self, request):
        item = self.get_object()
        item_account = item.profile.account
        if item_account.is_suspended():
            return Response({"error": "You cannot interact with this user's items since they have been suspended."})
        
        serializer = SaveSerializer(data=request.data, context={'request': request, 'item': item})

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanBidOn, IsNotVisitor, IsNotSeller], url_path='perform-bid')
    def place_bid(self, request, pk=None):
        item = self.get_object()
        user = request.user
        account = user.account
        if not item.is_available():
            return Response({"error": "Bidding has ended"})
        
        bid_amount = Decimal(request.data.get('bid_price'))
        if bid_amount <= item.highest_bid:
            return Response({"error": "Bid must be higher than current bid."})
        if bid_amount > account.balance:
            return Response({"error": "Insufficient funds."}, status=status.HTTP_402_PAYMENT_REQUIRED)
        if bid_amount <= 0:
            return Response({"error": "Invalid bid amount."})
        
        highest_bid = item.highest_bid
        highest_bid_obj = Bid.objects.filter(item=item, bid_price=highest_bid).first()
        serializer = BidSerializer(data=request.data, context={'request': request, 'item': item})
        if serializer.is_valid():
            bid = serializer.save()
            curr_highest = Bid.objects.filter(item=item).order_by('-bid_price','time_of_bid').first()

            if curr_highest == bid:
                if highest_bid_obj:   
                    EmailNotifications.notify_outbid(
                        highest_bid_obj.profile.account.user,
                        item,
                        bid_amount
                    )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # next make a choice to change bid deadline and/or complete bid
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsOwner, IsNotVisitor], url_path='change-deadline')
    def change_deadline(self, request, pk=None):
        try:
            item = self.get_object()

            if item.availability != AVAILABLE_CHOICE:
                return Response({
                "error": "Cannot change deadline for items that are sold or expired"
            }, status=status.HTTP_400_BAD_REQUEST)

            new_deadline = request.data.get('deadline')
            new_deadline_dt = timezone.datetime.strptime(new_deadline, "%Y-%m-%d %H:%M:%S")
            if new_deadline_dt <= timezone.now():
                return Response({
                    "error": "New deadline must be in the future"
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            item.deadline = new_deadline_dt
            item.save()

            bidders = User.objects.filter(account__profile__bid__item=item).distinct()

            for bidder in bidders:
                EmailNotifications.notify_deadline_changed(
                    bidder, 
                    item, 
                    new_deadline_dt
                )

            return Response({
                "message": "Deadline successfully changed."
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "error": f"Failed to change deadline: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated, IsNotSuspended]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsNotVisitor], url_path='seller-transactions')
    def view_transactions(self, request):
        try:
            seller_account = request.user.account
            seller_transactions = Transaction.objects.filter(seller=seller_account)
            serializer = self.get_serializer(seller_transactions, many=True)

            return Response({
                'transactions': serializer.data,
                'count': seller_transactions.count()
            })
        except Exception as e:
            return Response(
                {"error": f"Failed to fetch transactions: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsNotVisitor], url_path='awaiting-arrival')
    def view_awaiting_arrivals(self, request):
        try:
            buyer_account = request.user.account
            transactions = Transaction.objects.filter(
                buyer=buyer_account, 
                status__in=[PENDING_CHOICE, SHIPPED_CHOICE]
            )
            serializer = self.get_serializer(transactions, many=True)

            return Response({
                'awaiting_arrivals': serializer.data,
                'count': transactions.count()
            })
        except Exception as e:
            return Response(
                {"error": f"Failed to fetch transactions: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsNotVisitor], url_path='next-actions')
    def view_next_actions(self, request):
        try:
            account = request.user.account
            to_ship = Transaction.objects.filter(
                seller=account,
                status=PENDING_CHOICE
            )
            awaiting = Transaction.objects.filter(
                buyer=account,
                status__in=[PENDING_CHOICE, SHIPPED_CHOICE]
            )

            to_ship_serializer = self.get_serializer(to_ship, many=True)
            awaiting_serializer = self.get_serializer(awaiting, many=True)

            return Response({
                'to_ship': to_ship_serializer.data,
                'to_ship_count': to_ship.count(),
                'awaiting_arrival': awaiting_serializer.data,
                'awaiting_count': awaiting.count()
            })
        except Exception as e:
            return Response(
                {"error": f"Failed to fetch actions: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsNotVisitor, IsSeller], url_path='ship')
    def ship_item(self, request, pk=None):
        try:
            transaction = self.get_object()
            seller_account = transaction.seller
            seller_address = seller_account.shipping_address
            buyer_account = transaction.buyer
            buyer_address = buyer_account.shipping_address

            if not seller_address or not buyer_address:
                return Response(
                    {"error": "Both seller and buyer must have shipping addresses"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer = ParcelSerializer(data=request.data, context={"transaction": transaction})
            if serializer.is_valid():
                parcel = serializer.save()
                parcel = serializer.save()
            shippo.api_key = settings.SHIPPO_API_KEY

            shipment = shippo.Shipments.create(
                address_from={
                    "name": seller_account.user.get_full_name(),
                    "street1": seller_address.street_address,
                    "city": seller_address.city,
                    "state": seller_address.state,
                    "zip": seller_address.zip,
                    "country": seller_address.country,
                },
                address_to={
                    "name": buyer_account.user.get_full_name(),
                    "street1": buyer_address.street_address,
                    "city": buyer_address.city,
                    "state": buyer_address.state,
                    "zip": buyer_address.zip,
                    "country": buyer_address.country,
                },
                parcels=[
                    {
                        "length": str(parcel.length),
                        "width": str(parcel.width),
                        "height": str(parcel.height),
                        "distance_unit": parcel.distance_unit,
                        "weight": str(parcel.weight),
                        "mass_unit": parcel.weight_unit,
                    }
                ],
                async_=False
            )

            rates = shipment.rates
            selected_rate = rates[0]

            transaction.status = SHIPPED_CHOICE
            transaction.carrier = selected_rate['provider']
            transaction.shipping_cost = selected_rate['amount']

            estimated_days = selected_rate.get('estimated_days', "N/A")
            if estimated_days != "N/A":
                estimated_delivery = datetime.now() + timedelta(days=estimated_days)
                estimated_delivery = estimated_delivery.strftime("%Y-%m-%d")
            else:
                estimated_delivery = "Unknown"
            
            transaction.estimated_delivery = estimated_delivery

            transaction.save()

            EmailNotifications.notify_item_shipped(
                buyer_account.user,
                transaction.bid.item,
                seller_account,
                transaction.estimated_delivery,
                transaction.carrier,
                transaction.shipping_cost,
            )
            
            return Response({
                "message": f"Item is marked as shipped.",
                "transaction": {
                    "id": transaction_id,
                    "item": transaction.bid.item.title,
                    "seller": seller_account.user.username,
                    "bidder": buyer_account.user.username,
                    "shipping_to": str(buyer_address),
                    "shipping_from": str(seller_address),
                    "estimated_delivery": transaction.estimated_delivery,
                    "carrier": transaction.carrier,
                    "shipping_cost": transaction.shipping_cost
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Failed to process shipping: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # if you have received the item, mark as received
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsBuyer], url_path='received-item')
    def received_item(self, request, pk=None):
        try: 
            transaction = self.get_object()

            transaction.status = RECEIVED_CHOICE
            transaction.save()

            EmailNotifications.notify_item_received(
                transaction.seller.user,
                transaction.bid.item,
                transaction.buyer
            )

            return Response(
                {
                    "message": "Item has been marked as received",
                    "transaction": {
                        "id": transaction.id,
                        "item": transaction.bid.item.title,
                        "status": RECEIVED_CHOICE
                    }
                }, status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to mark item as received: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )


    