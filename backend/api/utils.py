from google.cloud import storage
from django.conf import settings
import random
import operator

class EmailNotifications:
    # notification for when after a bid is won - immediate task
    @staticmethod
    def notify_bid_won(user, item, bid_price):
        subject = f"Congratulations! You've won the auction for {item.title}"
        message = f"You have won the auction for {item.title} with your bid of ${bid_price}!"
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
    @staticmethod
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
    
    # user is seller, winner is user instance
    @staticmethod
    def notify_sale_confirmed(user, item, winner):
        subject = "Transaction Accepted."
        message = f"{winner.username} has accepted the transaction for {item.title}. Your balance has now been updated, you may proceed to 'Next Actions' to ship the item."
        user.email_user(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER
        )

    # user is seller, winner is user instance
    @staticmethod
    def notify_sale_rejected(user, item, winner):
        subject = "Transaction Rejected."
        message = f"{winner.username} has rejected the transaction for {item.title}. You must log in and select a new winner before your item's deadline, or else your item will be expired."
        user.email_user(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER
        )

    @staticmethod
    def notify_item_shipped(user, item, seller, estimated_delivery, carrier, shipping_cost):
        subject = f"{item.title} has been shipped!"
        message = f"Your item {item.title} has been shipped!\n\nEstimated Delivery: {estimated_delivery},\nCarrier: {carrier},\nShipping Cost: {shipping_cost}.\n\nLog in to rate the seller {seller.user.username}!"
        user.email_user(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER
        )
    
    @staticmethod
    def notify_item_arrived(user, item):
        subject = f"{item.title} has arrived!"
        message = f"Your item {item.title} has arrived! Log in to mark this item as 'received' for the seller to know."
        user.email_user(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER
        )
    
    @staticmethod
    def notify_item_received(user, item, buyer):
        subject = f"{buyer.user.username} has received your item!"
        message = f"Your item {item.title} has been received by {buyer.user.username}. Log in to rate this transaction if you haven't already."
        user.email_user(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER
        )

    @staticmethod
    def notify_deadline_changed(user, item, new_deadline):
        subject = f"Deadline changed for {item.title}."
        message = f"The item you have bidded on, {item.title}, has a changed deadline.\nThe new deadline is: {new_deadline}."
        user.email_user(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER
        )

    @staticmethod
    def notify_account_suspended(user, reason, is_vip):
        consequence = "Suspended"
        pay_fine_to = ""
        if is_vip:
            consequence = "Demoted to User Status"
            pay_fine_to = "Your items are no longer available for auction. Log in to pay a $50 fine to get access to your account again."
        subject = f"Account {consequence}."
        message = f"Your account {user.username} has been {consequence.lower()} because of the following reason:\n{reason}.\n\n{pay_fine_to}"
        user.email_user(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER
        )

    @staticmethod
    def notify_account_balance_insufficient(user, current_balance):
        subject = "Unsuspended: Account Balance is Insufficient"
        message = f"You have been unsuspended, but your account balance is now at ${current_balance:.2f}. Log in to add to your account balance."
        user.email_user(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER
        )
    
    @staticmethod
    def notify_account_permanently_suspended(user):
        subject = "Your Account Has Been Permanently Suspended"
        message = "Your account has been permanently suspended. You can no longer reactivate your account or operate as a BluePenguin user."
        user.email_user(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER
        )
    
    @staticmethod
    def notify_VIP_status_earned(user):
        subject = "VIP Status Earned"
        message = "Your account has earned VIP status! It currently has over $5k balance, has no complaints, and 5+ transactions. You now have a 10 percent on all transactions you win and accept."
        user.email_user(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER
        )
    
    @staticmethod
    def notify_VIP_status_revoked(user):
        subject = "VIP Status Revoked"
        message = "Your account's VIP status has been revoked, because either your balance is under $5k or you have received a complaint."
        user.email_user(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER
        )

    @staticmethod
    def notify_items_deleted(user, items):
        subject = "Transaction Cancelled Due to Item Deletion"
        message = f"The following items have been deleted by either BluePenguin or its BluePenguin user: {', '.join(items)}."
        user.email_user(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER
        )

    @staticmethod
    def notify_quit_application_received(user):
        subject = "Quit Application Received."
        message = "Your quit application has been received. It is currently under review."
        user.email_user(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER
        )
    
    @staticmethod
    def notify_deletion_rejected(user):
        subject = "Account Deletion Request Rejected"
        message = f"After being reviewed by BluePenguin Superusers, they believed that your account deletion request is invalid."
        user.email_user(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER
        )

    @staticmethod
    def notify_report_received(user):
        subject = "Your Report Was Received."
        message = "It is under review by BluePenguin's superusers."
        user.email_user(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER
        )

    @staticmethod
    def notify_report_rejected(user):
        subject = "Report Rejected"
        message = f"After being reviewed by BluePenguin Superusers, they believed that your report is invalid."
        user.email_user(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER
        )

    @staticmethod
    def notify_reported(user, reason):
        subject = "Account Report"
        message = f"A BluePenguin user reported your account because of the following reason:{reason}. You are no longer eligible to be a VIP."
        user.email_user(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER
        )

    @staticmethod
    def notify_deletion_approved(user):
        subject = "We're sad to see you go."
        message = "BluePenguin superusers have agreed that your request to quit is valid. Your account and items have been automatically deleted."
        user.email_user(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER
        )

    @staticmethod
    def notify_account_reactivated(user):
        subject = "Account Reactivated Notice"
        message = "Your account has been reactivated by BluePenguin administration."
        user.email_user(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER
        )

    @staticmethod
    def notify_user_application_received(user):
        subject = "User Application Received"
        message = "Your application to become a User has been received and is under review."
        user.email_user(subject=subject, message=message)

    @staticmethod
    def notify_user_application_approved(user):
        subject = "User Application Approved"
        message = "Your application to become a User has been approved! You now have full user privileges."
        user.email_user(subject=subject, message=message)

    @staticmethod
    def notify_user_application_rejected(user):
        subject = "User Application Rejected"
        message = "Your application to become a User has been rejected by BluePenguin administration."
        user.email_user(subject=subject, message=message)

