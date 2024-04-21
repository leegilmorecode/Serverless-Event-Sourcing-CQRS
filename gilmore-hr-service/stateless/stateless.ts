import * as cdk from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

import { Construct } from 'constructs';

interface GilmoreHrServiceStatelessStackProps extends cdk.StackProps {
  table: dynamodb.Table;
}

export class GilmoreHrServiceStatelessStack extends cdk.Stack {
  private table: dynamodb.Table;

  constructor(
    scope: Construct,
    id: string,
    props: GilmoreHrServiceStatelessStackProps
  ) {
    super(scope, id, props);

    const { table } = props;
    this.table = table;

    const lambdaPowerToolsConfig = {
      LOG_LEVEL: 'DEBUG',
      POWERTOOLS_LOGGER_LOG_EVENT: 'true',
      POWERTOOLS_LOGGER_SAMPLE_RATE: '1',
      POWERTOOLS_TRACE_ENABLED: 'enabled',
      POWERTOOLS_TRACER_CAPTURE_HTTPS_REQUESTS: 'captureHTTPsRequests',
      POWERTOOLS_SERVICE_NAME: 'employee-service',
      POWERTOOLS_TRACER_CAPTURE_RESPONSE: 'captureResult',
      POWERTOOLS_METRICS_NAMESPACE: 'Gilmore-HR',
    };

    // create our lambda functions for the api
    const getEmployeeLambda: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'GetEmployeeLambda', {
        functionName: 'hr-get-employee-lambda',
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(
          __dirname,
          'src/adapters/primary/get-employee/get-employee.adapter.ts'
        ),
        memorySize: 1024,
        handler: 'handler',
        tracing: lambda.Tracing.ACTIVE,
        bundling: {
          minify: true,
        },
        environment: {
          ...lambdaPowerToolsConfig,
          TABLE_NAME: this.table.tableName,
        },
      });

    const createEmployeeLambda: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'CreateEmployeeLambda', {
        functionName: 'hr-create-employee-lambda',
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(
          __dirname,
          'src/adapters/primary/create-employee/create-employee.adapter.ts'
        ),
        memorySize: 1024,
        handler: 'handler',
        tracing: lambda.Tracing.ACTIVE,
        bundling: {
          minify: true,
        },
        environment: {
          ...lambdaPowerToolsConfig,
          TABLE_NAME: this.table.tableName,
        },
      });

    const updateEmployeeLambda: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'UpdateEmployeeLambda', {
        functionName: 'hr-update-employee-lambda',
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(
          __dirname,
          'src/adapters/primary/update-employee/update-employee.adapter.ts'
        ),
        memorySize: 1024,
        handler: 'handler',
        tracing: lambda.Tracing.ACTIVE,
        bundling: {
          minify: true,
        },
        environment: {
          ...lambdaPowerToolsConfig,
          TABLE_NAME: this.table.tableName,
        },
      });

    const deleteEmployeeLambda: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'DeleteEmployeeLambda', {
        functionName: 'hr-delete-employee-lambda',
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(
          __dirname,
          'src/adapters/primary/delete-employee/delete-employee.adapter.ts'
        ),
        memorySize: 1024,
        handler: 'handler',
        tracing: lambda.Tracing.ACTIVE,
        bundling: {
          minify: true,
        },
        environment: {
          ...lambdaPowerToolsConfig,
          TABLE_NAME: this.table.tableName,
        },
      });

    const updateLeaveLambda: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'UpdateLeaveLambda', {
        functionName: 'hr-update-leave-lambda',
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(
          __dirname,
          'src/adapters/primary/update-leave/update-leave.adapter.ts'
        ),
        memorySize: 1024,
        handler: 'handler',
        tracing: lambda.Tracing.ACTIVE,
        bundling: {
          minify: true,
        },
        environment: {
          ...lambdaPowerToolsConfig,
          TABLE_NAME: this.table.tableName,
        },
      });

    // give the functions access to the table
    this.table.grantReadData(getEmployeeLambda);
    this.table.grantReadWriteData(createEmployeeLambda);
    this.table.grantReadWriteData(updateEmployeeLambda);
    this.table.grantReadWriteData(updateLeaveLambda);
    this.table.grantReadWriteData(deleteEmployeeLambda);

    // create the api for the emplopyee service
    const api: apigw.RestApi = new apigw.RestApi(this, 'Api', {
      description: 'Gilmore HR API',
      deploy: true,
      deployOptions: {
        stageName: 'prod',
        loggingLevel: apigw.MethodLoggingLevel.INFO,
      },
    });

    // create our employee api
    const root: apigw.Resource = api.root.addResource('v1');
    const employees: apigw.Resource = root.addResource('employees');
    const employee: apigw.Resource = employees.addResource('{id}');
    const requests: apigw.Resource = employee.addResource('requests');

    // add a post endpoint so we can create new employees
    employees.addMethod(
      'POST',
      new apigw.LambdaIntegration(createEmployeeLambda, {
        proxy: true,
      })
    );

    // add a get endpoint so we can return a current employee (just to show event sourcing in action)
    // note: in part 2 we will swap this out for cqrs
    employee.addMethod(
      'GET',
      new apigw.LambdaIntegration(getEmployeeLambda, {
        proxy: true,
      })
    );

    // add a patch endpoint so we can update the current employee
    employee.addMethod(
      'PATCH',
      new apigw.LambdaIntegration(updateEmployeeLambda, {
        proxy: true,
      })
    );

    // add a delete endpoint so we can delete the current employee
    employee.addMethod(
      'DELETE',
      new apigw.LambdaIntegration(deleteEmployeeLambda, {
        proxy: true,
      })
    );

    // add a post endpoint so we can cancel and request leave
    requests.addMethod(
      'POST',
      new apigw.LambdaIntegration(updateLeaveLambda, {
        proxy: true,
      })
    );
  }
}
