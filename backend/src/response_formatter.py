import json
from decimal import Decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            if obj % 1 == 0:
                return int(obj)
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def format_success(data, status_code=200):
    """Formats a successful JSON response."""
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" # Need CORS for frontend
        },
        "body": json.dumps(data, cls=DecimalEncoder)
    }

def format_error(error_message, status_code, request_id="N/A", code="INTERNAL_ERROR"):
    """Formats a structured JSON error response."""
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps({
            "error": error_message,
            "code": code,
            "requestId": request_id
        })
    }
