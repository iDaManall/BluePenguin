from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from supabase import create_client, Client
from django.conf import settings
from django.core.cache import cache
from api.models import *

class SupabaseAuthMiddleware(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1] # extract the token from the header

        try:
            # check if session exists in cache
            session_key = f'supabase_session_{token}'
            cached_session = cache.get(session_key)

            if cached_session:
                User = get_user_model()
                return (User.objects.get(email=cached_session['email']), None)
        

            # create Supabase client instance if there is no User
            supabase: Client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_ANON_KEY
            )

            auth_response = supabase.auth.get_user(token)
            user_data = auth_response.user

            session = supabase.auth.get_session(token)
            if not session:
                raise AuthenticationFailed('Session Expired')
            
            # get or create Django user 
            django_user, user_created = User.objects.get_or_create(
                email=user_data.email,
                defaults={
                    'username': user_data.email,
                    'is_active': True
                }
            )

            if user_created:
                try:
                    account = Account.objects.get(user=django_user)
                    Profile.objects.get(account=account)
                except Exception as e:
                    django_user.delete()
                    raise AuthenticationFailed('Failed')

            # cache the session
            session_data = {
                'email': user_data.email,
                'session_id':session.session.id,
                'expires_at': session.session.expires_at
            }
            cache.set(
                session_key,
                session_data,
                timeout=3600
            )

            return (django_user, None)
            
        except User.DoesNotExist:
            raise AuthenticationFailed('User does not exist')
        except Exception as e:
            try:
                supabase.auth.sign_out()
                cache.delete(session_key)
            except:
                pass
            raise AuthenticationFailed(f'Invalid session')
    
    def authenticate_header(self, request):
        return 'Bearer'

