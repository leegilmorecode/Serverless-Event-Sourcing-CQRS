import { MetricUnit, Metrics } from '@aws-lambda-powertools/metrics';
import { errorHandler, logger, schemaValidator } from '@shared';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import { CreateEmployeeCommand } from '@dto/create-employee';
import { Employee } from '@dto/employee';
import { ValidationError } from '@errors/validation-error';
import middy from '@middy/core';
import { createEmployeeUseCase } from '@use-cases/create-employee';
import { schema } from './create-employee.schema';

const tracer = new Tracer();
const metrics = new Metrics();

export const createEmployeeAdapter = async ({
  body,
}: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!body) throw new ValidationError('no payload body');

    const employee = JSON.parse(body) as CreateEmployeeCommand;

    schemaValidator(schema, employee);

    const created: Employee = await createEmployeeUseCase(employee);

    metrics.addMetric('SuccessfulEmployeeCreated', MetricUnit.Count, 1);

    return {
      statusCode: 200,
      body: JSON.stringify(created),
    };
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) errorMessage = error.message;
    logger.error(errorMessage);

    metrics.addMetric('CreateEmployeeError', MetricUnit.Count, 1);

    return errorHandler(error);
  }
};

export const handler = middy(createEmployeeAdapter)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics));
