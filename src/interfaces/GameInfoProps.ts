export interface GameProperties {
  name: string;
  playstore?: string;
  itchio?: string;
  privacyPath?: string;
  gamejolt?: string;
  privacyText?: string;
}

export interface GameInfoProps {
  [key: string]: GameProperties;
}
