export interface GameProperties {
  name: string;
  description: string;
  playstore?: string;
  itchio?: string;
  privacy?: string;
  gamejolt?: string;
  privacyText?: string;
}

export interface GameInfoProps {
  [key: string]: GameProperties;
}
