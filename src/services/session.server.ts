import { createCookieSessionStorage } from "@remix-run/node";

let cookieSessionKeyA = process.env.COOKIE_SESSION_KEY_A;
let cookieSessionKeyB = process.env.COOKIE_SESSION_KEY_B;

if (cookieSessionKeyA && typeof cookieSessionKeyA !== "string") {
  throw new Error("Most provide COOKIE_SESSION_KEY_A");
}

if (cookieSessionKeyB && typeof cookieSessionKeyB !== "string") {
  throw new Error("Most provide COOKIE_SESSION_KEY_B");
}

const LENGTH = 604_800;

export const userSession = async (request) => {
  const { getSession } = create();
  const cookie = request.headers.get("Cookie");

  if (!cookie) {
    return { id: null };
  }

  const session = await getSession(cookie);
  const id = session.get("user_id");

  return { id };
};

export const error = {
  401: (condition) => {
    if (condition) {
      throw new Response("Unauthorized", {
        status: 401,
      });
    }
  },
  403: (condition) => {
    if (condition) {
      throw new Response("Forbidden", {
        status: 403,
      });
    }
  },
};

const storage = createCookieSessionStorage({
  cookie: {
    name: "auth",
    expires: new Date(Date.now() + LENGTH * 1000),
    httpOnly: true,
    maxAge: LENGTH,
    path: "/",
    sameSite: "lax",
    secrets: [cookieSessionKeyA, cookieSessionKeyB],
    secure: true,
  },
});

export const getSession = storage.getSession;
export const commitSession = storage.commitSession;

export default function create() {
  return storage;
}
