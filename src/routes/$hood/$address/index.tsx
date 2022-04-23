import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import storage from "../../../services/storage.server";
import db from "../../../services/db.server";

export const action: ActionFunction = async ({ request, params }) => {
  const body = await request.formData();

  const filename = body.get("filename");

  const [address] = await db(
    `
    select addresses.id
    from addresses join hoods on hoods.id = addresses.hood_id
    where hoods.name = $1 and addresses.number = $2
    `,
    [params.hood, params.address]
  );

  const files = await storage.list(address.id);

  if (files?.includes(`${filename}.html`)) {
    throw new Response("File is duplicate.", {
      status: 400,
    });
  }

  try {
    await storage.upload(`${address.id}/${filename}.html`, "");
  } catch (error) {
    throw new Response("Unable to create file.", {
      status: 500,
    });
  }

  return redirect(`/${params.hood}/${params.address}/${filename}.html/edit`);
};

export const loader: LoaderFunction = async ({ request, params }) => {
  if (isNaN(Number(params.address))) {
    throw new Response("Cannot find address", {
      status: 404,
    });
  }

  const [address] = await db(
    `
    select addresses.id, addresses.owner_id as owner
    from addresses join hoods on hoods.id = addresses.hood_id
    where hoods.name = $1 and addresses.number = $2
    `,
    [params.hood, params.address]
  );

  if (!address) {
    throw new Response("Cannot find address", {
      status: 404,
    });
  }

  if (!address.owner) {
    return redirect(`/${params.hood}/${params.address}/claim`);
  }

  const content = await storage.download(`${address.id}/index.html`);

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
    },
  });
};
