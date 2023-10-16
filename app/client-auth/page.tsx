"use client";

import { decodeIdToken, signIn } from "@/src/cognito";
import { useEffect, useState } from "react";

const ClientAuthPage = () => {
  const [user, setUser] = useState<string | null>(null);

  const handleForm = async (data: FormData) => {
    console.log(data);
    const username = data.get("email") as string;
    const password = data.get("pass") as string;
    try {
      const response = await signIn(username, password);
      if (response) {
        const IdToken = response["AuthenticationResult"]!["IdToken"];
        if (IdToken) {
          localStorage.setItem("IdToken", IdToken);
          const user = (await decodeIdToken(IdToken)) as any;
          setUser(user);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {}, [user]);

  return (
    <div className="dark:bg-slate-800">
      <div className="mx-auto max-w-3xl px-5">
        <div className="flex flex-col justify-center h-screen">
          {!user ? (
            <form action={handleForm}>
              <div className="grid gap-6 mb-6 grid-cols-1 max-w-[450px] mx-auto bg-slate-300 dark:bg-slate-500 px-10 py-10 rounded-sm shadow-md">
                <div>
                  <label
                    htmlFor="description"
                    className="block mb-2 text-sm font-medium dark:text-white"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="text"
                    placeholder="demo@entest.io"
                    name="email"
                    className="text-sm rounded-sm block w-full p-2.5 outline-none focus:outline-none focus:border-2 focus:border-blue-500 focus:ring-blue-500 focus:rounded-sm"
                  ></input>
                </div>
                <div>
                  <label
                    htmlFor="pass"
                    className="block mb-2 text-sm font-medium dark:text-white"
                  >
                    Pass
                  </label>
                  <input
                    id="pass"
                    type="text"
                    placeholder="Demo@2023"
                    name="pass"
                    className="text-sm rounded-sm block w-full p-2.5 outline-none focus:outline-none focus:border-2 focus:border-blue-500 focus:ring-blue-500 focus:rounded-sm"
                  ></input>
                </div>
                <div>
                  <button className="bg-orange-400 px-10 py-3 rounded-sm">
                    Log In
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center  dark:text-white">
              <h1>Token</h1>
              <textarea
                className=" bg-slate-300 dark:bg-slate-600 rounded-sm w-full p-3 m-5"
                rows={8}
              >
                {localStorage.getItem("IdToken")}
              </textarea>
              <h1>Decoded Token</h1>
              <textarea
                className="bg-slate-300 dark:bg-slate-600 rounded-s w-full p-3 m-5"
                rows={8}
              >
                {JSON.stringify(user)}
              </textarea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ClientAuthPage;
