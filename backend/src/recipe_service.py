import os
import json
import uuid
import boto3
from datetime import datetime, timezone, timedelta
from boto3.dynamodb.conditions import Key
import pantry_service

# We use bedrock-runtime for invoking models
bedrock_client = boto3.client('bedrock-runtime')
dynamodb = boto3.resource('dynamodb')
RECIPES_TABLE_NAME = os.getenv("RECIPES_TABLE_NAME", "SavedRecipes")

def get_saved_recipes(user_id):
    """
    Fetches the user's saved recipes from DynamoDB.
    """
    table = dynamodb.Table(RECIPES_TABLE_NAME)
    response = table.query(
        KeyConditionExpression=Key('userId').eq(user_id)
    )
    return response.get('Items', [])

def save_recipe(user_id, recipe_data):
    """
    Saves a recipe to DynamoDB with a timestamp.
    """
    table = dynamodb.Table(RECIPES_TABLE_NAME)
    recipe_id = str(uuid.uuid4())
    item = {
        "userId": user_id,
        "recipeId": recipe_id,
        "savedAt": datetime.now(timezone.utc).isoformat(),
        **recipe_data
    }
    table.put_item(Item=item)
    return item

def build_prompt(ingredients, meal_type="any", recent_recipes=None):
    """
    Builds a strict, fixed-structure grounding prompt for the LLM.
    """
    if not ingredients:
        return ""
        
    ingredient_list = ", ".join([item.get('name', 'Unknown') for item in ingredients])
    
    avoid_clause = ""
    if recent_recipes:
        recent_titles = ", ".join([r.get('title', '') for r in recent_recipes])
        avoid_clause = f"AVOID suggesting these recently saved recipes: [{recent_titles}]."
    
    prompt = f"""You are a professional chef assistant. 
Ingredients available: [{ingredient_list}]. 
Prioritize: [{meal_type}].
{avoid_clause}
You must return exactly 2-3 recipes that can be made using primarily these ingredients.
You may include basic pantry staples (salt, pepper, oil, water) even if not listed.
You must return your response ONLY as a valid JSON array of objects. Do not include markdown formatting like ```json.
Each object must have exactly these keys: 
- "title" (string)
- "prepTime" (string)
- "usedIngredients" (list of strings - ingredients from the available list used in the recipe)
- "missingIngredients" (list of strings - ingredients not in the available list that the user needs to buy)
- "instructions" (list of strings)
"""
    return prompt

def generate_recipes(user_id, meal_type="any"):
    """
    Fetches user's pantry items, builds prompt, and calls Bedrock.
    """
    items = pantry_service.get_items(user_id)
    
    # Fetch recent recipes (last 7 days) to avoid repeats
    all_saved = get_saved_recipes(user_id)
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_recipes = []
    for r in all_saved:
        if r.get('savedAt'):
            try:
                if datetime.fromisoformat(r['savedAt'].replace('Z', '+00:00')) > seven_days_ago:
                    recent_recipes.append(r)
            except Exception:
                pass
    
    prompt = build_prompt(items, meal_type, recent_recipes)
    
    if not prompt:
        return {"recipes": [], "tokenUsage": {}}

    # Format for Amazon Nova Micro
    body = {
        "messages": [
            {
                "role": "user",
                "content": [{"text": prompt}]
            }
        ],
        "inferenceConfig": {
            "maxTokens": 1000,
            "temperature": 0.5
        }
    }
    
    response = bedrock_client.invoke_model(
        modelId="amazon.nova-micro-v1:0",
        body=json.dumps(body),
        contentType="application/json",
        accept="application/json"
    )
    
    response_body = json.loads(response.get('body').read())
    
    # Nova response format: {"output": {"message": {"content": [{"text": "..."}]}}}
    text_content = response_body.get('output', {}).get('message', {}).get('content', [{}])[0].get('text', '')
    
    try:
        # LLMs occasionally wrap JSON in markdown blocks despite instructions
        clean_text = text_content.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        elif clean_text.startswith("```"):
            clean_text = clean_text[3:]
            
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
            
        recipes = json.loads(clean_text.strip())
        
        # Extract token usage from the bedrock response
        token_usage = response_body.get('usage', {})
        
        return {
            "recipes": recipes,
            "tokenUsage": {
                "inputTokens": token_usage.get('inputTokens', 0),
                "outputTokens": token_usage.get('outputTokens', 0)
            }
        }
    except json.JSONDecodeError as e:
        print(f"Failed to parse Bedrock response as JSON: {text_content}")
        raise Exception("AI returned invalid format.")
