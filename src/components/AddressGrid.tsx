import { Link, useParams } from "@remix-run/react";
import StatusTag from "./StatusTag";

const AddressColumn = (props) => {
  const { hood } = useParams();

  return (
    <ul className="address-grid__column">
      {props.addresses.map((address) => (
        <li key={address.number} className="address-grid__cell">
          {address.number}
          <Link to={`/${hood}/${address.number}/`} reloadDocument>
            <StatusTag available={address.owner === null} />
          </Link>
        </li>
      ))}
    </ul>
  );
};

const chunk = (list: unknown[], size: number) => {
  const chunks = [];

  for (let i = 0; i < list.length; i += size) {
    chunks.push(list.slice(i, i + size));
  }

  return chunks;
};

export default function AddressGrid(props) {
  const columns = chunk(props.addresses, 20);

  return (
    <article className="address-grid">
      {columns.map((addresses, index) => (
        <AddressColumn key={index} addresses={addresses} />
      ))}
    </article>
  );
}
