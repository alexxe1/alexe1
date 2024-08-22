import { useState } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { images } from "../constants/images";
import "./Contact.css";

export function Contact() {
  const [name, setName] = useState<string>("");
  const { traductions } = useLanguage();
  const mail: string = "alexe1developer777@gmail.com";
  const nameImg = typeof images.name === "string" ? images.name : "";
  const emailImg = typeof images.email === "string" ? images.email : "";
  const sendImg = typeof images.send === "string" ? images.send : "";

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[^\d]*$/.test(value)) {
      setName(value);
    }
  };

  return (
    <section id="contact">
      <form
        className="contact__form"
        action={`https://formsubmit.co/${mail}`}
        method="POST"
      >
        <div className="contact__form__name">
          <img src={nameImg} alt="Name" />
          <input
            type="text"
            placeholder={traductions.name}
            name="name"
            value={name}
            onChange={handleNameChange}
            maxLength={30}
            required
          />
        </div>
        <div className="contact__form__email">
          <img src={emailImg} alt="Email" />
          <input
            type="email"
            placeholder={traductions.email}
            name="email"
            maxLength={40}
            required
          />
        </div>
        <textarea
          className="contact__form__info"
          placeholder={traductions.info}
          name="info"
          required
        />
        <div className="contact__form__send">
          <img src={sendImg} alt="Send" />
          <input type="submit" value="" />
        </div>
      </form>
    </section>
  );
}
