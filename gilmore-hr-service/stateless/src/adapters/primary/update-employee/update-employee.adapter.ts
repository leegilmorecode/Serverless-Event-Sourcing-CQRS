import { MetricUnit, Metrics } from '@aws-lambda-powertools/metrics';
import { errorHandler, logger, schemaValidator } from '@shared';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import { Employee } from '@dto/employee';
import { UpdateEmployeeCommand } from '@dto/update-employee';
import { ValidationError } from '@errors/validation-error';
import middy from '@middy/core';
import { updateEmployeeUseCase } from '@use-cases/update-employee';
import { schema } from './update-employee.schema';

const tracer = new Tracer();
const metrics = new Metrics();

export const updateEmployeeAdapter = async ({
  body,
  pathParameters,
}: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!body) throw new ValidationError('no payload body');
    if (!pathParameters || !pathParameters?.id)
      throw new ValidationError('no id parameter');

    const { id } = pathParameters;

    const employee = JSON.parse(body) as UpdateEmployeeCommand;
    employee.id = id;

    schemaValidator(schema, employee);

    const created: Employee = await updateEmployeeUseCase(employee);

    metrics.addMetric('SuccessfulUpdateEmployee', MetricUnit.Count, 1);

    return {
      statusCode: 200,
      body: JSON.stringify(created),
    };
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) errorMessage = error.message;
    logger.error(errorMessage);

    metrics.addMetric('UpdateEmployeeError', MetricUnit.Count, 1);

    return errorHandler(error);
  }
};

export const handler = middy(updateEmployeeAdapter)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics));
