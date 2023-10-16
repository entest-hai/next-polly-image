"use client";

import { getS3Object, uploadToS3 } from "@/src/storage";
import axios from "axios";
import { useEffect, useState } from "react";
import { config } from "@/config";

type Image = {
  id: string;
  url: string;
};

const UploadPage = () => {
  const submit = async (data: FormData) => {
    const token = localStorage.getItem("IdToken");
    const file = data.get("upload") as File;

    if (token) {
      await uploadToS3(token!, file);

      // const response = await axios.post(
      //   config.API_URL_IMAGE,
      //   {
      //     url: file.name,
      //   },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );

      // console.log(response);
      // await getImages();
    }
  };

  const [images, setImages] = useState<Image[]>([]);

  const getImages = async () => {
    const token = localStorage.getItem("IdToken");
    const { data, status } = await axios.get(config.API_URL_IMAGE, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    let images: Image[] = [];
    for (var item of data.Items) {
      const url = await getS3Object(token!, `public/${item.url}`);
      images.push({ id: item.id, url: url });
      console.log(url);
    }

    setImages(images);
  };

  useEffect(() => {
    // getImages();
  }, []);

  useEffect(() => {}, [images]);

  return (
    <div className="min-h-screen dark:bg-slate-800">
      <div className="mx-auto p-10 max-w-3xl ">
        <form action={submit}>
          <div className="grid gap-6 mb-6 grid-cols-1 shadow-lg p-10 dark:bg-slate-700 mt-10">
            <div>
              <label
                htmlFor="upload"
                className="block mb-2 text-sm font-medium dark:text-white"
              >
                Upload File
              </label>
              <input
                id="upload"
                type="file"
                name="upload"
                className="text-sm rounded-sm w-full p-2.5 cursor-pointer dark:bg-white bg-slate-200"
              ></input>
            </div>
            <div>
              <button className="bg-orange-400 px-10 py-3 rounded-sm">
                Submit
              </button>
            </div>
          </div>
        </form>
        <div className="grid grid-cols-1 gap-5 dark:text-white">
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

export default UploadPage;
