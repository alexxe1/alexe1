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
        pageTitle="Contact"
      />
      <LinkSection
        elementId="games"
        text="Games"
        imagePath={images.games}
        pageTitle="Games"
      />
      <LinkSection
        elementId="about"
        text="About"
        imagePath={images.about}
        pageTitle="About"
      />
    </section>
  );
}
