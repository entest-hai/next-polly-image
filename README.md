---
title: build an image gallery app
description: build an image gallery app
author: haimtran
publishedDate: 06/12/2023
date: 2023-06-13
---

## Cognito UserPool

Create a cognito userpool, and select sigin by email as below image. Please read [HERE](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html) to see options when signin and signup

![create-cognito-userpool](./assets/create-cognito-userpool.png)

First let sign up a new user by code as the following or from the aws console.

```ts
import { config } from "./config";
import {
  CognitoIdentityProviderClient,
  AdminSetUserPasswordCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient({
  region: config.REGION,
});

const signUp = async (username: string, password: string) => {
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
```

Next we have to set a password for the new created user

```ts
// username here is the subid
const setpass = async (username: string, pass: string) => {
  const response = await cognitoClient.send(
    new AdminSetUserPasswordCommand({
      Password: pass,
      Username: username,
      UserPoolId: config.USER_POOL_ID,
      Permanent: true,
    })
  );
  console.log(response);
};
```

Finally we can login and get tokens

```ts
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
```

## ID Token and Credentials

Given the idToken we can exchange it for credentials and call aws services provided that iam role and policies have been setup for the idetnity pool.

```ts
const getCredentials = async () => {
  const response = await cognitoClient.send(
    new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: "email",
        PASSWORD: "Pass",
      },
      ClientId: config.CLIENT_ID,
    })
  );

  console.log(response);

  const IdToken = response["AuthenticationResult"]!["IdToken"] as string;
  const cognitoPoolId = config.COGNITO_POOL_ID;

  const credentials = fromCognitoIdentityPool({
    clientConfig: { region: config.REGION },
    identityPoolId: config.IDENTITY_POOL_ID as string,
    // should note specify for guest users
    logins: {
      cognitoPoolId: `${IdToken}`,
    },
  });

  const retrievs = await credentials.call(this);
  console.log(retrievs);
};

getCredentials();
```

The output credential template

```json
{
  identityId: 'us-east-1:926c0b7f-adab-4fbe-9d96-48789480ef0f',
  accessKeyId: 'ASIA6LHEOHPKW4TO5SGV',
  secretAccessKey: 'ONAVFvH4JcWMFcBgKP4mwVVqCYhtrTJMnRK9al0a',
  sessionToken: 'IQoJb3JpZ2luX2VjEPnO',
  expiration: 2023-10-12T09:34:32.000Z
}
```

For guest user

![cognito-identity-pool](./assets/cognito-identity-pool-guest.png)

## Client React App

Let create a image page which call REST API with CognitoAuth to get a list of image

```ts
"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { config } from "@/config";

type Image = {
  id: string;
  url: string;
};

const RestPage = () => {
  const [images, setImages] = useState<Image[]>([]);

  const getImages = async () => {
    const token = localStorage.getItem("IdToken");
    const { data, status } = await axios.get(config.API_URL_IMAGE, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log(data);
    setImages(data.Items);
  };

  useEffect(() => {
    getImages();
  }, []);

  useEffect(() => {}, [images]);

  return (
    <div className="min-h-screen dark:bg-slate-800">
      <div className="mx-auto max-w-3xl dark:bg-slate-800 dark:text-white px-5">
        <div className="grid grid-cols-1 gap-5">
          {images.map((image, id) => (
            <div key={id}>
              <img src={image.url}></img>
              {image.id}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestPage;
```

## NextJS Server Side

> [!IMPORTANT]  
> Please set up prerequisites as below

- Cognito domain
- Application client with secret
- Hosted UI with callback URLs

Here is a cognito domain

![cognito-domain](./assets/cognito-domain.png)

The created application client look like this

![cognito-client-secret](./assets/cognito-app-client.png)

The callback urls

![cognito-hosted-ui-callback-urls](./assets/cognito-ui-hosted-domain.png)

> Now let write a login page which will redirect to the cognito hosted ui. After logged in successfully, tokens will be set or stored in browser cookies

```ts
// test 3
"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { SessionProvider } from "next-auth/react";

const LoginPage = () => {
  const { data: session, status } = useSession();

  return (
    <div className="dark:bg-slate-800 min-h-screen">
      <div className="dark:bg-slate-800 flex min-h-screen flex-col items-center max-w-4xl bg-slate-100 mx-auto justify-center">
        {session?.user ? (
          <>
            <button
              className="bg-orange-400 px-20 py-3 rounded-sm"
              onClick={() => signOut()}
            >
              Sign Out
            </button>
          </>
        ) : (
          <div className="dark:bg-slate-800 flex min-h-screen flex-col items-center max-w-4xl bg-slate-100 mx-auto justify-center">
            <button
              type="submit"
              className="bg-orange-400 px-20 py-3 rounded-sm cursor-pointer"
              onClick={() => signIn("cognito")}
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const LoginPageHai = () => {
  return (
    <SessionProvider>
      <LoginPage></LoginPage>
    </SessionProvider>
  );
};

export default LoginPageHai;
```

Given the encoded token stored in the browser cookie, when the browser access a protected page, we can get the token and call authenticated apis or aws serverices. For example, let careate a private page which get a list of image from an authenticated api

