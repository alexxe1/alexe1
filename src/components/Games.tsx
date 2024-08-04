import "./Games.css";
import { Game } from "./Game";

export function Games() {
  return (
    <section id="games">
      <div className="games-container">
        <Game
          to="/krypto"
          imagePath="/src/assets/images/games/krypto/krypto.jpg"
        />

        <Game
          to="/thenorisproject"
          imagePath="/src/assets/images/games/tnp/tnp.png"
        />
      </div>
    </section>
  );
}
