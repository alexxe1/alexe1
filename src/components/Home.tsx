import { useLanguage } from "../hooks/useLanguage";
import { images } from "../constants/images";
import { SectionLink } from "./SectionLink";
import "./Home.css";

export function Home() {
  const { traductions } = useLanguage();
  const contactImg = typeof images.contact === "string" ? images.contact : "";
  const gamesImg = typeof images.games === "string" ? images.games : "";
  const aboutImg = typeof images.about === "string" ? images.about : "";

  return (
    <section id="home">
      <SectionLink
        elementId="contact"
        text={traductions.contact}
        imagePath={contactImg}
        pageTitle={traductions.contact}
      />
      <SectionLink
        elementId="games"
        text={traductions.games}
        imagePath={gamesImg}
        pageTitle={traductions.games}
      />
      <SectionLink
        elementId="about"
        text={traductions.about}
        imagePath={aboutImg}
        pageTitle={traductions.about}
      />
    </section>
  );
}
