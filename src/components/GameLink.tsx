import { Link } from "react-router-dom";
import "./GameLink.css";
import { images } from "../constants";

interface GameLinkProps {
  type: "itchio" | "playstore" | "gamejolt" | "privacy";
  link: string;
}

export function GameLink({ type, link }: GameLinkProps) {
  const linkClass = `game-link ${type}`;
  const backgroundImage = type != "privacy" ? images[type] : "";

  if (type === "privacy") {
    return (
      <Link
        className={linkClass}
        to={link}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        Privacy Policy
      </Link>
    );
  } else {
    return (
      <a
        className={linkClass}
        href={link}
        target="_blank"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></a>
    );
  }
}
