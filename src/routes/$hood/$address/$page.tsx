import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import storage from "../../../services/storage.server";
import db from "../../../services/db.server";

export const loader: LoaderFunction = async ({ params }) => {
  const [address] = await db(
    `
    select addresses.id, addresses.owner_id as owner
    from addresses join hoods on hoods.id = addresses.hood_id
    where hoods.name = $1 and addresses.number = $2
    `,
    [params.hood, params.address]
  );

  if (!address.owner) {
    return redirect(`/${params.hood}/${params.address}/claim`);
  }

  const content = await storage.download(`${address.id}/${params.page}`);

  return {
    content,
  };
};

export default function NewSite() {
  const { content } = useLoaderData();

  return (
    <section>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </section>
  );
}
