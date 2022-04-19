import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link, useParams } from "@remix-run/react";

export const loader: LoaderFunction = () => {
  return {};
};

export default function NewSite() {
  const { hood, address } = useParams();

  return (
    <ul>
      {hood} {address}
    </ul>
  );
}
