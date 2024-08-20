import { scrollToSection } from "../functions/scrollToSection";
import "./SectionLink.css";

interface SectionLinkProps {
  elementId: string;
  text: string;
  imagePath: string;
  pageTitle: string;
}

export function SectionLink({
  elementId,
  text,
  imagePath,
  pageTitle,
}: SectionLinkProps) {
  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    const title = `alexe1: ${pageTitle}`;
    scrollToSection(elementId, event, title);
  };

  return (
    <a href="#" onClick={handleClick} className="link-section">
      <span>{text}</span>
      <img src={imagePath} alt="Icon" />
    </a>
  );
}
