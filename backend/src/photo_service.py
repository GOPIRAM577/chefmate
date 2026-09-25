import os
import uuid
import base64
import boto3

s3 = boto3.client('s3')
rekognition = boto3.client('rekognition')
bucket_name = os.getenv("PHOTOS_BUCKET_NAME")

def process_photo(base64_image: str):
    """
    Decodes base64 image, uploads to S3, runs Rekognition DetectLabels, 
    and returns a candidate list of ingredients.
    """
    if not bucket_name:
        raise Exception("PHOTOS_BUCKET_NAME environment variable is missing")
        
    image_bytes = base64.b64decode(base64_image)
    file_name = f"{uuid.uuid4()}.jpg"
    
    # 1. Upload to S3
    s3.put_object(
        Bucket=bucket_name,
        Key=file_name,
        Body=image_bytes,
        ContentType='image/jpeg'
    )
    
    # 2. Call Rekognition
    response = rekognition.detect_labels(
        Image={
            'S3Object': {
                'Bucket': bucket_name,
                'Name': file_name
            }
        },
        MaxLabels=20,
        MinConfidence=60.0
    )
    
    # 3. Map response to candidate ingredients
    return map_rekognition_labels(response.get('Labels', []))

def map_rekognition_labels(labels):
    """
    Filters Rekognition labels to extract likely food items.
    Extracted as a separate function to make unit testing easy.
    """
    candidates = set()
    generic_terms = {'food', 'beverage', 'produce', 'plant', 'meal', 'dish', 'drink', 'grocery'}
    
    for label in labels:
        name = label.get('Name', '')
        
        # Check if Rekognition categorized it as Food and Beverage
        categories = [cat.get('Name', '') for cat in label.get('Categories', [])]
        is_food = 'Food and Beverage' in categories
        
        # If it's food but not a super generic category word, add it
        if is_food and name.lower() not in generic_terms:
            candidates.add(name)
            
    return sorted(list(candidates))
