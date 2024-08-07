import { images } from "../constants";
import "./Home.css";
import { LinkSection } from "./SectionLink";

export function Home() {
  return (
    <section id="home">
      <LinkSection
        elementId="contact"
        text="Contact"
        imagePath={images.contact}
      />
      <LinkSection
        elementId="games"
        text="Games"
        imagePath={images.games}
      />
      <LinkSection
        elementId="about"
        text="About"
        imagePath={images.about}
      />
    </section>
  );
}
