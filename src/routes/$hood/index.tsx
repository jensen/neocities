import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import db from "~/services/db.server";
import AddressGrid from "~/components/AddressGrid";

export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url);

  const page = Number(url.searchParams.get("page")) || 1;
  const limit = 100;
  const cursor = Number((page - 1) * limit) + 999;

  const addresses = await db(
    `
     select addresses.number, addresses.owner_id as owner
     from hoods
     join addresses on addresses.hood_id = hoods.id
     where hoods.name = $1 and addresses.number > $3
     order by addresses.number
     limit $2
    `,
    [params.hood, limit, cursor]
  );

  if (addresses.length === 0) {
    throw new Response("Cannot find address", {
      status: 404,
    });
  }

  return {
    addresses,
    pagination: {
      next: page + 1,
      previous: page - 1,
      show: {
        next: page < 90,
        previous: page > 1,
      },
    },
  };
};

export default function NewSite() {
  const { addresses, pagination } = useLoaderData();

  return (
    <section>
      <header>
        {pagination.show.previous && (
          <Link to={`?page=${pagination.previous}`}>Prev</Link>
        )}
        {pagination.show.next && (
          <Link to={`?page=${pagination.next}`}>Next</Link>
        )}
      </header>
      <AddressGrid addresses={addresses} />
    </section>
  );
}
