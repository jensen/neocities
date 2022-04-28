import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import db from "~/services/db.server";
import storage from "~/services/storage.server";
import { userSession, error } from "~/services/session.server";

export const action: ActionFunction = async ({ request, params }) => {
  const user = await userSession(request);

  error[401](!user.id);

  const [address] = await db(
    `
    with h as (
      select id from hoods where hoods.name = $2
    )
    update addresses
    set owner_id = $1
    from h 
    where hood_id = h.id and addresses.number = $3 and owner_id is null
    returning addresses.id
    `,
    [user.id, params.hood, params.address]
  );

  error[403](!address);

  try {
    await storage.upload(`${address.id}/index.html`, "");
  } catch (error) {
    throw new Response("Unable to create file.", {
      status: 500,
    });
  }

  return redirect(`/${params.hood}/${params.address}/`);
};

export default function Claim() {
  return (
    <Form method="post" reloadDocument>
      <button type="submit">Claim</button>
    </Form>
  );
}
