import "./Header.css";
import { useNavigate } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header>
      <div
        className="header__icon"
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      >
        <img src="src/assets/images/alexe1.ico" alt="Alexe1 Icon" />
      </div>
    </header>
  );
}
