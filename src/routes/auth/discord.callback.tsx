import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import db from "~/services/db.server";
import create from "~/services/session.server";

export let action: ActionFunction = async ({ request, params, context }) => {
  return redirect("/");
};

export let loader: LoaderFunction = async ({ request, params, context }) => {
  const code = new URL(request.url).searchParams.get("code");

  if (!code) return new Response(null, { status: 401 });

  const body = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
  });

  const token = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: body.toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const { access_token, expires_in, refresh_token } = await token.json();

  const discord = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  const { id, username, email, avatar } = await discord.json();

  const [{ add_new_user }] = await db("SELECT add_new_user($1, $2, $3, $4)", [
    id,
    email,
    username,
    avatar,
  ]);

  const { getSession, commitSession } = create();

  const session = await getSession(request.headers.get("Cookie"));

  session.set("user_id", add_new_user);
  session.set("token", access_token);

  const cookie = await commitSession(session);

  return redirect("/", {
    headers: {
      "Set-Cookie": cookie,
    },
  });
};
