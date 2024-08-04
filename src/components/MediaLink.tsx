import { ReactNode } from "react";
import "./MediaLink.css";

interface MediaLinkProps {
  href: string;
  svg: ReactNode;
}

export function MediaLink({ href, svg }: MediaLinkProps) {
  return (
    <a className="media-link" href={href} target="_blank" rel="noopener noreferrer">
      {svg}
    </a>
  );
}
