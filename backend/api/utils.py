from google.cloud import storage
from django.conf import settings

class EmailNotifications:
    # notification for when after a bid is won - immediate task
    @staticmethod
    def notify_bid_won(user, item, bid_price):
        subject = f"Congratulations! You've won the auction for {item.title}"
        message = f"You have won the auction for {item.title} with your bid of {bid_price}!"
        user.email_user(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER
        )
    
    # notification after the deadline of the seller's item has approached - periodic task 
    @staticmethod
    def notify_deadline_to_seller(user, item):
        subject = f"The auction for {item.title} has ended."
        message = f"The auction for {item.title} has ended - log in to see who won."
        user.email_user(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER
        )

    # notification for when a user is outbid - immediate task
    def notify_outbid(user, item, new_bid):
        subject = f"You've been outbid on {item.title}!"
        message = f"Someone has placed a higher bid of ${new_bid} on {item.title}. Log in to reclaim your spot!"
        user.email_user(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER
        )
    
    # notification for approaching deadline - periodic task
    @staticmethod
    def notify_deadline_24h(user, item, is_seller):
        if is_seller:
            subject = f"24 hours left on your item {item.title}"
            message = f"The deadline for {item.title} is in 24 hours. Log in to see any contending bids!"
        else:
            subject = f"24 hours left to bid on {item.title}"
            message = f"The deadline for {item.title} is in 24 hours. Log in to secure your spot in first place if you haven't already!"
        user.email_user(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER
        )

def upload_to_gcs(file, destination_blob_name):
    client = storage.Client.from_service_account_json(settings.GOOGLE_APPLICATION_CREDENTIALS)
    bucket = client.bucket(settings.GOOGLE_CLOUD_STORAGE_BUCKET)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_file(file)
    blob.make_public()
    return blob.public_url 

