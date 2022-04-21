import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const loader: LoaderFunction = ({ params }) => {
  return redirect(`/${params.hood}/${params.address}/index.html/edit`);
};
