import "./Privacy.css";
import { games } from "../constants";

interface PrivacyProps {
  name: string;
}

export function Privacy({ name }: PrivacyProps) {
  const { privacyText, name: gameName } = games[name];

  return (
    <div className="privacy-page-game-info-wrapper">
      <section className="privacy-page">
        <h2>{gameName} Privacy Policy</h2>
        <pre>{privacyText}</pre>
      </section>
    </div>
  );
}
