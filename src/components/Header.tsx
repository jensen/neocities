import { Link, useMatches, useParams } from "@remix-run/react";
import DiscordLogin from "./DiscordLogin";
import { useAuth } from "~/context/auth";

export default function Header() {
  const params = useParams();
  const { isLoggedIn } = useAuth();
  const matches = useMatches();

  const isPreview =
    matches.filter(
      (match) =>
        match.id === "routes/$hood/$address/preview" ||
        match.id === "routes/$hood/$address/$page/preview"
    ).length === 1;

  const isEdit =
    matches.filter(
      (match) =>
        match.id === "routes/$hood/$address/edit" ||
        match.id === "routes/$hood/$address/$page/edit"
    ).length === 1;

  return (
    <header className="header">
      <Link to="/" className="header__logo">
        neo.cities
      </Link>
      <div>
        {isLoggedIn === false && <DiscordLogin />}
        {isLoggedIn && isPreview && (
          <Link
            to={`/${params.hood}/${params.address}/${
              params.page ? params.page + "/" : ""
            }edit`}
            className="header__button"
          >
            Edit
          </Link>
        )}

        {isEdit && (
          <button
            type="submit"
            form="editor-content"
            className="header__button"
          >
            Save
          </button>
        )}
      </div>
    </header>
  );
}
