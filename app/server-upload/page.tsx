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
