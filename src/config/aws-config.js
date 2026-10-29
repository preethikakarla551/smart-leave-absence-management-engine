export const awsConfig = {
  Auth: {
    region: process.env.REACT_APP_AWS_REGION || "us-east-1",
    userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID || "us-east-1_example",
    userPoolWebClientId: process.env.REACT_APP_COGNITO_CLIENT_ID || "exampleclientid123"
  },
  api: {
    baseUrl: process.env.REACT_APP_API_GATEWAY_URL || "https://api.example.com/prod"
  }
};
