import { MetricUnit, Metrics } from '@aws-lambda-powertools/metrics';
import { errorHandler, logger } from '@shared';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import { DeleteEmployeeCommand } from '@dto/delete-employee';
import { Employee } from '@dto/employee';
import { ValidationError } from '@errors/validation-error';
import middy from '@middy/core';
import { deleteEmployeeUseCase } from '@use-cases/delete-employee';

const tracer = new Tracer();
const metrics = new Metrics();

export const deleteEmployeeAdapter = async ({
  pathParameters,
}: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!pathParameters || !pathParameters?.id)
      throw new ValidationError('no id parameter');

    const { id } = pathParameters;

    const employee = { id } as DeleteEmployeeCommand;

    const created: Employee = await deleteEmployeeUseCase(employee);

    metrics.addMetric('SuccessfulDeleteEmployee', MetricUnit.Count, 1);

    return {
      statusCode: 200,
      body: JSON.stringify(created),
    };
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) errorMessage = error.message;
    logger.error(errorMessage);

    metrics.addMetric('DeleteEmployeeError', MetricUnit.Count, 1);

    return errorHandler(error);
  }
};

export const handler = middy(deleteEmployeeAdapter)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics));
