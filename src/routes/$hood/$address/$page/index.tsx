import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import storage from "~/services/storage.server";
import { getOwnedAddress, getAddress } from "~/services/db.server";
import { userSession, error } from "~/services/session.server";
import { addTargetTop, convertStreamToString, toBuffer } from "~/utils/convert";

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

type AcceptedFileTypes = ".gif" | ".jpg" | ".jpeg" | ".html";

export const loader: LoaderFunction = async ({ request, params }) => {
  const address = await getAddress(params.hood, params.address);

  if (!address.owner) {
    return redirect(`/${params.hood}/${params.address}/claim`);
  }

  const user = await userSession(request);
  const url = new URL(request.url);
  const raw = Boolean(url.searchParams.get("raw") || false);

  const lookup: Record<AcceptedFileTypes, string> = {
    ".gif": "image/gif",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".html": "text/html",
  };

  const extension = params.page?.substring(
    params.page?.lastIndexOf(".")
  ) as AcceptedFileTypes;

  if (!extension || Object.keys(lookup).includes(extension) === false) {
    throw new Response("Unsupported media type", {
      status: 404,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  const mimetype = lookup[extension];

  if (raw === false && user.id === address.owner && mimetype === "text/html") {
    return redirect(`/${params.hood}/${params.address}/${params.page}/preview`);
  }

  const content: ReadableStream = await storage.download(
    `${address.id}/${params.page}`
  );

  if (mimetype === "text/html") {
    const converted = await convertStreamToString(content);

    const preview =
      user.id === address.owner ? addTargetTop(converted) : converted;

    return new Response(preview, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  }

  return new Response(await toBuffer(content), {
    status: 200,
    headers: {
      "Content-Type": mimetype,
    },
  });
};
