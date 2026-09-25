import sys
import os
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))
from response_formatter import format_success, format_error

def test_format_success():
    data = {"key": "value"}
    res = format_success(data)
    assert res["statusCode"] == 200
    assert "headers" in res
    assert json.loads(res["body"]) == data

def test_format_error():
    res = format_error("Something went wrong", 400, "req-123", "BAD_REQUEST")
    assert res["statusCode"] == 400
    body = json.loads(res["body"])
    assert body["error"] == "Something went wrong"
    assert body["code"] == "BAD_REQUEST"
    assert body["requestId"] == "req-123"
