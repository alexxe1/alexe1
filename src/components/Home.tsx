import "./Home.css";
import { LinkSection } from "./SectionLink";

export function Home() {
  const contactPath: string = "src/assets/images/contact.png";
  const gamesPath: string = "src/assets/images/games.png";
  const aboutPath: string = "src/assets/images/about.png";

  return (
    <section id="home">
      <LinkSection href="#contact" text="Contact" imagePath={contactPath} />
      <LinkSection href="#games" text="Games" imagePath={gamesPath} />
      <LinkSection href="#about" text="About" imagePath={aboutPath} />
    </section>
  );
}
