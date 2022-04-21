import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import db from "../services/db.server";

export const loader: LoaderFunction = async () => {
  const hoods = await db(`select * from hoods`);

  return { hoods };
};

const Hood = (props) => {
  return (
    <li>
      <Link to={`/${props.name}`}>{props.name}</Link>
      {props.description}
    </li>
  );
};

export default function NewSite() {
  const { hoods } = useLoaderData();

  return (
    <ul>
      {hoods.map((hood) => (
        <Hood key={hood.name} {...hood} />
      ))}
    </ul>
  );
}
