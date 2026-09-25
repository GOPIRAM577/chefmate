import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))
from recipe_service import build_prompt

def test_build_prompt_empty():
    assert build_prompt([]) == ""

def test_build_prompt_with_items():
    items = [{"name": "Chicken"}, {"name": "Rice"}]
    prompt = build_prompt(items, "dinner")
    
    assert "Ingredients available: [Chicken, Rice]." in prompt
    assert "Prioritize: [dinner]." in prompt
    assert "valid JSON array" in prompt
