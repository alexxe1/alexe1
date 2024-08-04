import "./App.css";
import { Main } from "./components/Main";
import { GameInfo } from "./components/GameInfo";
import { Routes, Route } from "react-router-dom";
import { Privacy } from "./components/Privacy";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/krypto" element={<GameInfo name="krypto" />} />
      <Route path="/krypto/privacy" element={<Privacy name="krypto" />}></Route>
      <Route path="/thenorisproject" element={<GameInfo name="tnp" />} />
    </Routes>
  );
}

export default App;
