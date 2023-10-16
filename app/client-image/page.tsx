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
