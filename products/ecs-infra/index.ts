/**
 * Create "express-helloworld" ECS infrastructure and networking.
 */

import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';

const config = new pulumi.Config();
const stack = pulumi.getStack();
const org = config.require('org');
const awsAccountRef = new pulumi.StackReference(`${org}/aws-account/${stack}`);

// get VPC and subnets from aws-account stack
const vpcId = awsAccountRef.getOutput('vpcId');
const subnetIds = awsAccountRef.getOutput('subnetIds');

// create ECS cluster
const cluster = new aws.ecs.Cluster('ecsCluster1');
export const ecsCluster1Arn = cluster.arn;

// create a load balancer security group
const albSecurityGroup = new aws.ec2.SecurityGroup(
  'expressHelloWorld-loadBalancer-securityGroup',
  {
    egress: [
      {
        cidrBlocks: ['0.0.0.0/0'],
        fromPort: 0,
        ipv6CidrBlocks: ['::/0'],
        protocol: 'tcp',
        toPort: 65535,
      },
    ],
    ingress: [
      {
        cidrBlocks: ['0.0.0.0/0'],
        fromPort: 0,
        ipv6CidrBlocks: ['::/0'],
        protocol: '-1',
        toPort: 0,
      },
    ],
    name: 'expressHelloWorld-loadBalancer-securityGroup',
    vpcId,
  },
  {
    // protect: true,
  }
);

// create a load balancer
const loadBalancer = new aws.lb.LoadBalancer(
  'expressHelloWorld-loadBalancer',
  {
    enableCrossZoneLoadBalancing: true,
    ipAddressType: 'ipv4',
    loadBalancerType: 'application',
    name: 'expressHelloWorld-loadBalancer',
    securityGroups: [albSecurityGroup.id],
    subnets: subnetIds,
  },
  {
    // protect: true,
  }
);

// create a load balancer target groups
const targetGroup = new aws.lb.TargetGroup(
  'expressHelloWorld-targetGroup',
  {
    deregistrationDelay: 300,
    healthCheck: {
      healthyThreshold: 5,
      matcher: '200',
      path: '/',
      protocol: 'HTTP',
      timeout: 5,
      unhealthyThreshold: 2,
    },
    ipAddressType: 'ipv4',
    name: 'expressHelloWorld-targetGroup',
    port: 80,
    protocol: 'HTTP',
    targetType: 'ip',
    vpcId,
  },
  {
    // protect: true,
  }
);
export const expressHelloWorldTargetGroupArn = targetGroup.arn;

// create a load balancer listener
const listener = new aws.lb.Listener(
  'expressHelloWorld-listener',
  {
    defaultActions: [
      {
        targetGroupArn: targetGroup.arn,
        type: 'forward',
      },
    ],
    loadBalancerArn: loadBalancer.arn,
    port: 80,
    protocol: 'HTTP',
    routingHttpResponseServerEnabled: true,
  },
  {
    // protect: true,
  }
);

// create a log group
const logGroup = new aws.cloudwatch.LogGroup(
  'expressHelloWorld-logGroup',
  {
    logGroupClass: 'STANDARD',
    name: 'express-helloworld',
  },
  {
    // protect: true,
  }
);
export const expressHelloWorldLogGroupName = logGroup.name;

// create a generic task execution role
const ecsTaskExecutionRole = new aws.iam.Role(
  'ecsTaskExecutionRole',
  {
    assumeRolePolicy: JSON.stringify({
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            Service: 'ecs-tasks.amazonaws.com',
          },
          Sid: '',
        },
      ],
      Version: '2012-10-17',
    }),
    managedPolicyArns: [
      'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy',
    ],
    name: 'ecsTaskExecutionRole',
  },
  {
    // protect: true,
  }
);
export const ecsTaskExecutionRoleArn = ecsTaskExecutionRole.arn;

// create a container role, i.e. ECS task role
const ecsContainerRole = new aws.iam.Role(
  'expressHelloWorld-ecsContainerRole',
  {
    assumeRolePolicy: JSON.stringify({
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            Service: 'ecs-tasks.amazonaws.com',
          },
          Sid: '',
        },
      ],
      Version: '2012-10-17',
    }),
    name: 'expressHelloWorld-ecsContainerRole',
  },
  {
    // protect: true,
  }
);
export const expressHelloWorldContainerRoleArn = ecsContainerRole.arn;

// create a security group for the ECS service
const ecsServiceSecurityGroup = new aws.ec2.SecurityGroup(
  'expressHelloWorld-ecsService-SecurityGroup',
  {
    egress: [
      {
        cidrBlocks: ['0.0.0.0/0'],
        fromPort: 0,
        ipv6CidrBlocks: ['::/0'],
        protocol: 'tcp',
        toPort: 65535,
      },
    ],
    ingress: [
      {
        cidrBlocks: ['0.0.0.0/0'],
        fromPort: 0,
        ipv6CidrBlocks: ['::/0'],
        protocol: '-1',
        toPort: 0,
      },
    ],
    name: 'expressHelloWorld-ecsService-SecurityGroup',
    vpcId,
  },
  {
    // protect: true,
  }
);
export const expressHelloWorldEcsServiceSecurityGroupId =
  ecsServiceSecurityGroup.id;
