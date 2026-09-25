import sys
import os
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))

@patch('boto3.resource')
def test_add_item(mock_resource):
    mock_table = MagicMock()
    mock_resource.return_value.Table.return_value = mock_table
    
    if 'pantry_service' in sys.modules:
        del sys.modules['pantry_service']
    import pantry_service
    
    item = pantry_service.add_item("user-1", {"name": "Banana"})
    assert item["name"] == "Banana"
    mock_table.put_item.assert_called_once()

@patch('boto3.resource')
def test_get_items(mock_resource):
    mock_table = MagicMock()
    mock_resource.return_value.Table.return_value = mock_table
    mock_table.query.return_value = {"Items": [{"expiryDate": "2024-01-01"}, {"expiryDate": "2023-01-01"}]}
    
    if 'pantry_service' in sys.modules:
        del sys.modules['pantry_service']
    import pantry_service
    
    items = pantry_service.get_items("user-1", sort_by_expiry=True)
    assert len(items) == 2
    assert items[0]["expiryDate"] == "2023-01-01"

@patch('boto3.resource')
def test_update_item(mock_resource):
    mock_table = MagicMock()
    mock_resource.return_value.Table.return_value = mock_table
    mock_table.update_item.return_value = {"Attributes": {"name": "Apple"}}
    
    if 'pantry_service' in sys.modules:
        del sys.modules['pantry_service']
    import pantry_service
    
    res = pantry_service.update_item("user-1", "item-123", {"name": "Apple"})
    assert res["name"] == "Apple"

@patch('boto3.resource')
def test_delete_item(mock_resource):
    mock_table = MagicMock()
    mock_resource.return_value.Table.return_value = mock_table
    
    if 'pantry_service' in sys.modules:
        del sys.modules['pantry_service']
    import pantry_service
    
    res = pantry_service.delete_item("user-1", "item-123")
    assert res is True
