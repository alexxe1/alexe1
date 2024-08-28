import ReactDOM from "react-dom/client";
import { HashRouter as Router } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import App from "./App.tsx";
import "./index.css";
import ads from "../app-ads.txt";

ads;
ReactDOM.createRoot(document.getElementById("root")!).render(
  <Router>
    <LanguageProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </LanguageProvider>
  </Router>
);
