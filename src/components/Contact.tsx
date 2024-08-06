import { imagesPath } from "../constants";
import "./Contact.css";

export function Contact() {
  const mail: string = "alexe1developer777@gmail.com";
  const formAction: string = `https://formsubmit.co/${mail}`;

  return (
    <section id="contact">
      <form className="contact__form" action={formAction} method="POST">
        <div className="contact__form__name">
          <img src={imagesPath.nameIcon} alt="Name" />
          <input type="text" placeholder="Name" name="name" required />
        </div>

        <div className="contact__form__email">
          <img src={imagesPath.emailIcon} alt="Email" />
          <input type="email" placeholder="Email" name="email" required />
        </div>

        <textarea
          className="contact__form__info"
          placeholder="Your text goes here..."
          name="info"
          required
        />
        <div className="contact__form__send">
          <img src={imagesPath.sendIcon} alt="Send" />
          <input type="submit" value="" />
        </div>
      </form>
    </section>
  );
}
