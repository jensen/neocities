import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import storage from "~/services/storage.server";
import { getAddress } from "~/services/db.server";
import { userSession } from "~/services/session.server";
import { addTargetTop, convertStreamToString } from "~/utils/convert";

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

  const user = await userSession(request);
  const url = new URL(request.url);
  const raw = Boolean(url.searchParams.get("raw") || false);

  if (raw === false && user.id === address.owner) {
    return redirect(`/${params.hood}/${params.address}/preview`);
  }

  const content: ReadableStream = await storage.download(
    `${address.id}/index.html`
  );

  const converted = await convertStreamToString(content);
  const preview =
    user.id === address.owner ? addTargetTop(converted) : converted;

  return new Response(preview, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
