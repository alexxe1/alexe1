import { useLanguage } from "../hooks/useLanguage";
import { TikTokIcon, YoutubeIcon, XIcon, PlayStoreIcon } from "./Icons";
import { MediaLink } from "./MediaLink";
import "./Footer.css";
import { authorGithub, playStoreLink, tiktokLink, xLink, youtubeLink } from "../constants/general";

export function Footer() {
  const { traductions } = useLanguage();

  return (
    <footer>
      <MediaLink href={tiktokLink} svg={<TikTokIcon />} />
      <MediaLink href={youtubeLink} svg={<YoutubeIcon />} />
      <MediaLink href={xLink} svg={<XIcon />} />
      <MediaLink href={playStoreLink} svg={<PlayStoreIcon />} />

      <a className="footer__page-credits" href={authorGithub} target="_blank">
        {traductions.credits}
      </a>
    </footer>
  );
}
