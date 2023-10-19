"use server";

import { getSignedUrl } from "aws-cloudfront-sign";

const getUrl = async () => {
  var signedUrl = getSignedUrl(
    "https://d3shewy8rzes6o.cloudfront.net/private-data/dolphin.png",
    {
      keypairId: process.env.PUBLIC_KEY_ID as string,
      privateKeyString: Buffer.from(
        process.env.PRIVATE_KEY!,
        "base64"
      ).toString(),
      // privateKeyPath: "./app/sign/private_key.pem",
    }
  );
  console.log(signedUrl);
  return signedUrl;
};

const getVideo = async () => {
  var signedUrl = getSignedUrl(
    "https://d3shewy8rzes6o.cloudfront.net/private-data/dev_on_aws_lab_3.mp4",
    {
      keypairId: process.env.PUBLIC_KEY_ID as string,
      privateKeyString: Buffer.from(
        process.env.PRIVATE_KEY!,
        "base64"
      ).toString(),
    }
  );
  console.log(signedUrl);
  return signedUrl;
};

const SignImage = async () => {
  const url = await getUrl();
  const video = await getVideo();

  return (
    <div className="min-h-screen dark:bg-slate-800">
      <div className="mx-auto max-w-3xl dark:bg-slate-800 dark:text-white">
        <div>{url ? <img src={url} alt="test"></img> : ""}</div>
        <div>
          {video ? (
            <video controls className=" py-5 cursor-pointer" poster={url}>
              <source src={video}></source>
            </video>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default SignImage;
