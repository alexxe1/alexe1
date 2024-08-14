import { images } from "../constants";
import "./Header.css";
import { useNavigate } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "alexe1: Home"
  };

  return (
    <header>
      <div
        className="header__icon"
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      >
        <img src={images.alexe1} alt="Alexe1 Icon" />
      </div>
    </header>
  );
}
