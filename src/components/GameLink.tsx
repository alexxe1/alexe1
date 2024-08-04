import { Link } from "react-router-dom";
import "./GameLink.css";

interface GameLinkProps {
  type: "itchio" | "playstore" | "gamejolt" | "privacy";
  link: string;
}

export function GameLink({ type, link }: GameLinkProps) {
  const linkClass = `game-link ${type}`;

  if (type === "privacy") {
    return (
      <Link target="_blank" className={linkClass} to={link}>
        Privacy Policy
      </Link>
    );
  } else {
    return <a className={linkClass} href={link} target="_blank"></a>;
  }
}
