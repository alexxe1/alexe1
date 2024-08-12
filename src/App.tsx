import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Privacy } from "./components/Privacy";
import { Main } from "./components/Main";
import React, { Suspense } from "react";
import { Loading } from "./components/Loading";

const LazyGameInfo = React.lazy(() => import("./components/GameInfo"));

function App() {
  const setVh = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };

  window.addEventListener("resize", setVh);
  window.addEventListener("orientationchange", setVh);
  setVh();

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/krypto" element={<LazyGameInfo name="krypto" />} />
        <Route path="/krypto/privacy" element={<Privacy name="krypto" />} />
        <Route path="/thenorisproject" element={<LazyGameInfo name="tnp" />} />
      </Routes>
    </Suspense>
  );
}

export default App;
