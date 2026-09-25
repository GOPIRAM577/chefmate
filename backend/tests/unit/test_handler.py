import sys
import os
import json
from unittest.mock import patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))

@patch('boto3.client')
@patch('pantry_service.get_items')
def test_handler_get_pantry_items(mock_get, mock_boto3):
    from handler import lambda_handler
    mock_get.return_value = [{"itemId": "123", "name": "Apple"}]
    
    event = {
        "requestContext": {"http": {"method": "GET"}},
        "rawPath": "/pantry/items",
        "queryStringParameters": {"sort": "expiry"}
    }
    
    res = lambda_handler(event, {})
    assert res["statusCode"] == 200
    body = json.loads(res["body"])
    assert body["items"][0]["name"] == "Apple"

@patch('boto3.client')
@patch('pantry_service.add_item')
def test_handler_post_item(mock_add, mock_boto3):
    from handler import lambda_handler
    mock_add.return_value = {"itemId": "new123"}
    event = {
        "requestContext": {"http": {"method": "POST"}},
        "rawPath": "/pantry/items",
        "body": '{"name": "Milk"}'
    }
    res = lambda_handler(event, {})
    assert res["statusCode"] == 201

@patch('boto3.client')
@patch('pantry_service.update_item')
def test_handler_put_item(mock_update, mock_boto3):
    from handler import lambda_handler
    mock_update.return_value = {"name": "Soy Milk"}
    event = {
        "requestContext": {"http": {"method": "PUT"}},
        "rawPath": "/pantry/items/123",
        "body": '{"name": "Soy Milk"}'
    }
    res = lambda_handler(event, {})
    assert res["statusCode"] == 200

@patch('boto3.client')
@patch('pantry_service.delete_item')
def test_handler_delete_item(mock_delete, mock_boto3):
    from handler import lambda_handler
    event = {
        "requestContext": {"http": {"method": "DELETE"}},
        "rawPath": "/pantry/items/123"
    }
    res = lambda_handler(event, {})
    assert res["statusCode"] == 200

@patch('boto3.client')
@patch('photo_service.process_photo')
def test_handler_post_photo(mock_process, mock_boto3):
    from handler import lambda_handler
    mock_process.return_value = ["Apple", "Milk"]
    
    event = {
        "requestContext": {"http": {"method": "POST"}},
        "rawPath": "/pantry/photo",
        "body": json.dumps({"image": "base64data..."})
    }
    
    res = lambda_handler(event, {})
    assert res["statusCode"] == 200

@patch('boto3.client')
def test_handler_not_found(mock_boto3):
    from handler import lambda_handler
    event = {
        "requestContext": {"http": {"method": "GET"}},
        "rawPath": "/fake/path"
    }
    res = lambda_handler(event, {})
    assert res["statusCode"] == 404
