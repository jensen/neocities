import { useEffect, useRef } from "react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  Link,
  Form,
  useLoaderData,
  useParams,
  useTransition,
} from "@remix-run/react";
import db from "~/services/db.server";
import storage from "~/services/storage.server";
import { userSession, error } from "~/services/session.server";

export const action: ActionFunction = async ({ request, params }) => {
  const user = await userSession(request);

  error[401](!user.id);

  const [address] = await db(
    `
    select addresses.id, addresses.owner_id as owner
    from addresses join hoods on hoods.id = addresses.hood_id
    where hoods.name = $1 and addresses.number = $2 and owner_id = $3
    `,
    [params.hood, params.address, user.id]
  );

  error[403](!address);

  const body = await request.formData();

  const content = body.get("content") || "";

  try {
    await storage.upload(`${address.id}/${params.page}`, content);
  } catch (error) {
    throw new Response("Unable to upload.", {
      status: 500,
    });
  }

  if (params.page === "index.html") {
    return redirect(`/${params.hood}/${params.address}/`);
  }

  return redirect(`/${params.hood}/${params.address}/${params.page}`);
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await userSession(request);

  error[401](!user.id);

  const [address] = await db(
    `
    select addresses.id, addresses.owner_id as owner
    from addresses join hoods on hoods.id = addresses.hood_id
    where hoods.name = $1 and addresses.number = $2 and owner_id = $3
    `,
    [params.hood, params.address, user.id]
  );

  error[403](!address);

  const content = await storage.download(`${address.id}/${params.page}`);
  const files = await storage.list(`${address.id}`);

  return {
    content,
    files,
  };
};

export default function Editor() {
  const { hood, address, page } = useParams();
  const { files, content } = useLoaderData();

  const transition = useTransition();

  const formRef = useRef<HTMLFormElement>(null);
  const isAdding =
    transition.state === "submitting" && transition.type === "actionSubmission";

  useEffect(() => {
    if (isAdding === false) {
      formRef.current?.reset();
    }
  }, [isAdding]);

  return (
    <section>
      <div>Editor</div>
      <ul>
        {files.map((file) => (
          <li key={file}>
            <Link to={`/${hood}/${address}/${file}/edit`}>{file}</Link>
          </li>
        ))}
      </ul>
      <Form
        method="post"
        action={`/${hood}/${address}/${page}?index`}
        replace
        ref={formRef}
      >
        <input type="text" name="filename" />
        <button type="submit">Create</button>
      </Form>
      <Form method="post" reloadDocument>
        <textarea
          key={Math.random()}
          rows={25}
          name="content"
          defaultValue={content}
        />
        <button type="submit">Save</button>
      </Form>
      <Form
        method="post"
        action={`/${hood}/${address}/upload`}
        encType="multipart/form-data"
        reloadDocument
      >
        <input type="file" name="files" multiple />
        <button type="submit">Upload</button>
      </Form>
    </section>
  );
}
