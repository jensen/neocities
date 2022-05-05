import { Link, useParams } from "@remix-run/react";
import classNames from "classnames";
import { useState, useEffect } from "react";
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

type PixelWidth = "720px" | "960px" | "1200px";

const lookup: Record<PixelWidth, number> = {
  "1200px": 25,
  "960px": 34,
  "720px": 50,
};

const getWidthBasedSize = () => {
  const match: PixelWidth | undefined = (
    Object.keys(lookup) as (keyof typeof lookup)[]
  ).find((key) => window.matchMedia(`(min-width: ${key})`).matches);

  if (match) {
    return lookup[match];
  }

  return 100;
};

export default function AddressGrid(props) {
  const [columns, setColumns] = useState<Array<any[]>>([]);

  useEffect(() => {
    setColumns(chunk(props.addresses, getWidthBasedSize()));
  }, [props.addresses]);

  return (
    <article className="address-grid">
      {columns.map((addresses, index) => (
        <AddressColumn key={index} addresses={addresses} />
      ))}
    </article>
  );
}
