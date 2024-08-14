import "./Games.css";
import { Game } from "./Game";
import { images, games } from "../constants";

export function Games() {
  return (
    <section id="games">
      <div className="games-container">
        <Game
          to="/krypto"
          imagePath={images.krypto.thumbnail}
          gameName={games.krypto.name}
        />

        <Game
          to="/thenorisproject"
          imagePath={images.tnp.thumbnail}
          gameName={games.tnp.name}
        />
      </div>
    </section>
  );
}
