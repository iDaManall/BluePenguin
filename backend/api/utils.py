from google.cloud import storage
from django.conf import settings

def upload_to_gcs(file, destination_blob_name):
    client = storage.Client.from_service_account_json(settings.GOOGLE_APPLICATION_CREDENTIALS)
    bucket = client.bucket(settings.GOOGLE_CLOUD_STORAGE_BUCKET)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_file(file)
    blob.make_public()
    return blob.public_url 
