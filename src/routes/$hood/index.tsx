import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link, useParams } from "@remix-run/react";
import db from "../../services/db.server";

export const loader: LoaderFunction = async ({ params }) => {
  const addresses = await db(
    `select addresses.number, addresses.owner_id as owner
     from hoods
     join addresses on addresses.hood_id = hoods.id
     where hoods.name = $1
     order by addresses.number
    `,
    [params.hood]
  );

  if (addresses.length === 0) {
    throw new Response("Cannot find hood", {
      status: 404,
    });
  }

  return { addresses };
};

export default function NewSite() {
  const { hood } = useParams();
  const { addresses } = useLoaderData();

  return (
    <ul>
      {addresses.map((address) => (
        <li key={address.number}>
          <Link to={`/${hood}/${address.number}/`}>{address.number}</Link>
          {address.owner ? "Taken" : "Available"}
        </li>
      ))}
    </ul>
  );
}
