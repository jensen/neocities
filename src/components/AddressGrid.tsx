import { Link, useParams } from "@remix-run/react";
import classNames from "classnames";
import StatusTag from "./StatusTag";

const AddressColumn = (props) => {
  const { hood } = useParams();

  return (
    <ul className="address-grid__column">
      {props.addresses.map((address) => (
        <Link
          key={address.number}
          to={`/${hood}/${address.number}/`}
          reloadDocument
        >
          <li className="address-grid__cell">
            <div className="address__owner">
              {address.avatar ? (
                <img
                  className="avatar"
                  src={`https://cdn.discordapp.com/avatars/${address.provider_id}/${address.avatar}.png`}
                  alt="Owner Avatar"
                />
              ) : (
                <div className="avatar avatar__placeholder" />
              )}

              <h3 className="address__username">
                &nbsp;{address.username}&nbsp;
              </h3>
            </div>
            <div className="address__details">
              <h2
                className={classNames("address__number", {
                  "address__number--claimed": address.owner !== null,
                })}
              >
                {address.number}
              </h2>
              <StatusTag available={address.owner === null} />
            </div>
          </li>
        </Link>
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
  const columns = chunk(props.addresses, 25);

  return (
    <article className="address-grid">
      {columns.map((addresses, index) => (
        <AddressColumn key={index} addresses={addresses} />
      ))}
    </article>
  );
}