def upload_to_gcs(file_obj, destination_blob_name):
    print(f"Starting upload for {destination_blob_name}")
    client = storage.Client.from_service_account_json(settings.GOOGLE_APPLICATION_CREDENTIALS)
    bucket = client.bucket(settings.GOOGLE_CLOUD_STORAGE_BUCKET)
    blob = bucket.blob(destination_blob_name)

    # Upload the file
    file_obj.seek(0) # Reset file pointer to beginning
    blob.upload_from_file(file_obj) 
    print(f"File uploaded successfully")
    # blob.make_public()

    # Instead of using ACL, make the object publicly readable through uniform bucket-level access
    # Get the public URL
    url = blob.public_url
    print(f"Generated public URL: {url}")
    return url

def generate_random_arithmetic_question():
    operations = [
        (operator.truediv, "÷"),
        (operator.add, "+"),
    ]

# 8 ÷ 2(2+2)
    inner_paren_num1 = random.randint(1,10)
    inner_paren_num2 = random.randint(1,10)

    inner_paren = f"{inner_paren_num1} + {inner_paren_num2}"
    inner_paren_answer = inner_paren_num1 + inner_paren_num2

    num3 = random.randint(1,10)
    dividend_num = random.randint(1,10)
    num4 = num3*dividend_num

    answer = dividend_num*inner_paren_answer

    question = f"{num4}÷{num3}({inner_paren})"

    return {
        "question": question,
        "answer": answer
    }

# pass account instances
def complete_transaction(seller, buyer, amount):
    seller_balance = seller.balanace
    buyer_balance = buyer.balance

    seller_balance += amount
    buyer_balance -= amount

    seller.balance = seller_balance
    seller.save()

    buyer.balance = buyer_balance
    buyer.save()