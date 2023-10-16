import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { CognitoJwtVerifier } from "aws-jwt-verify";

import { config } from "@/config";

const cognitoClient = new CognitoIdentityProviderClient({
  region: config.REGION,
});

export const signUp = async (username: string, password: string) => {
  try {
    const response = await cognitoClient.send(
      new SignUpCommand({
        ClientId: config.CLIENT_ID,
        Username: username,
        Password: password,
      })
    );
    console.log(response);
  } catch (error) {
    console.log(error);
  }
};

export const confirm = async (username: string, code: string) => {
  try {
    const response = await cognitoClient.send(
      new ConfirmSignUpCommand({
        ClientId: config.CLIENT_ID,
        ConfirmationCode: code,
        Username: username,
      })
    );
    console.log(response);
  } catch (error) {
    console.log(error);
  }
};

export const signIn = async (username: string, password: string) => {
  try {
    const response = await cognitoClient.send(
      new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
        ClientId: config.CLIENT_ID,
      })
    );
    console.log("cognito auth: ", response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const signOut = async () => {
  localStorage.clear();
  console.log("sign out");
};

export const decodeIdToken = async (token: string) => {
  const verifier = CognitoJwtVerifier.create({
    userPoolId: config.USER_POOL_ID,
    tokenUse: "id",
    clientId: config.CLIENT_ID,
  });

  try {
    const payload = await verifier.verify(token, {
      tokenUse: "id",
      clientId: config.CLIENT_ID,
    });
    console.log("Token is valid. Payload:", payload);
    return payload;
  } catch {
    console.log("Token not valid!");
  }
};
