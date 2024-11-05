from google.cloud import storage

def upload_to_gcs(file, destination_blob_name, bucket_name):
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_file(file)
    blob.make_public()
    return blob.public_url 
