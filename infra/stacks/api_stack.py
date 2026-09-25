from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    aws_apigatewayv2 as apigwv2,
    aws_apigatewayv2_integrations as integrations,
    Duration,
)
from constructs import Construct
from stacks.data_stack import DataStack

class ApiStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, data_stack: DataStack, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # 1. Lambda Skeleton
        self.api_handler = _lambda.Function(
            self, "ApiHandler",
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="handler.lambda_handler",
            code=_lambda.Code.from_asset("../backend/src"),
            timeout=Duration.seconds(29), # Based on API Gateway 30s timeout
            environment={
                "PANTRY_TABLE_NAME": data_stack.pantry_table.table_name,
                "RECIPES_TABLE_NAME": data_stack.recipes_table.table_name,
                "PHOTOS_BUCKET_NAME": data_stack.photos_bucket.bucket_name,
            }
        )

        # 2. Least Privilege IAM
        # Grant read/write access to DynamoDB tables and S3
        data_stack.pantry_table.grant_read_write_data(self.api_handler)
        data_stack.recipes_table.grant_read_write_data(self.api_handler)
        data_stack.photos_bucket.grant_read_write(self.api_handler)
        
        # Grant Rekognition and Bedrock permissions
        from aws_cdk import aws_iam as iam
        self.api_handler.add_to_role_policy(iam.PolicyStatement(
            actions=[
                "rekognition:DetectLabels",
                "bedrock:InvokeModel"
            ],
            resources=["*"]
        ))

        # 3. HTTP API Gateway
        self.http_api = apigwv2.HttpApi(
            self, "PantryChefHttpApi",
            cors_preflight=apigwv2.CorsPreflightOptions(
                allow_origins=["*"],
                allow_methods=[apigwv2.CorsHttpMethod.ANY],
                allow_headers=["Content-Type", "Authorization"]
            )
        )

        # 4. API Gateway Integration
        lambda_integration = integrations.HttpLambdaIntegration(
            "ApiHandlerIntegration", 
            self.api_handler
        )

        # Catch-all route
        self.http_api.add_routes(
            path="/{proxy+}",
            methods=[apigwv2.HttpMethod.ANY],
            integration=lambda_integration
        )
        
        # Explicit health route
        self.http_api.add_routes(
            path="/health",
            methods=[apigwv2.HttpMethod.GET],
            integration=lambda_integration
        )
