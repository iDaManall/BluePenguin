import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.conf.beat_schedule = {
    'check-auction-deadlines': {
        'task': 'api.tasks.check_auction_deadlines',
        'schedule': crontab(minute=0) # it runs every hour
    }
}

app.autodiscover_tasks()