const userPoolId =
  process.env.REACT_APP_COGNITO_USER_POOL_ID || 'us-east-2_pJ1RJ3RlC';
const userPoolClientId =
  process.env.REACT_APP_COGNITO_CLIENT_ID || '7ctpbbg2krpi6j12klfhon3qoa';
const apiBaseUrl =
  process.env.REACT_APP_API_GATEWAY_URL ||
  'https://emn60eoat1.execute-api.us-east-2.amazonaws.com';

export const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId,
      loginWith: {
        email: true
      }
    }
  },
  api: {
    baseUrl: apiBaseUrl.replace(/\/$/, '')
  }
};
