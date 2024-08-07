import "./Games.css";
import { Game } from "./Game";
import { images } from "../constants";

export function Games() {
  return (
    <section id="games">
      <div className="games-container">
        <Game to="/krypto" imagePath={images.krypto} />

        <Game to="/thenorisproject" imagePath={images.tnp} />
      </div>
    </section>
  );
}
