import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

import { Construct } from 'constructs';

export class GilmoreHrServiceStatefulStack extends cdk.Stack {
  public table: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create the dynamodb table for storing the employee and leave records together
    this.table = new dynamodb.Table(this, 'Table', {
      tableName: 'gilmore-hr-table',
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'version',
        type: dynamodb.AttributeType.NUMBER,
      },
    });
  }
}