```ts
import axios from "axios";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import { config } from "@/config";

type Image = {
  id: string;
  url: string;
};

const getImages = async () => {
  // const idToken = "

  // const sessionToken = cookies().get("__Secure-next-auth.session-token");
  const sessionToken = cookies().get("next-auth.session-token");
  console.log(sessionToken);

  const user = await decode({
    token: sessionToken?.value,
    secret: process.env.JWT_SECRET as string,
  });

  console.log(user);

  const idToken = user!.id_token;

  const { data, status } = await axios.get<any>(config.API_URL_IMAGE, {
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
  });
  console.log(data.Items);
  return data.Items as [Image];
};

const RestPage = async () => {
  const images = (await getImages()) as [Image];

  // const images: Image[] = [];

  return (
    <div className="min-h-screen dark:bg-slate-800">
      <div className="mx-auto max-w-3xl dark:bg-slate-800 dark:text-white px-5">
        <div className="grid grid-cols-1 gap-5">
          {images.map((image, id) => (
            <div key={id}>
              <img src={image.url}></img>
              {image.id}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestPage;
```

## Server Side Upload

- Server component get token from cookie and create a S3 client
- Upload to S3 using the S3Client

> [!IMPORTANT]  
> Please make sure that the identity pool and the client are correct as the below picture

![cognito-identity-pool-client-app](./assets/cognito-identity-pool-app-client.png)

```ts
import { uploadToS3 } from "./action";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";

const getToken = async () => {
  let idToken: string | null = null;

  const sessionToken = cookies().get("next-auth.session-token");
  if (sessionToken) {
    const user = await decode({
      token: sessionToken?.value,
      secret: process.env.JWT_SECRET as string,
    });
    console.log(user);
    idToken = user!.id_token as string;
  }

  return idToken;
};

const hanleForm = async (data: FormData) => {
  "use server";
  const file = data.get("upload") as File;
  const idToken = await getToken();

  if (idToken) {
    await uploadToS3(idToken, file);
  } else {
    console.log("not idtoken to upload");
  }
};

const UploadPage = async () => {
  const images: any[] = [];

  return (
    <div className="min-h-screen dark:bg-slate-800">
      <div className="max-w-3xl mx-auto  pt-10">
        <form className="p-5" action={hanleForm}>
          <div>
            <input
              id="upload"
              type="file"
              name="upload"
              className="text-sm rounded-sm w-full p-2.5 cursor-pointer dark:bg-white bg-slate-100"
            ></input>
          </div>
          <button className="bg-orange-400 px-10 py-3 rounded-sm mt-5">
            Upload
          </button>
        </form>
        <div className="grid grid-cols-1 gap-5 pt-10">
          {images.map((image, id) => (
            <div key={id} className="p-5 dark:text-white">
              <img src={image.url} alt={"test"}></img>
              <h1>{image.title}</h1>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
```

Server action to handle the upload

```ts
"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { config } from "@/config";

export const uploadToS3 = async (idToken: string, file: File) => {
  console.log("upload to s3 ", idToken);

  const bytes = await file.arrayBuffer();

  // s3 client
  const s3Client = new S3Client({
    region: config.REGION,
    credentials: fromCognitoIdentityPool({
      clientConfig: { region: config.REGION },
      identityPoolId: config.IDENTITY_POOL_ID,
      logins: {
        [config.COGNITO_POOL_ID]: idToken,
      },
    }),
  });

  // command to upload to s3
  const command = new PutObjectCommand({
    Bucket: config.BUCKET,
    Key: `public/${file.name}`,
    Body: Buffer.from(bytes),
  });

  // upload file to s3
  try {
    const res = await s3Client.send(command);
    console.log(res);
  } catch (error) {
    console.log("erorr upload to s3 ", error);
  }
};
```

## Dockerfile

Normal dockerfile

```ts
FROM node:16-alpine
RUN mkdir -p /app
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Then optimize to create smaller image

```ts
FROM node:18-alpine as builder
WORKDIR /my-space

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine as runner
WORKDIR /my-space
COPY --from=builder /my-space/package.json .
COPY --from=builder /my-space/package-lock.json .
COPY --from=builder /my-space/next.config.js ./
COPY --from=builder /my-space/public ./public
COPY --from=builder /my-space/.next/standalone ./
COPY --from=builder /my-space/.next/static ./.next/static
EXPOSE 3000
ENTRYPOINT ["npm", "start"]
```

Further optmize dockerfile

```ts
FROM node:16-alpine AS deps
# FROM public.ecr.aws/docker/library/node:16-alpine

RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM node:16-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:16-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

## Build Image

First double check the next.config.js of each app

```ts
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  output: "standalone",
};

module.exports = nextConfig;
```

Second create ecr repository to store image. Then build and push image

```py
# please export ACCOUNT in terminal
import os

# parameters
REGION = "us-east-1"
REPO_NAME = "immage-gallery-ecr"
ACCOUNT = os.environ["ACCOUNT"]

# delete all docker images
os.system("sudo docker system prune -a")

# build image
os.system(f"sudo docker build -t {REPO_NAME} . ")

#  aws ecr login
os.system(f"aws ecr get-login-password --region {REGION} | sudo docker login --username AWS --password-stdin {ACCOUNT}.dkr.ecr.{REGION}.amazonaws.com")

# get image id
IMAGE_ID=os.popen(f"sudo docker images -q {REPO_NAME}:latest").read()

# tag image
os.system(f"sudo docker tag {IMAGE_ID.strip()} {ACCOUNT}.dkr.ecr.{REGION}.amazonaws.com/{REPO_NAME}:latest")

# create ecr repository
os.system(f"aws ecr create-repository --registry-id {ACCOUNT} --repository-name {REPO_NAME}")

# # push image to ecr
os.system(f"sudo docker push {ACCOUNT}.dkr.ecr.{REGION}.amazonaws.com/{REPO_NAME}:latest")
```

## Reference

- [Optimize Dockerfile](https://www.locofy.ai/blog/create-a-docker-image-of-your-nextjs-app)
