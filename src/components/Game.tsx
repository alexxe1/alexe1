import "./Game.css";
import { Link } from "react-router-dom";

interface GameProps {
  to: string;
  imagePath: string;
  gameName: string;
}

export function Game({ to, imagePath, gameName }: GameProps) {
  const handleClick = () => {
    document.title = `alexe1: ${gameName}`;
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
