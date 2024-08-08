import "./GameInfo.css";
import { Header } from "./Header";
import { ImageSlider } from "./ImageSlider";
import { games } from "../constants";
import { GameLink } from "./GameLink";

function GameInfo({ name }: { name: string }) {
  const game = games[name.toLowerCase()];
  if (!game) return <p>Game not found</p>;

  const {
    description,
    trailerLink,
    playstore,
    itchio,
    gamejolt,
    privacy,
  } = game;

  return (
    <div className="game-info-wrapper">
      <div className="game-info">
        <Header />
        <h2>{game.name}</h2>
        <iframe
          width="560"
          height="315"
          src={trailerLink}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        ></iframe>
        <p>{description}</p>
        <ImageSlider name={name.toLowerCase()} />

        <div className="game-links">
          {playstore && <GameLink type="playstore" link={playstore} />}
          {itchio && <GameLink type="itchio" link={itchio} />}
          {gamejolt && <GameLink type="gamejolt" link={gamejolt} />}
          {privacy && <GameLink type="privacy" link={privacy} />}
        </div>
      </div>
    </div>
  );
}

export default GameInfo;
