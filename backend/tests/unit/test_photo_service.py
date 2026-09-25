import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))
from photo_service import map_rekognition_labels

def test_map_rekognition_labels_extracts_food():
    labels = [
        {"Name": "Apple", "Categories": [{"Name": "Food and Beverage"}]},
        {"Name": "Refrigerator", "Categories": [{"Name": "Appliance"}]},
        {"Name": "Milk", "Categories": [{"Name": "Food and Beverage"}]}
    ]
    candidates = map_rekognition_labels(labels)
    assert "Apple" in candidates
    assert "Milk" in candidates
    assert "Refrigerator" not in candidates

def test_map_rekognition_labels_ignores_generic_terms():
    labels = [
        {"Name": "Food", "Categories": [{"Name": "Food and Beverage"}]},
        {"Name": "Produce", "Categories": [{"Name": "Food and Beverage"}]},
        {"Name": "Banana", "Categories": [{"Name": "Food and Beverage"}]}
    ]
    candidates = map_rekognition_labels(labels)
    assert "Banana" in candidates
    assert "Food" not in candidates
    assert "Produce" not in candidates
