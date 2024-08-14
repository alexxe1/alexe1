import { GameInfoProps } from "./interfaces/GameInfoProps";
import alexe1 from "./assets/images/alexe1.ico";
import krypto from "./assets/images/games/krypto/krypto.jpg";
import krypto_0 from "./assets/images/games/krypto/0.png";
import krypto_1 from "./assets/images/games/krypto/1.png";
import krypto_2 from "./assets/images/games/krypto/2.png";
import krypto_3 from "./assets/images/games/krypto/3.png";
import krypto_4 from "./assets/images/games/krypto/4.png";
import krypto_5 from "./assets/images/games/krypto/5.png";
import krypto_6 from "./assets/images/games/krypto/6.png";
import tnp_0 from "./assets/images/games/tnp/0.png";
import tnp_1 from "./assets/images/games/tnp/1.png";
import tnp_2 from "./assets/images/games/tnp/2.png";
import tnp_3 from "./assets/images/games/tnp/3.png";
import tnp_4 from "./assets/images/games/tnp/4.png";
import tnp from "./assets/images/games/tnp/tnp.png";
import contact from "./assets/images/contact.png";
import gamesImage from "./assets/images/games.png";
import about from "./assets/images/about.png";
import send from "./assets/images/send.png";
import name from "./assets/images/name.png";
import email from "./assets/images/email.png";
import playstore from "./assets/images/playstore.png";
import itchio from "./assets/images/itchio.png";
import gamejolt from "./assets/images/gamejolt.png";

export const images = {
  alexe1: alexe1,
  tnp: {
    thumbnail: tnp,
    images: [tnp_0, tnp_1, tnp_2, tnp_3, tnp_4],
  },
  krypto: {
    thumbnail: krypto,
    images: [
      krypto_0,
      krypto_1,
      krypto_2,
      krypto_3,
      krypto_4,
      krypto_5,
      krypto_6,
    ],
  },
  contact: contact,
  games: gamesImage,
  about: about,
  send: send,
  name: name,
  email: email,
  playstore: playstore,
  itchio: itchio,
  gamejolt: gamejolt,
};

export const games: GameInfoProps = {
  krypto: {
    name: "Krypto",
    description:
      "Krypto is a simple game where you combine your 4 cards, either by adding, subtracting, dividing, or multiplying them, to reach a specific result.",
    playstore:
      "https://play.google.com/store/apps/details?id=com.alexe1dev.Krypto&hl=es_AR&gl=US",
    itchio: "https://alexe1.itch.io/krypto",
    privacy: "/krypto/privacy",
    privacyText: `
    alexe1dev built the Krypto app as a Free app. This SERVICE is provided by alexe1dev at no cost and is intended for use as is.
    // (privacy policy text omitted for brevity)
  `,
  },
  tnp: {
    name: "The Noris Project",
    description:
      "Complete your given tasks, hide under your desk and watch your security cameras while trying to survive frightening humanoid creatures!",
    gamejolt: "https://gamejolt.com/games/thenorisproject/787238",
    itchio: "https://alexe1.itch.io/the-noris-project",
  },
};
