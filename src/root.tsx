import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import reset from "./styles/reset.css";
import shared from "./styles/shared.css";
import main from "./styles/main.css";

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
      href: "https://fonts.googleapis.com/css2?family=Source+Sans+Pro&display=swap",
    },
    { rel: "stylesheet", href: reset },
    { rel: "stylesheet", href: shared },
    { rel: "stylesheet", href: main },
  ];
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "neocities",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
