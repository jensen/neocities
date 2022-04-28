import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

if (typeof process.env.DISCORD_CLIENT_ID !== "string") {
  throw new Error("Must declare DISCORD_CLIENT_ID");
}

if (typeof process.env.DISCORD_REDIRECT_URI !== "string") {
  throw new Error("Must declare DISCORD_REDIRECT_URI");
}

export let loader: LoaderFunction = async () => {
  const search = new URLSearchParams({
    response_type: "code",
    client_id: process.env.DISCORD_CLIENT_ID,
    scope: "identify email",
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
  }).toString();

  const url = new URL(`https://discord.com/api/oauth2/authorize?${search}`);

  return redirect(url.toString());
};
