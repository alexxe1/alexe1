import { useState } from "react";
import { images } from "../constants";
import "./Contact.css";

export function Contact() {
  const [name, setName] = useState<string>("");
  const mail: string = "alexe1developer777@gmail.com";
  const formAction: string = `https://formsubmit.co/${mail}`;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[^\d]*$/.test(value)) {
      setName(value);
    }
  };

  return (
    <section id="contact">
      <form className="contact__form" action={formAction} method="POST">
        <div className="contact__form__name">
          <img src={images.name} alt="Name" />
          <input
            type="text"
            placeholder="Name"
            name="name"
            value={name}
            onChange={handleNameChange}
            required
          />
        </div>
        <div className="contact__form__email">
          <img src={images.email} alt="Email" />
          <input type="email" placeholder="Email" name="email" required />
        </div>
        <textarea
          className="contact__form__info"
          placeholder="Your text goes here..."
          name="info"
          required
        />
        <div className="contact__form__send">
          <img src={images.send} alt="Send" />
          <input type="submit" value="" />
        </div>
      </form>
    </section>
  );
}
