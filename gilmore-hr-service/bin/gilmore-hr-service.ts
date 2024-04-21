#!/usr/bin/env node

import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';

import { GilmoreHrServiceStatefulStack } from '../stateful/stateful';
import { GilmoreHrServiceStatelessStack } from '../stateless/stateless';

const app = new cdk.App();
const gilmoreHrServiceStatefulStack = new GilmoreHrServiceStatefulStack(
  app,
  'GilmoreHrServiceStatefulStack',
  {}
);
new GilmoreHrServiceStatelessStack(app, 'GilmoreHrServiceStatelessStack', {
  table: gilmoreHrServiceStatefulStack.table,
});
