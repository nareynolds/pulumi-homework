/**
 * Deploys "express-helloworld" to existing ECS using Fargate.
 */

import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';

const config = new pulumi.Config();
const stack = pulumi.getStack();
const org = config.require('org');
const awsAccountRef = new pulumi.StackReference(`${org}/aws-account/${stack}`);
const ecsInfraRef = new pulumi.StackReference(`${org}/ecs-infra/${stack}`);

// get VPC and subnets from aws-account stack
const subnetIds = awsAccountRef.getOutput('subnetIds');

// get values from ecs-infra
const ecsTaskExecutionRoleArn = ecsInfraRef.getOutput(
  'ecsTaskExecutionRoleArn'
);
const containerRoleArn = ecsInfraRef.getOutput(
  'expressHelloWorldContainerRoleArn'
);
const clusterArn = ecsInfraRef.getOutput('ecsCluster1Arn');
const ecsServiceSecurityGroupId = ecsInfraRef.getOutput(
  'expressHelloWorldEcsServiceSecurityGroupId'
);
const targetGroupArn = ecsInfraRef.getOutput('expressHelloWorldTargetGroupArn');
const logGroupName = ecsInfraRef.getOutput('expressHelloWorldLogGroupName');
const containerName = 'express-helloworld';

// get api-message from config
const apiMessage = config.require('api-message');

// Create the ECS Task Definition
const taskDefinition = new aws.ecs.TaskDefinition(
  'expressHelloWorld-ecsTaskDefinition',
  {
    containerDefinitions: logGroupName.apply((logGroupName: string) =>
      JSON.stringify([
        {
          cpu: 128,
          environment: [
            {
              name: 'API_MESSAGE',
              value: apiMessage,
            },
          ],
          essential: true,
          image:
            '024215879654.dkr.ecr.us-east-1.amazonaws.com/express-helloworld:latest', // TODO: should import this from "expressHelloWorldImageUri"
          logConfiguration: {
            logDriver: 'awslogs',
            options: {
              'awslogs-group': logGroupName,
              'awslogs-region': 'us-east-1', // TODO: should be config
              'awslogs-stream-prefix': logGroupName,
            },
          },
          memory: 512,
          mountPoints: [],
          name: containerName,
          portMappings: [
            {
              containerPort: 80,
              hostPort: 80,
              protocol: 'tcp',
            },
          ],
          systemControls: [],
          volumesFrom: [],
        },
      ])
    ),
    cpu: '256',
    executionRoleArn: ecsTaskExecutionRoleArn,
    family: containerName,
    memory: '512',
    networkMode: 'awsvpc',
    requiresCompatibilities: ['FARGATE'],
    taskRoleArn: containerRoleArn,
  },
  {
    // protect: true,
  }
);

// Create the ECS Service
const ecsService = new aws.ecs.Service('expressHelloWorld-ecsService', {
  name: 'expressHelloWorld-ecsService',
  cluster: clusterArn,
  taskDefinition: taskDefinition.arn,
  desiredCount: 2,
  launchType: 'FARGATE',
  platformVersion: 'LATEST',
  deploymentMaximumPercent: 200,
  deploymentMinimumHealthyPercent: 100,
  enableEcsManagedTags: false,
  enableExecuteCommand: false,
  waitForSteadyState: true,
  schedulingStrategy: 'REPLICA',
  availabilityZoneRebalancing: 'DISABLED',
  networkConfiguration: {
    assignPublicIp: true,
    securityGroups: [ecsServiceSecurityGroupId],
    subnets: subnetIds, // TODO: should import this
  },
  loadBalancers: [
    {
      containerName: containerName,
      containerPort: 80,
      targetGroupArn: targetGroupArn,
    },
  ],
  deploymentController: {
    type: 'ECS',
  },
  deploymentCircuitBreaker: {
    enable: false,
    rollback: false,
  },
  propagateTags: 'NONE',
  healthCheckGracePeriodSeconds: 0,
});
