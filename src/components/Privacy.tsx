import "./Privacy.css";
import { games } from "../constants";
import { Header } from "./Header";

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
