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
