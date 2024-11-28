from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from supabase import create_client, Client
from django.conf import settings
from django.core.cache import cache
from api.models import *

User = get_user_model()  # Move this to the top level

class SupabaseMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

class SupabaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        # Check for custom header
        auth_token = (
            request.META.get('HTTP_X_AUTH_TOKEN') or
            request.headers.get('X-Auth-Token')
        )
        
        if not auth_token:
            return None
        
        # Remove 'Bearer ' prefix if present
        if auth_token.startswith('Bearer '):
            auth_token = auth_token.split(' ')[1]

        print("Debug token info:", {
            'token_present': bool(auth_token),
            'token_preview': auth_token[:20] if auth_token else None
        })


        try:
            # check if session exists in cache
            session_key = f'supabase_session_{auth_token}'
            cached_session = cache.get(session_key)
            print(f"Cached session found: {bool(cached_session)}")  # Debug log


            if cached_session:
                User = get_user_model()
                return (User.objects.get(email=cached_session['email']), None)
        

            # create Supabase client instance if there is no User
            supabase: Client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_ANON_KEY
            )
            print("Supabase client created")  # Debug log


            try:
                auth_response = supabase.auth.get_user(auth_token)
                user_data = auth_response.user
                print(f"User data retrieved: {user_data.email}")  # Debug log
            except Exception as e:
                print(f"Error getting user data: {str(e)}")  # Debug log
                raise AuthenticationFailed('Invalid token')
            
            User = get_user_model()
            # get or create Django user 
            django_user, user_created = User.objects.get_or_create(
                email=user_data.email,
                defaults={
                    'username': user_data.email,
                    'is_active': True
                }
            )
            print(f"Django user {'created' if user_created else 'retrieved'}")  # Debug log


            # if user_created:
            #     try:
            #         account = Account.objects.get(user=django_user)
            #         Profile.objects.get(account=account)
            #     except Exception as e:
            #         print(f"Account/Profile creation error: {str(e)}")  # Debug log
            #         django_user.delete()
            #         raise AuthenticationFailed('Failed to create account')

            # cache the session without verifying it
            session_data = {
                'email': user_data.email,
            }
            cache.set(
                session_key,
                session_data,
                timeout=3600
            )
            print("Session cached")  # Debug log

            return (django_user, None)
            
        except Exception as e:
            print(f"Authentication error: {str(e)}")  # Debug log
            try:
                supabase.auth.sign_out()
                cache.delete(session_key)
            except:
                pass
            raise AuthenticationFailed(f'Invalid session: {str(e)}')
    
    def authenticate_header(self, request):
        return 'Bearer'

