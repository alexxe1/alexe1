import { useLanguage } from "../hooks/useLanguage";
import "./About.css";

export function About() {
  const { traductions } = useLanguage();

  return (
    <section id="about">
      <div className="about__info">
        <h2 className="about__title">{traductions.aboutMe}</h2>
        <p>{traductions.aboutInfo1}</p>
        <p>{traductions.aboutInfo2}</p>
      </div>
    </section>
  );
}
