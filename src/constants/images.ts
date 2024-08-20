import alexe1 from "../assets/images/alexe1.ico";
import krypto from "../assets/images/games/krypto/krypto.jpg";
import krypto_0 from "../assets/images/games/krypto/0.png";
import krypto_1 from "../assets/images/games/krypto/1.png";
import krypto_2 from "../assets/images/games/krypto/2.png";
import krypto_3 from "../assets/images/games/krypto/3.png";
import krypto_4 from "../assets/images/games/krypto/4.png";
import krypto_5 from "../assets/images/games/krypto/5.png";
import krypto_6 from "../assets/images/games/krypto/6.png";
import tnp_0 from "../assets/images/games/tnp/0.png";
import tnp_1 from "../assets/images/games/tnp/1.png";
import tnp_2 from "../assets/images/games/tnp/2.png";
import tnp_3 from "../assets/images/games/tnp/3.png";
import tnp_4 from "../assets/images/games/tnp/4.png";
import tnp from "../assets/images/games/tnp/tnp.png";
import contact from "../assets/images/contact.png";
import gamesImage from "../assets/images/games.png";
import about from "../assets/images/about.png";
import send from "../assets/images/send.png";
import name from "../assets/images/name.png";
import email from "../assets/images/email.png";
import playstore from "../assets/images/playstore.png";
import itchio from "../assets/images/itchio.png";
import gamejolt from "../assets/images/gamejolt.png";

interface ImageCollection {
  thumbnail: string;
  images: string[];
}

interface Images {
  [key: string]: string | ImageCollection;
}

export const images: Images = {
  alexe1: alexe1 as string,
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
  contact: contact as string,
  games: gamesImage as string,
  about: about as string,
  send: send as string,
  name: name as string,
  email: email as string,
  playstore: playstore as string,
  itchio: itchio as string,
  gamejolt: gamejolt as string,
};
