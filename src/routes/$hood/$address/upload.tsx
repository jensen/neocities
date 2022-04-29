import type { ActionFunction, UploadHandler } from "@remix-run/node";
import { unstable_parseMultipartFormData, redirect } from "@remix-run/node";
import { getOwnedAddress } from "~/services/db.server";
import storage from "~/services/storage.server";
import { userSession, error } from "~/services/session.server";

export const action: ActionFunction = async ({ request, params }) => {
  const user = await userSession(request);

  error[401](!user.id);

  if (!params.hood) {
    throw new Response("Must provide 'hood' param.", {
      status: 400,
    });
  }

  if (!params.address) {
    throw new Response("Must provide 'address' param.", {
      status: 400,
    });
  }

  const address = await getOwnedAddress(params.hood, params.address, user);

  error[403](!address);

  const uploadHandler: UploadHandler = async ({
    filename,
    mimetype,
    name,
    stream,
  }) => {
    debugger;
    if (name !== "files") {
      throw new Error("Name must be 'files'.");
    }

    if (mimetype !== "text/html") {
      throw new Error("Mimetype must be 'text/html'.");
    }

    await storage.stream(`${address.id}/${filename}`, stream);

    return filename;
  };

  try {
    await unstable_parseMultipartFormData(request, uploadHandler);
  } catch (error) {
    throw new Response("Could not upload.", {
      status: 400,
    });
  }

  return redirect(`/${params.hood}/${params.address}/`);
};
