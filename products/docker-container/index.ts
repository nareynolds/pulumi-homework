// import * as pulumi from "@pulumi/pulumi";
import * as aws from '@pulumi/aws';
// import * as docker from "@pulumi/docker";

// create an ECR repository
const ecrRepository = new aws.ecr.Repository('ecrRepository', {
  name: 'express-helloworld',
  tags: { Name: 'express-helloworld' },
});
export const ecrRepositoryUrl = ecrRepository.repositoryUrl;

// NOTE: can't get the examples of ECR authentication to work, so I've commented out code below and pushed the image manually
// // Get the login credentials for the ECR registry
// const registryInfo = ecrRepository.registryId.apply(async id => {
//     const credentials = await aws.ecr.getCredentials({ registryId: id });
//     const decodedCredentials = Buffer.from(credentials.authorizationToken, "base64").toString();
//     const [username, password] = decodedCredentials.split(":");
//     if (!password || !username) {
//         throw new Error("Invalid credentials");
//     }
//     return {
//         server: credentials.proxyEndpoint,
//         username: username,
//         password: password,
//     };
// });

// // Build and push the Docker image with "latest" tag
// new docker.Image("my-image-latest", {
//     build: {
//         context: "../..",
//         dockerfile: "../server/Dockerfile",
//         platform: "linux/amd64",
//     },
//     imageName: pulumi.interpolate`${ecrRepository.repositoryUrl}:latest`,
//     registry: registryInfo,
// });
