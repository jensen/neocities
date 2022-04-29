import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import storage from "~/services/storage.server";
import { getAddress } from "~/services/db.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  if (isNaN(Number(params.address))) {
    throw new Response("Cannot find address.", {
      status: 404,
    });
  }

  const address = await getAddress(params.hood, params.address);

  if (!address) {
    throw new Response("Cannot find address.", {
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
