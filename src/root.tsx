import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
  useMatches,
} from "@remix-run/react";

import Header from "./components/Header";

import reset from "./styles/reset.css";
import variables from "./styles/variables.css";
import shared from "./styles/shared.css";
import main from "./styles/main.css";
import { userSession } from "./services/session.server";
import AuthProvider from "./context/auth";

export function links() {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com", key: "" },
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
      crossOrigin: "true",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;700&display=swap",
    },
    { rel: "stylesheet", href: reset },
    { rel: "stylesheet", href: variables },
    { rel: "stylesheet", href: shared },
    { rel: "stylesheet", href: main },
  ];
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "neo.cities",
  viewport: "width=device-width,initial-scale=1",
});

export const loader: LoaderFunction = async ({ request }) => {
  const user = await userSession(request);

  return {
    user,
  };
};

export default function App() {
  const { user } = useLoaderData();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <main className="layout">
          <AuthProvider user={user}>
            <Header />
            <section className="content">
              <Outlet />
            </section>
          </AuthProvider>
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export const Error = () => {
  const caught = useCatch();

  const errors: { [key: number]: string } = {
    401: "You are not logged in.",
    403: "You do not own this address.",
  };

  const keys: number[] = Object.keys(errors).map(Number);

  return (
    <article className="error__container">
      <p className="error__message">
        {keys.includes(caught.status) === false
          ? "Unknown error"
          : errors[caught.status]}
        <br />
        <Link to="/" className="error__link">
          Home
        </Link>
      </p>
    </article>
  );
};

export function CatchBoundary() {
  return (
    <html>
      <head>
        <title>Error</title>
        <Meta />
        <Links />
      </head>
      <body>
        <main className="layout">
          <Header />
          <section className="content">
            <Error />
          </section>
        </main>
        <Scripts />
      </body>
    </html>
  );
}
