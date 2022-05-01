import { useEffect, useRef } from "react";
import type {
  LinksFunction,
  ActionFunction,
  LoaderFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  Link,
  Form,
  useLoaderData,
  useParams,
  useTransition,
} from "@remix-run/react";
import { getOwnedAddress } from "~/services/db.server";
import storage from "~/services/storage.server";
import { userSession, error } from "~/services/session.server";
import UploadIcon from "~/components/icons/UploadIcon";
import { convertStreamToString } from "~/utils/convert";

import styles from "~/styles/editor.css";
import classNames from "classnames";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const action: ActionFunction = async ({ request, params }) => {
  const user = await userSession(request);

  error[401](!user.id);

  if (!params.hood) {
    throw new Response("Must provide 'hood' param.", {
      status: 400,
    });
  }

  if (!params.address) {
    throw new Response("Must provide 'address' param.", {
      status: 400,
    });
  }

  const address = await getOwnedAddress(params.hood, params.address, user);

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

  if (!params.hood) {
    throw new Response("Must provide 'hood' param.", {
      status: 400,
    });
  }

  if (!params.address) {
    throw new Response("Must provide 'address' param.", {
      status: 400,
    });
  }

  const address = await getOwnedAddress(params.hood, params.address, user);

  error[403](!address);

  const content: ReadableStream = await storage.download(
    `${address.id}/${params.page}`
  );
  const files = await storage.list(`${address.id}`);

  return {
    content: await convertStreamToString(content),
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
    <section className="editor">
      <aside className="editor__sidebar">
        <ul className="editor-files__list">
          {files.map((file) => (
            <li
              key={file}
              className={classNames("editor-files__item", {
                "editor-files__item--selected": page === file,
              })}
            >
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
          <input type="text" name="filename" className="editor-files__input" />
          <button type="submit" className="editor__button">
            Create
          </button>
        </Form>
      </aside>
      <div className="editor__main">
        <Form
          method="post"
          id="editor-content"
          reloadDocument
          className="flex-grow"
        >
          <textarea
            key={Math.random()}
            name="content"
            defaultValue={content}
            className="editor-content__textarea"
          />
        </Form>
      </div>
      <div className="editor__upload">
        <Form
          method="post"
          action={`/${hood}/${address}/upload`}
          encType="multipart/form-data"
          reloadDocument
          className="flex-column flex-column--center"
        >
          <label>
            <UploadIcon className="cursor-pointer" />
            <input
              type="file"
              name="files"
              multiple
              accept="text/html,image/gif,image/jpeg"
              className="hidden"
            />
          </label>
          <button type="submit" className="editor__button">
            Upload
          </button>
        </Form>
      </div>
    </section>
  );
}
