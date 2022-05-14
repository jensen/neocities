import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import * as db from "~/services/db.server";
import AddressGrid from "~/components/AddressGrid";
import classNames from "classnames";

import styles from "~/styles/addresses.css";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url);

  const page = Number(url.searchParams.get("page")) || 1;
  const limit = 100;
  const cursor = Number((page - 1) * limit) + 999;

  const addresses = await db.query(
    `
     select
       addresses.number,
       addresses.owner_id as owner,
       owners.avatar as avatar,
       owners.username as username,
       users.provider_id as provider_id
     from hoods
     join addresses on addresses.hood_id = hoods.id
     left join users on users.id = addresses.owner_id
     left join owners on owners.id = addresses.owner_id
     where hoods.name = $1 and addresses.number > $3
     order by addresses.number
     limit $2
    `,
    [params.hood, limit, cursor]
  );

  if (addresses.length === 0) {
    throw new Response("Cannot find address.", {
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
      <header className="pagination">
        <Link
          to={`?page=${pagination.previous}`}
          className={classNames("pagination__link", {
            "pagination__link--hidden": pagination.show.previous === false,
          })}
        >
          Prev
        </Link>
        <h2 className="pagination__status">
          {addresses[0].number} - {addresses[addresses.length - 1].number}
        </h2>
        <Link
          to={`?page=${pagination.next}`}
          className={classNames("pagination__link", {
            "pagination__link--hidden": pagination.show.next === false,
          })}
        >
          Next
        </Link>
      </header>
      <AddressGrid addresses={addresses} />
    </section>
  );
}
