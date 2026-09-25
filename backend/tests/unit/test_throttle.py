import sys
import os
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))
import throttle

@patch('boto3.resource')
def test_throttle_allowed(mock_resource):
    mock_table = MagicMock()
    mock_resource.return_value.Table.return_value = mock_table
    
    # Simulate first request (count = 1)
    mock_table.update_item.return_value = {"Attributes": {"request_count": 1}}
    
    allowed = throttle.check_rate_limit("user-1", limit=10)
    assert allowed is True

@patch('boto3.resource')
def test_throttle_denied(mock_resource):
    mock_table = MagicMock()
    mock_resource.return_value.Table.return_value = mock_table
    
    # Simulate request over limit (count = 11)
    mock_table.update_item.return_value = {"Attributes": {"request_count": 11}}
    
    allowed = throttle.check_rate_limit("user-1", limit=10)
    assert allowed is False
