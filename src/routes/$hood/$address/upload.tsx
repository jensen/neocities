import type { ActionFunction, UploadHandler } from "@remix-run/node";
import { unstable_parseMultipartFormData, redirect } from "@remix-run/node";
import db from "../../../services/db.server";
import storage from "../../../services/storage.server";

export const action: ActionFunction = async ({ request, params }) => {
  const [address] = await db(
    `
    select addresses.id, addresses.owner_id as owner
    from addresses join hoods on hoods.id = addresses.hood_id
    where hoods.name = $1 and addresses.number = $2
    `,
    [params.hood, params.address]
  );

  const uploadHandler: UploadHandler = async ({
    filename,
    mimetype,
    name,
    stream,
  }) => {
    if (name !== "files") {
      stream.resume();
      return;
    }

    if (mimetype !== "text/html") {
      stream.resume();
      return;
    }

    await storage.stream(`${address.id}/${filename}`, stream);

    return filename;
  };

  await unstable_parseMultipartFormData(request, uploadHandler);

  return redirect(`/`);
};
