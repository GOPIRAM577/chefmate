#!/usr/bin/env python3
import os
import aws_cdk as cdk
from stacks.data_stack import DataStack
from stacks.api_stack import ApiStack

app = cdk.App()
env = cdk.Environment(
    account=os.getenv('CDK_DEFAULT_ACCOUNT', '929453768825'), 
    region=os.getenv('CDK_DEFAULT_REGION', 'us-east-1')
)

data_stack = DataStack(app, "PantryChefDataStack", env=env)
ApiStack(app, "PantryChefApiStack", data_stack=data_stack, env=env)

app.synth()
