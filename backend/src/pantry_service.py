import os
import uuid
from datetime import datetime
import boto3
from boto3.dynamodb.conditions import Key

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
table_name = os.getenv("PANTRY_TABLE_NAME", "PantryItems")
table = dynamodb.Table(table_name)

def get_items(user_id, sort_by_expiry=True):
    """
    Fetches all pantry items for a given user.
    Optionally sorts by expiryDate locally.
    """
    response = table.query(
        KeyConditionExpression=Key('userId').eq(user_id)
    )
    items = response.get('Items', [])
    
    if sort_by_expiry:
        # Sort items: ones with expiryDate first, sorted ascending, then items without expiryDate
        def sort_key(x):
            # Use a far future date if expiry is missing so they sort to the end
            return x.get('expiryDate', '9999-12-31')
        items.sort(key=sort_key)
        
    return items

def add_item(user_id, item_data):
    """
    Adds a new pantry item.
    """
    item_id = str(uuid.uuid4())
    item = {
        'userId': user_id,
        'itemId': item_id,
        'addedDate': datetime.utcnow().isoformat(),
        **item_data
    }
    
    table.put_item(Item=item)
    return item

def update_item(user_id, item_id, item_data):
    """
    Updates an existing pantry item.
    """
    # Prevent modifying the primary keys
    item_data.pop('userId', None)
    item_data.pop('itemId', None)
    
    update_expression = "SET "
    expression_attribute_values = {}
    expression_attribute_names = {}
    
    for i, (key, value) in enumerate(item_data.items()):
        update_expression += f"#{key} = :val{i}, "
        expression_attribute_names[f"#{key}"] = key
        expression_attribute_values[f":val{i}"] = value
        
    update_expression = update_expression.rstrip(", ")
    
    response = table.update_item(
        Key={
            'userId': user_id,
            'itemId': item_id
        },
        UpdateExpression=update_expression,
        ExpressionAttributeNames=expression_attribute_names,
        ExpressionAttributeValues=expression_attribute_values,
        ReturnValues="ALL_NEW"
    )
    
    return response.get('Attributes', {})

def delete_item(user_id, item_id):
    """
    Deletes a pantry item.
    """
    table.delete_item(
        Key={
            'userId': user_id,
            'itemId': item_id
        }
    )
    return True
