import { images } from "../constants/images";
import { games } from "../constants/games";
import { Game } from "./Game";
import "./Games.css";
import { kryptoPath, tnpPath } from "../constants/general";

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
          to={kryptoPath}
          imagePath={kryptoThumbnailImg}
          gameName={games.krypto.name}
        />

        <Game
          to={tnpPath}
          imagePath={tnpThumbnailImg}
          gameName={games.tnp.name}
        />
      </div>
    </section>
  );
}
