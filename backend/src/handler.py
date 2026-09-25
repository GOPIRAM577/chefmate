import json
import os
import boto3

from response_formatter import format_success, format_error
from validator import validate_input, ValidationError
import pantry_service

# Hardcoded test user since Cognito is a stretch goal
DEMO_USER_ID = "demo-user-123"

def lambda_handler(event, context):
    print(f"Received event: {json.dumps(event)}")
    
    try:
        http_context = event.get("requestContext", {}).get("http", {})
        method = http_context.get("method", "")
        path = event.get("rawPath", "")
        request_id = event.get("requestContext", {}).get("requestId", "N/A")
        
        if method == "OPTIONS":
            return format_success({"message": "OK"}, status_code=200)
            
        if path == "/health" and method == "GET":
            return handle_health_check()
            
        elif path == "/pantry/items" and method == "GET":
            # Support sorting query param
            query_params = event.get("queryStringParameters", {}) or {}
            sort = query_params.get("sort", "expiry") == "expiry"
            
            items = pantry_service.get_items(DEMO_USER_ID, sort_by_expiry=sort)
            return format_success({"items": items})
            
        elif path == "/pantry/items" and method == "POST":
            body = json.loads(event.get("body", "{}"))
            validated_data = validate_input(body)
            new_item = pantry_service.add_item(DEMO_USER_ID, validated_data)
            return format_success(new_item, status_code=201)
            
        elif path.startswith("/pantry/items/") and method == "PUT":
            item_id = path.split("/")[-1]
            body = json.loads(event.get("body", "{}"))
            validated_data = validate_input(body)
            updated_item = pantry_service.update_item(DEMO_USER_ID, item_id, validated_data)
            return format_success(updated_item)
            
        elif path.startswith("/pantry/items/") and method == "DELETE":
            item_id = path.split("/")[-1]
            pantry_service.delete_item(DEMO_USER_ID, item_id)
            return format_success({"message": "Item deleted successfully"})
            
        elif path == "/pantry/photo" and method == "POST":
            import photo_service
            body = json.loads(event.get("body", "{}"))
            if "image" not in body:
                return format_error("Missing 'image' base64 data in payload", 400, request_id, "BAD_REQUEST")
            
            candidates = photo_service.process_photo(body["image"])
            return format_success({"candidates": candidates})
            
        elif path == "/recipes/generate" and method == "POST":
            import recipe_service
            import throttle
            
            # Rate limiting
            if not throttle.check_rate_limit(DEMO_USER_ID, limit=10):
                return {
                    "statusCode": 429,
                    "headers": {
                        "Content-Type": "application/json",
                        "Retry-After": "3600"
                    },
                    "body": json.dumps({
                        "error": "Too Many Requests",
                        "code": "RATE_LIMIT_EXCEEDED",
                        "requestId": request_id
                    })
                }
                
            body = json.loads(event.get("body", "{}"))
            meal_type = body.get("mealType", "any")
            
            result = recipe_service.generate_recipes(DEMO_USER_ID, meal_type)
            return format_success(result)
            
        elif path == "/recipes/save" and method == "POST":
            import recipe_service
            body = json.loads(event.get("body", "{}"))
            # In a real app we'd validate the body shape
            saved = recipe_service.save_recipe(DEMO_USER_ID, body)
            return format_success(saved, status_code=201)
            
        elif path == "/recipes/history" and method == "GET":
            import recipe_service
            history = recipe_service.get_saved_recipes(DEMO_USER_ID)
            return format_success({"history": history})
            
        return format_error(f"Route not found: {method} {path}", 404, request_id, "NOT_FOUND")
        
    except ValidationError as e:
        return format_error(str(e), 400, request_id, e.code)
    except Exception as e:
        print(f"Unhandled error: {str(e)}")
        request_id = event.get("requestContext", {}).get("requestId", "N/A") if 'event' in locals() else "N/A"
        
        # Pass through Bedrock billing/subscription errors so frontend can show a helpful popup
        if "aws-marketplace:Subscribe" in str(e) or "INVALID_PAYMENT_INSTRUMENT" in str(e):
            return format_error("AWS Account Missing Credit Card or Bedrock Access", 403, request_id, "INVALID_PAYMENT_INSTRUMENT")
            
        return format_error("Internal server error", 500, request_id, "INTERNAL_ERROR")

def handle_health_check():
    """
    Implements GET /health.
    Returns service status + dependency check.
    """
    dynamodb = boto3.client('dynamodb')
    table_name = os.getenv("PANTRY_TABLE_NAME", "PantryItems")
    
    dependency_status = "ok"
    try:
        dynamodb.describe_table(TableName=table_name)
    except Exception as e:
        print(f"Dependency check failed: {str(e)}")
        dependency_status = "error"
        
    status_code = 200 if dependency_status == "ok" else 503
    return format_success({
        "status": "ok",
        "dependencies": {
            "dynamodb": dependency_status
        }
    }, status_code)
