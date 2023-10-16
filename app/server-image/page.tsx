// "use server";

import axios from "axios";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import { config } from "@/config";

type Image = {
  id: string;
  url: string;
};

const getImages = async () => {
  let images: Image[] = [];

  // const idToken = ""
  // const sessionToken = cookies().get("__Secure-next-auth.session-token");
  const sessionToken = cookies().get("next-auth.session-token");

  if (sessionToken) {
    const user = await decode({
      token: sessionToken?.value,
      secret: process.env.JWT_SECRET as string,
    });
    console.log(user);
    const idToken = user!.id_token;

    try {
      const { data, status } = await axios.get<any>(config.API_URL_IMAGE, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });
      console.log(data.Items);
      images = data.Items as [Image];
    } catch (error) {
      console.log(error);
    }
  }

  return images;
};

const RestPage = async () => {
  const images = (await getImages()) as [Image];

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
