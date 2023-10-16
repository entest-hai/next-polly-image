"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { config } from "@/config";
import { getS3Object } from "@/src/storage";

type Message = {
  id: string;
  message: string;
  key: string;
};

const PollyMessage = () => {
  const [modal, setModal] = useState<Boolean>(false);
  const [url, setUrl] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const getMessages = async () => {
    const token = localStorage.getItem("IdToken");
    const response = await axios.get(config.API_URL_MESSAGE, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    setMessages(response.data.Items);
  };

  const saveMessage = async (story: string) => {
    const token = localStorage.getItem("IdToken");
    try {
      const { data, status } = await axios.post(
        config.API_URL_POLLY,
        { message: story, file_name: `user_${Date.now().toString()}.mp3` },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const getAudio = async (key: string) => {
    const token = localStorage.getItem("IdToken");
    try {
      const response = await getS3Object(token!, key);
      setUrl(response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getMessages();
  }, []);

  useEffect(() => {}, [messages]);

  return (
    <div className="min-h-screen dark:bg-slate-800">
      <div className="mx-auto max-w-3xl dark:bg-slate-800 dark:text-white">
        <div className="mb-5">
          <textarea
            id="message"
            name="message"
            rows={8}
            placeholder="write your message ..."
            className="p-2.5 w-full text-gray-900 bg-slate-200  rounded-lg border border-gray-300 focus:border-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 my-5 outline-none focus:outline-none"
          ></textarea>
          <button
            className="bg-orange-400 px-10 py-3 rounded-sm"
            onClick={async () => {
              const message = (
                document.getElementById("message") as HTMLInputElement
              ).value;
              await saveMessage(message);
              await getMessages();
            }}
          >
            Submit
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {messages.map((message, id) => (
            <div
              key={id}
              className="bg-slate-200 dark:bg-slate-600 rounded-lg shadow-lg px-3 py-3 relative"
            >
              {message.message}
              <button
                className="bg-orange-400 px-10 py-2 rounded-sm absolute top-0 right-0 cursor-pointer"
                onClick={async () => {
                  // document.getElementById("modal")!.style.display = "none";
                  await getAudio(message.key);
                  setModal(true);
                }}
              >
                Play
              </button>
            </div>
          ))}
        </div>
        {modal === true ? (
          <div
            className="fixed top-0 bottom-0 left-0 right-0 bg-slate-500 bg-opacity-70"
            id="modal"
          >
            <div className="mx-auto max-w-3xl sm:p-10 p-5">
              <div className="justify-center items-center flex bg-white py-20 px-10 rounded-lg relative">
                <audio controls key={url}>
                  <source src={url}></source>
                </audio>
                <button
                  className="bg-orange-400 px-10 py-3 rounded-sm absolute top-0 right-0"
                  onClick={() => {
                    // document.getElementById("modal")!.style.display = "none";
                    setModal(false);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default PollyMessage;
