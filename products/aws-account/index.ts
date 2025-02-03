import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';

export const vpcId = 'vpc-a4c815d9';
export const subnetIds = [
  'subnet-72c3923f',
  'subnet-c48af1ca',
  'subnet-27865216',
  'subnet-7101832e',
  'subnet-663bb747',
  'subnet-afb637c9',
];
