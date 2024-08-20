import { Link } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { images } from "../constants/images";
import "./GameLink.css";

interface GameLinkProps {
  type: "itchio" | "playstore" | "gamejolt" | "privacy";
  link: string;
}

export function GameLink({ type, link }: GameLinkProps) {
  const linkClass = `game-link ${type}`;
  const backgroundImage = type != "privacy" ? images[type] : "";
  const { traductions } = useLanguage();

  if (type === "privacy") {
    return (
      <Link
        className={linkClass}
        to={link}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {traductions.privacy}
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
