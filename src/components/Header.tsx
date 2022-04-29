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

  return (
    <header className="header">
      <Link to="/">neocities</Link>
      <div>
        {isLoggedIn === false && <DiscordLogin />}
        {isLoggedIn && isPreview && (
          <Link
            to={`/${params.hood}/${params.address}/${
              params.page ? params.page + "/" : ""
            }edit`}
          >
            Edit
          </Link>
        )}
      </div>
    </header>
  );
}
