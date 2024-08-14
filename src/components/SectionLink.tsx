import "./SectionLink.css";
import { scrollToSection } from "../functions/scrollToSection";

interface LinkSectionProps {
  elementId: string;
  text: string;
  imagePath: string;
  pageTitle?: string;
}

export function LinkSection({
  elementId,
  text,
  imagePath,
  pageTitle,
}: LinkSectionProps) {
  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    const title = pageTitle ? `alexe1: ${pageTitle}` : "alexe1";
    scrollToSection(elementId, event, title);
  };

  return (
    <a href="#" onClick={handleClick} className="link-section">
      <span>{text}</span>
      <img src={imagePath} alt="Icon" />
    </a>
  );
}
