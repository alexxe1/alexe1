import { games } from "../constants/games";
import { GameLink } from "./GameLink";
import { ImageSlider } from "./ImageSlider";
import { Header } from "./Header";
import "./GameInfo.css";

function GameInfo({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  const game = games[name.toLowerCase()];
  if (!game) return <p>Game not found</p>;

  const { playstore, itchio, gamejolt, privacyPath } = game;

  return (
    <div className="game-info-wrapper">
      <div className="game-info">
        <Header />
        <h2>{game.name}</h2>

        <p>{description}</p>
        <ImageSlider name={name.toLowerCase()} />
        <div className="game-links">
          {playstore && <GameLink type="playstore" link={playstore} />}
          {itchio && <GameLink type="itchio" link={itchio} />}
          {gamejolt && <GameLink type="gamejolt" link={gamejolt} />}
          {privacyPath && <GameLink type="privacy" link={privacyPath} />}
        </div>
      </div>
    </div>
  );
}

export default GameInfo;
