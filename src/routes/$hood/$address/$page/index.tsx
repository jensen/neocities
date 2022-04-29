import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import storage from "~/services/storage.server";
import { getOwnedAddress, getAddress } from "~/services/db.server";
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

  const files = await storage.list(address.id);

  const body = await request.formData();

  const filename = body.get("filename");

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

export const loader: LoaderFunction = async ({ params }) => {
  const address = await getAddress(params.hood, params.address);

  if (!address.owner) {
    return redirect(`/${params.hood}/${params.address}/claim`);
  }

  const content: string = await storage.download(
    `${address.id}/${params.page}`
  );

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
    },
  });
};
