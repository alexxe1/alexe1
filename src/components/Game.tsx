import "./Game.css";
import { Link } from "react-router-dom";

interface GameProps {
  to: string;
  imagePath: string;
}

export function Game({ to, imagePath }: GameProps) {
  return (
    <Link
      className="game"
      to={to}
      style={{ backgroundImage: `url(${imagePath})` }}
    />
  );
}
