import { games } from "../constants/games";
import { Header } from "./Header";
import "./Privacy.css";

interface PrivacyProps {
  name: string;
}

export function Privacy({ name }: PrivacyProps) {
  const { privacyText, name: gameName } = games[name];

  return (
    <div className="privacy-page-wrapper">
      <div className="privacy-page">
        <Header />
        <h2>{gameName} Privacy Policy</h2>
        <pre>{privacyText}</pre>
      </div>
    </div>
  );
}
