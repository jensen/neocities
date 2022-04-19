import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link, useParams } from "@remix-run/react";

export const loader: LoaderFunction = () => {
  const addresses = Array(10000)
    .fill(null)
    .map((value, index) => {
      return index;
    })
    .slice(1000);

  return { addresses };
};

export default function NewSite() {
  const { hood } = useParams();
  const { addresses } = useLoaderData();

  return (
    <ul>
      {addresses.map((address) => (
        <li>
          <Link to={`/${hood}/${address}`}>{address}</Link>
        </li>
      ))}
    </ul>
  );
}
