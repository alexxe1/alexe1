import { images } from "../constants/images";
import { games } from "../constants/games";
import { Game } from "./Game";
import "./Games.css";

export function Games() {
  const kryptoThumbnailImg =
    typeof images.krypto === "object" && "thumbnail" in images.krypto
      ? images.krypto.thumbnail
      : "";
  const tnpThumbnailImg =
    typeof images.tnp === "object" && "thumbnail" in images.tnp
      ? images.tnp.thumbnail
      : "";

  return (
    <section id="games">
      <div className="games-container">
        <Game
          to="/krypto"
          imagePath={kryptoThumbnailImg}
          gameName={games.krypto.name}
        />

        <Game
          to="/thenorisproject"
          imagePath={tnpThumbnailImg}
          gameName={games.tnp.name}
        />
      </div>
    </section>
  );
}
