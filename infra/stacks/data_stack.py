from aws_cdk import (
    Stack,
    aws_dynamodb as dynamodb,
    aws_s3 as s3,
    RemovalPolicy,
)
from constructs import Construct

class DataStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # PantryItems DynamoDB Table
        # PK: userId (or sessionId for MVP), SK: itemId
        self.pantry_table = dynamodb.Table(
            self, "PantryItemsTable",
            table_name="PantryItems",
            partition_key=dynamodb.Attribute(name="userId", type=dynamodb.AttributeType.STRING),
            sort_key=dynamodb.Attribute(name="itemId", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            # For a solo dev project, we use DESTROY so cleanup is easy. 
            # In production, use RETAIN.
            removal_policy=RemovalPolicy.DESTROY,
        )

        # SavedRecipes DynamoDB Table
        # PK: userId, SK: recipeId
        self.recipes_table = dynamodb.Table(
            self, "SavedRecipesTable",
            table_name="SavedRecipes",
            partition_key=dynamodb.Attribute(name="userId", type=dynamodb.AttributeType.STRING),
            sort_key=dynamodb.Attribute(name="recipeId", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY,
        )

        # S3 Bucket for photo uploads
        # Note: Rekognition requires the photos to be in S3 to process them.
        self.photos_bucket = s3.Bucket(
            self, "PhotosBucket",
            versioned=False,
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True, 
            cors=[s3.CorsRule(
                allowed_methods=[s3.HttpMethods.POST, s3.HttpMethods.PUT, s3.HttpMethods.GET],
                allowed_origins=["*"],
                allowed_headers=["*"],
            )]
        )
