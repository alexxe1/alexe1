import "./Games.css";
import { Game } from "./Game";
import { imagesPath } from "../constants";

export function Games() {
  return (
    <section id="games">
      <div className="games-container">
        <Game to="/krypto" imagePath={imagesPath.krypto} />

        <Game to="/thenorisproject" imagePath={imagesPath.tnp} />
      </div>
    </section>
  );
}
