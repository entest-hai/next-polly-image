"use client";

import { decodeIdToken, signUp, signIn, confirmSignUp } from "@/src/cognito";
import { Auth } from "aws-amplify";
import { useEffect, useState } from "react";

enum AuthStatus {
  UnAuthenticated,
  Authenticated,
  ConfirmSignUp,
}

const ClientSignUp = () => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(
    AuthStatus.UnAuthenticated
  );

  const [xpass, setxpass] = useState<string>("");

  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {}, [authStatus]);

  const handleFormLogIn = async () => {
    const username = (document.getElementById("email") as HTMLInputElement)
      .value;
    const password = (document.getElementById("pass") as HTMLInputElement)
      .value;

    try {
      const response = await signIn(username, password);
      if (response) {
        const IdToken = response["AuthenticationResult"]!["IdToken"];
        if (IdToken) {
          localStorage.setItem("IdToken", IdToken);
          const user = (await decodeIdToken(IdToken)) as any;
          setUser(user);
          setAuthStatus(AuthStatus.Authenticated);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleFormSignUp = async () => {
    const username = (document.getElementById("email") as HTMLInputElement)
      .value;
    const password = (document.getElementById("pass") as HTMLInputElement)
      .value;

    setxpass(password);

    try {
      const response = await signUp(username, password);
      console.log(response);
      setAuthStatus(AuthStatus.ConfirmSignUp);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFormConfirmSignUp = async () => {
    try {
      const username = (document.getElementById("username") as HTMLInputElement)
        .value;
      const code = (document.getElementById("code") as HTMLInputElement).value;
      await confirmSignUp(username, code);

      try {
        const response = await signIn(username, xpass);
        if (response) {
          const IdToken = response["AuthenticationResult"]!["IdToken"];
          if (IdToken) {
            localStorage.setItem("IdToken", IdToken);
            const user = (await decodeIdToken(IdToken)) as any;
            setUser(user);
            setAuthStatus(AuthStatus.Authenticated);
          }
        }
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (authStatus === AuthStatus.UnAuthenticated) {
    return (
      <div className="dark:bg-slate-800">
        <div className="mx-auto max-w-3xl px-5">
          <div className="flex flex-col justify-center h-screen">
            <form>
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
                <div className="w-full flex">
                  <button
                    className="bg-orange-400 px-10 py-3 rounded-sm"
                    onClick={async (event) => {
                      event.preventDefault();
                      await handleFormSignUp();
                    }}
                  >
                    Sign Up
                  </button>
                  <button
                    className="bg-green-400 px-10 py-3 rounded-sm ml-auto"
                    onClick={async (event) => {
                      event.preventDefault();
                      await handleFormLogIn();
                    }}
                  >
                    Log In
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (authStatus === AuthStatus.ConfirmSignUp) {
    return (
      <div className="dark:bg-slate-800">
        <div className="mx-auto max-w-3xl px-5">
          <div className="flex flex-col justify-center h-screen">
            <form>
              <div className="grid gap-6 mb-6 grid-cols-1 max-w-[450px] mx-auto bg-slate-300 dark:bg-slate-500 px-10 py-10 rounded-sm shadow-md">
                <div>
                  <label
                    htmlFor="username"
                    className="block mb-2 text-sm font-medium dark:text-white"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    placeholder="demo@entest.io"
                    name="username"
                    className="text-sm rounded-sm block w-full p-2.5 outline-none focus:outline-none focus:border-2 focus:border-blue-500 focus:ring-blue-500 focus:rounded-sm"
                  ></input>
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block mb-2 text-sm font-medium dark:text-white"
                  >
                    Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    placeholder="111222333"
                    name="code"
                    className="text-sm rounded-sm block w-full p-2.5 outline-none focus:outline-none focus:border-2 focus:border-blue-500 focus:ring-blue-500 focus:rounded-sm"
                  ></input>
                </div>
                <div className="w-full flex">
                  <button
                    className="bg-orange-400 px-10 py-3 rounded-sm"
                    onClick={async (event) => {
                      event.preventDefault();
                      await handleFormConfirmSignUp();
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (authStatus === AuthStatus.Authenticated) {
    return (
      <div className="dark:bg-slate-800">
        <div className="mx-auto max-w-3xl px-5">
          <div className="flex flex-col justify-center h-screen">
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark:bg-slate-800">
      <div className="mx-auto max-w-3xl px-5">
        <div className="flex flex-col justify-center h-screen">
          {/* {!user ? (
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
                    Sign Up
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
          )} */}
        </div>
      </div>
    </div>
  );
};

export default ClientSignUp;
