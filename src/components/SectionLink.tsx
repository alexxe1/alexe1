import "./SectionLink.css";

interface LinkSectionProps {
  href: string;
  text: string;
  imagePath: string;
}

export function LinkSection({ href, text, imagePath }: LinkSectionProps) {
  return (
    <a className="link-section" href={href}>
      <span>{text}</span>
      <img src={imagePath} alt="Icon" />
    </a>
  );
}
