import { Link } from "react-router-dom";
import { name } from "../constants/general";
import "./Game.css";

interface GameProps {
  to: string;
  imagePath: string;
  gameName: string;
}

export function Game({ to, imagePath, gameName }: GameProps) {
  const handleClick = () => {
    document.title = `${name}: ${gameName}`;
  };

  return (
    <Link
      className="game"
      to={to}
      style={{ backgroundImage: `url(${imagePath})` }}
      onClick={handleClick}
    />
  );
}
