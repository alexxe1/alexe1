import { GameInfoProps } from "./interfaces/GameInfoProps";

export const games: GameInfoProps = {
  krypto: {
    name: "Krypto",
    description:
      "Krypto is a simple game where you combine your 4 cards, either by adding, subtracting, dividing, or multiplying them, to reach a specific result.",
    trailerLink:
      "https://www.youtube-nocookie.com/embed/mhjp9Z1NTG8?si=1N7rmuDr7EL7V3rJ",
    imagesAmount: 7,
    folderPath: "src/assets/images/games/krypto",
    playstore:
      "https://play.google.com/store/apps/details?id=com.alexe1dev.Krypto&hl=es_AR&gl=US",
    itchio: "https://alexe1.itch.io/krypto",
    privacy: "/krypto/privacy",
    privacyText: `
    alexe1dev built the Krypto app as a Free app. This SERVICE is provided by alexe1dev at no cost and is intended for use as is.

    This page is used to inform visitors regarding my policies with the collection, use, and disclosure of Personal Information if anyone decided to use my Service.

    If you choose to use my Service, then you agree to the collection and use of information in relation to this policy. The Personal Information that I collect is used for providing and improving the Service. I will not use or share your information with anyone except as described in this Privacy Policy.

    The terms used in this Privacy Policy have the same meanings as in our Terms and Conditions, which are accessible at Krypto unless otherwise defined in this Privacy Policy.

    Information Collection and Use

    For a better experience, while using our Service, I may require you to provide us with certain personally identifiable information. The information that I request will be retained on your device and is not collected by me in any way.

    The app does use third-party services that may collect information used to identify you.

    Link to the privacy policy of third-party service providers used by the app:

    - Google Play Services
    - AdMob
    - Unity

    Log Data

    I want to inform you that whenever you use my Service, in a case of an error in the app I collect data and information (through third-party products) on your phone called Log Data. This Log Data may include information such as your device Internet Protocol (IP) address, device name, operating system version, the configuration of the app when utilizing my Service, the time and date of your use of the Service, and other statistics.

    Cookies

    Cookies are files with a small amount of data that are commonly used as anonymous unique identifiers. These are sent to your browser from the websites that you visit and are stored on your device's internal memory.

    This Service does not use these “cookies” explicitly. However, the app may use third-party code and libraries that use “cookies” to collect information and improve their services. You have the option to either accept or refuse these cookies and know when a cookie is being sent to your device. If you choose to refuse our cookies, you may not be able to use some portions of this Service.

    Service Providers

    I may employ third-party companies and individuals due to the following reasons:

    - To facilitate our Service;
    - To provide the Service on our behalf;
    - To perform Service-related services; or
    - To assist us in analyzing how our Service is used.

    I want to inform users of this Service that these third parties have access to their Personal Information. The reason is to perform the tasks assigned to them on our behalf. However, they are obligated not to disclose or use the information for any other purpose.

    Security

    I value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and I cannot guarantee its absolute security.

    Links to Other Sites

    This Service may contain links to other sites. If you click on a third-party link, you will be directed to that site. Note that these external sites are not operated by me. Therefore, I strongly advise you to review the Privacy Policy of these websites. I have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.

    Children’s Privacy

    These Services do not address anyone under the age of 13. I do not knowingly collect personally identifiable information from children under 13 years of age. In the case I discover that a child under 13 has provided me with personal information, I immediately delete this from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact me so that I will be able to do necessary actions.

    Changes to This Privacy Policy

    I may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes. I will notify you of any changes by posting the new Privacy Policy on this page.

    This policy is effective as of 2022-09-17.

    Contact Us

    If you have any questions or suggestions about my Privacy Policy, do not hesitate to contact me at alexe1developer777@gmail.com.
  `,
  },

  tnp: {
    name: "The Noris Project",
    description:
      "Complete your given tasks, hide under your desk and watch your security cameras while trying to survive frightening humanoid creatures!",
    trailerLink:
      "https://www.youtube-nocookie.com/embed/GAFME_kPOXU?si=7IC_TeczfoGE4mBx",
    imagesAmount: 5,
    folderPath: "src/assets/images/games/tnp",
    gamejolt: "https://gamejolt.com/games/thenorisproject/787238",
    itchio: "https://alexe1.itch.io/the-noris-project",
  },
};

export const imagesPath = {
  contact: new URL("src/assets/images/contact.png", import.meta.url).href,
  games: new URL("src/assets/images/games.png", import.meta.url).href,
  about: new URL("src/assets/images/about.png", import.meta.url).href,
  alexe1: new URL("/alexe1/assets/alexe1-D9T3LakQ.ico", import.meta.url).href,
  tnp: new URL("src/assets/images/games/tnp/tnp.png", import.meta.url).href,
  krypto: new URL("src/assets/images/games/krypto/krypto.jpg", import.meta.url)
    .href,
  sendIcon: new URL("src/assets/images/send.png", import.meta.url).href,
  emailIcon: new URL("src/assets/images/email.png", import.meta.url).href,
  nameIcon: new URL("src/assets/images/name.png", import.meta.url).href,
};
