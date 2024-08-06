import { imagesPath } from "../constants";
import "./Home.css";
import { LinkSection } from "./SectionLink";

export function Home() {
  return (
    <section id="home">
      <LinkSection elementId="contact" text="Contact" imagePath={imagesPath.contact} />
      <LinkSection elementId="games" text="Games" imagePath={imagesPath.games} />
      <LinkSection elementId="about" text="About" imagePath={imagesPath.about} />
    </section>
  );
}
