import "./Footer.css";
import { TikTok, Youtube, X, PlayStore } from "./Icons";
import { MediaLink } from "./MediaLink";

export function Footer() {
  const tiktokLink: string = "https://www.tiktok.com/@alexe1dev";
  const youtubeLink: string = "https://www.youtube.com/@alexe1dev";
  const xLink: string = "https://twitter.com/alexe1dev";
  const playStoreLink: string =
    "https://play.google.com/store/apps/dev?id=6894155375945307231";

  return (
    <footer>
      <MediaLink href={tiktokLink} svg={<TikTok />} />
      <MediaLink href={youtubeLink} svg={<Youtube />} />
      <MediaLink href={xLink} svg={<X />} />
      <MediaLink href={playStoreLink} svg={<PlayStore />} />
    </footer>
  );
}
