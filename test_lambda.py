import sys
sys.path.append('e:/AWS-pantrychef/PantryChef/backend/src')
import handler
import json
event = {
    'requestContext': {'http': {'method': 'POST'}, 'requestId': 'test-123'},
    'rawPath': '/pantry/items',
    'body': json.dumps({'name': 'Test', 'quantity': '1'})
}
try:
    print(handler.lambda_handler(event, {}))
except Exception as e:
    print('ERROR:', str(e))
