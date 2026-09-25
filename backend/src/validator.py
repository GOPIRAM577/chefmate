import re

class ValidationError(Exception):
    def __init__(self, message, code="VALIDATION_ERROR"):
        super().__init__(message)
        self.code = code

def validate_input(data: dict):
    """
    Validates input data against constraints:
    1. No string field exceeds 500 characters.
    2. No prompt injection patterns.
    """
    if not isinstance(data, dict):
        raise ValidationError("Input must be a JSON object.")
        
    prompt_injection_patterns = [
        re.compile(r"ignore previous instructions", re.IGNORECASE),
        re.compile(r"system prompt", re.IGNORECASE),
        re.compile(r"you are an ai", re.IGNORECASE),
        re.compile(r"bypass", re.IGNORECASE)
    ]
    
    cleaned_data = {}
    for key, value in data.items():
        if value == "":
            continue
        cleaned_data[key] = value

    for key, value in cleaned_data.items():
        if isinstance(value, str):
            # Check length constraint
            if len(value) > 500:
                raise ValidationError(f"Field '{key}' exceeds maximum length of 500 characters.")
            
            # Check prompt injection
            for pattern in prompt_injection_patterns:
                if pattern.search(value):
                    raise ValidationError(f"Invalid input detected in field '{key}'.", code="PROMPT_INJECTION_DETECTED")
                    
    return cleaned_data
