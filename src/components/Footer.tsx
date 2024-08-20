import { useLanguage } from "../hooks/useLanguage";
import { TikTokIcon, YoutubeIcon, XIcon, PlayStoreIcon } from "./Icons";
import { MediaLink } from "./MediaLink";
import "./Footer.css";

export function Footer() {
  const tiktokLink: string = "https://www.tiktok.com/@alexe1dev";
  const youtubeLink: string = "https://www.youtube.com/@alexe1dev";
  const xLink: string = "https://twitter.com/alexe1dev";
  const playStoreLink: string =
    "https://play.google.com/store/apps/dev?id=6894155375945307231";

  const { traductions } = useLanguage();

  return (
    <footer>
      <MediaLink href={tiktokLink} svg={<TikTokIcon />} />
      <MediaLink href={youtubeLink} svg={<YoutubeIcon />} />
      <MediaLink href={xLink} svg={<XIcon />} />
      <MediaLink href={playStoreLink} svg={<PlayStoreIcon />} />

      <a
        className="footer__page-credits"
        href="https://github.com/MrDadoxx/"
        target="_blank"
      >
        {traductions.credits}
      </a>
    </footer>
  );
}
