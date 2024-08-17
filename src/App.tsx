import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Privacy } from "./components/Privacy";
import { Main } from "./components/Main";
import React, { Suspense } from "react";
import { Loading } from "./components/Loading";
import { scrollToSection } from "./functions/scrollToSection";

const LazyGameInfo = React.lazy(() => import("./components/GameInfo"));

function App() {
  window.addEventListener("resize", () => {
    if (document.title == "alexe1: Contact") {
      scrollToSection("contact");
    } else {
      scrollToSection("home");
    }
  });

  return (
    <div className="app">
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/krypto" element={<LazyGameInfo name="krypto" />} />
          <Route path="/krypto/privacy" element={<Privacy name="krypto" />} />
          <Route
            path="/thenorisproject"
            element={<LazyGameInfo name="tnp" />}
          />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
