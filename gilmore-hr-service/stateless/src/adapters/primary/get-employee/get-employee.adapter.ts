import { MetricUnit, Metrics } from '@aws-lambda-powertools/metrics';
import { errorHandler, logger } from '@shared';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import { Employee } from '@dto/employee';
import { ValidationError } from '@errors/validation-error';
import middy from '@middy/core';
import { getEmployeeUseCase } from '@use-cases/get-employee';

const tracer = new Tracer();
const metrics = new Metrics();

export const getEmployeeAdapter = async ({
  pathParameters,
}: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!pathParameters || !pathParameters?.id)
      throw new ValidationError('no parameters');

    const { id } = pathParameters;

    const created: Employee = await getEmployeeUseCase(id);

    metrics.addMetric('SuccessfulGetEmployee', MetricUnit.Count, 1);

    return {
      statusCode: 200,
      body: JSON.stringify(created),
    };
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) errorMessage = error.message;
    logger.error(errorMessage);

    metrics.addMetric('GetEmployeeError', MetricUnit.Count, 1);

    return errorHandler(error);
  }
};

export const handler = middy(getEmployeeAdapter)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics));
