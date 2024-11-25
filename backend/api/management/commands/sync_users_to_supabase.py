from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.conf import settings
from supabase import create_client

class Command(BaseCommand):
    help = 'Syncs Django users to Supabase authentication'

    def handle(self, *args, **kwargs):
        supabase = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )

        users = User.objects.all()
        self.stdout.write(f"Found {users.count()} users to sync")

        for user in users:
            try:
                supabase.auth.admin.create_user({
                    'email': user.email,
                    'password': 'hY0@<T5s', 
                    'email_confirm': True
                })
                self.stdout.write(self.style.SUCCESS(f"Created auth user for {user.email}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to create {user.email}: {str(e)}"))