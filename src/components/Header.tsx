import DiscordLogin from "./DiscordLogin";
import { useAuth } from "~/context/auth";

export default function Header() {
  const { isLoggedIn } = useAuth();

  return (
    <header className="header">
      neocities
      {isLoggedIn === false && <DiscordLogin />}
    </header>
  );
}
