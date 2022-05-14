import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export let loader: LoaderFunction = async () => {
  if (!process.env.DISCORD_CLIENT_ID)
    return new Response(null, { status: 500 });

  if (!process.env.DISCORD_REDIRECT_URI)
    return new Response(null, { status: 500 });

  const search = new URLSearchParams({
    response_type: "code",
    client_id: process.env.DISCORD_CLIENT_ID,
    scope: "identify email",
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
  }).toString();

  const url = new URL(`https://discord.com/api/oauth2/authorize?${search}`);

  return redirect(url.toString());
};
