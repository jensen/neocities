import type { ActionFunction, UploadHandler } from "@remix-run/node";
import { unstable_parseMultipartFormData, redirect } from "@remix-run/node";
import db from "~/services/db.server";
import storage from "~/services/storage.server";
import { userSession, error } from "~/services/session.server";

export const action: ActionFunction = async ({ request, params }) => {
  const user = await userSession(request);

  error[401](!user.id);

  const [address] = await db(
    `
    select addresses.id, addresses.owner_id as owner
    from addresses join hoods on hoods.id = addresses.hood_id
    where hoods.name = $1 and addresses.number = $2 and owner_id = $3
    `,
    [params.hood, params.address, user.id]
  );

  error[403](!address);

  const uploadHandler: UploadHandler = async ({
    filename,
    mimetype,
    name,
    stream,
  }) => {
    debugger;
    if (name !== "files") {
      throw new Error("Name must be 'files'");
    }

    if (mimetype !== "text/html") {
      throw new Error("Mimetype must be 'text/html'");
    }

    await storage.stream(`${address.id}/${filename}`, stream);

    return filename;
  };

  try {
    await unstable_parseMultipartFormData(request, uploadHandler);
  } catch (error) {
    throw new Response("Incorrect Body", {
      status: 400,
    });
  }

  return redirect(`/${params.hood}/${params.address}/`);
};
