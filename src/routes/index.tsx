import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import db from "../services/db.server";
import hoods from "../../data/hoods.json";

export const loader: LoaderFunction = async () => {
  const result = await db.query("select * from users");
  console.log(result);

  return { hoods };
};

const Hood = (props) => {
  return (
    <li>
      <Link to={`/${props.name}/new`}>{props.name}</Link>
      {props.description}
    </li>
  );
};

export default function NewSite() {
  const { hoods } = useLoaderData();

  return (
    <ul>
      {hoods.map((hood) => (
        <Hood {...hood} />
      ))}
    </ul>
  );
}
