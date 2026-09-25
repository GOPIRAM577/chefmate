import os
import boto3
from datetime import datetime, timezone

def check_rate_limit(user_id: str, limit: int = 10) -> bool:
    """
    Checks if a user has exceeded the rate limit for the current hour.
    Returns True if the request is allowed, False if it should be throttled.
    Uses DynamoDB ADD operation for atomic counting.
    """
    dynamodb = boto3.resource('dynamodb')
    table_name = os.getenv("PANTRY_TABLE_NAME", "PantryItems")
    table = dynamodb.Table(table_name)
    
    current_hour = datetime.now(timezone.utc).strftime("%Y-%m-%d-%H")
    pk = f"RATE_LIMIT#{user_id}"
    sk = current_hour
    
    try:
        response = table.update_item(
            Key={'userId': pk, 'itemId': sk},
            UpdateExpression="ADD request_count :inc",
            ExpressionAttributeValues={':inc': 1},
            ReturnValues="UPDATED_NEW"
        )
        count = response['Attributes']['request_count']
        return count <= limit
    except Exception as e:
        print(f"Throttle check failed, allowing by default: {str(e)}")
        return True
