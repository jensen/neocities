import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import db from "~/services/db.server";

import styles from "~/styles/hoods.css";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const loader: LoaderFunction = async () => {
  const hoods = await db(`select * from hoods`);

  return json({ hoods });
};

const Hood = (props) => {
  return (
    <li className="hood-list__item">
      <Link to={`/${props.name}`} className="hood-list__link">
        {props.name}
      </Link>
      <p className="hood-list__description">{props.description}</p>
    </li>
  );
};

export default function Hoods() {
  const { hoods } = useLoaderData();

  return (
    <ul className="hood-list__container">
      {hoods.map((hood) => (
        <Hood key={hood.name} {...hood} />
      ))}
    </ul>
  );
}
