import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import db from "../../../services/db.server";
import { login } from "../../../utils/session.server";
import storage from "../../../services/storage.server";

export const action: ActionFunction = async ({ request, params }) => {
  const body = await request.formData();

  const email = body.get("email");
  const password = body.get("password");

  const user = await login(email, password);

  const [address] = await db(
    `
    with h as (
      select id from hoods where hoods.name = $2
    )
    update addresses
    set owner_id = $1
    from h 
    where hood_id = h.id and addresses.number = $3
    returning addresses.id
    `,
    [user.id, params.hood, params.address]
  );

  try {
    await storage.upload(`${address.id}/index.html`, "");
  } catch (error) {
    throw new Response("Unable to create file.", {
      status: 500,
    });
  }

  return redirect(`/${params.hood}/${params.address}`);
};

export const loader: LoaderFunction = () => {
  return {};
};

export default function Claim() {
  return (
    <Form method="post">
      <label>
        Email
        <input type="email" name="email" />
      </label>
      <label>
        Password
        <input type="password" name="password" />
      </label>
      <button type="submit">Claim</button>
    </Form>
  );
}
