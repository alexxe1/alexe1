import ReactDOM from "react-dom/client";
import "./index.css";
import { Route, HashRouter as Router, Routes } from "react-router-dom";
import { GameInfo } from "./components/GameInfo.tsx";
import { Privacy } from "./components/Privacy.tsx";
import { Main } from "./components/Main.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Router>
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/krypto" element={<GameInfo name="krypto" />} />
      <Route path="/krypto/privacy" element={<Privacy name="krypto" />}></Route>
      <Route path="/thenorisproject" element={<GameInfo name="tnp" />} />
    </Routes>
  </Router>
);
