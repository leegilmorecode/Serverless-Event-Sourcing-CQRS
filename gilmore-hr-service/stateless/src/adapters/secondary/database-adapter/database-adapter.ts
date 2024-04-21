import {
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandInput,
  QueryCommand,
  QueryCommandInput,
  TransactWriteItem,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { config } from '@config';
import { ValidationError } from '@errors/validation-error';
import { logger } from '@shared';

const dynamoDBClient = new DynamoDBClient();
const tableName = config.get('tableName');

export async function list(id: string): Promise<any[] | undefined> {
  try {
    // get the last ten records with consistent read which could include a snapshot
    // and return them in reverse order i.e. the most recent ten records
    const params: QueryCommandInput = {
      TableName: tableName,
      Limit: 10,
      ScanIndexForward: false,
      ConsistentRead: true,
      KeyConditionExpression: '#id = :id',
      ExpressionAttributeNames: {
        '#id': 'id',
      },
      ExpressionAttributeValues: {
        ':id': { S: id },
      },
    };
    const command = new QueryCommand(params);
    const response = await dynamoDBClient.send(command);
    if (response.Items) {
      return response.Items.map((item) => unmarshall(item));
    } else {
      throw new ValidationError('items not found');
    }
  } catch (error) {
    logger.error(`error: ${JSON.stringify(error)}`);
    throw error;
  }
}

export async function create(item: any): Promise<void> {
  try {
    const params: PutItemCommandInput = {
      TableName: tableName,
      ConditionExpression: 'attribute_not_exists(version)', // ensure we dont have a conflict
      Item: marshall({
        ...item,
        id: item.id,
        version: item.version,
      }),
    };
    const command = new PutItemCommand(params);
    await dynamoDBClient.send(command);
  } catch (error) {
    logger.error(`error: ${JSON.stringify(error)}`);
    throw error;
  }
}

export async function createWithSnapshot(
  item: any,
  snapshot: any
): Promise<void> {
  const transactionRequests: TransactWriteItem[] = [];

  try {
    // add the event to the transaction
    const itemParams: PutItemCommandInput = {
      TableName: tableName,
      ConditionExpression: 'attribute_not_exists(version)', // ensure we dont have a conflict
      Item: marshall({
        ...item,
        id: item.id,
        version: item.version,
      }),
    };
    transactionRequests.push({ Put: itemParams });

    // create a snapshot then add it to the transaction
    const snapshotParams: PutItemCommandInput = {
      TableName: tableName,
      ConditionExpression: 'attribute_not_exists(version)', // ensure we dont have a conflict
      Item: marshall({
        ...snapshot,
        id: snapshot.id,
        version: snapshot.version,
      }),
    };
    transactionRequests.push({ Put: snapshotParams });

    // execute the transaction
    await dynamoDBClient.send(
      new TransactWriteItemsCommand({
        TransactItems: transactionRequests,
      })
    );
  } catch (error) {
    logger.error(`error: ${JSON.stringify(error)}`);
    throw error;
  }
}
