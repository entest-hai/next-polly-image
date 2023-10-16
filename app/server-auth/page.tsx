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
