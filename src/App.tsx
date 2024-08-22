import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { scrollToSection } from "./functions/scrollToSection";
import { useLanguage } from "./hooks/useLanguage";
import { Privacy } from "./components/Privacy";
import { Main } from "./components/Main";
import { Loading } from "./components/Loading";
import { LanguageSelector } from "./components/LanguageSelector";
import "./App.css";
import { setPageTitle } from "./functions/setPageTitle";
import {
  kryptoPath,
  kryptoPrivacyPath,
  name,
  tnpPath,
} from "./constants/general";

const LazyGameInfo = React.lazy(() => import("./components/GameInfo"));

function App() {
  const { traductions } = useLanguage();
  setPageTitle(`${name}: ${traductions.home}`);
  window.addEventListener("resize", () => scrollToSection("home"));

  return (
    <div className="app">
      <Suspense fallback={<Loading />}>
        <LanguageSelector />
        <Routes>
          <Route 
            path="/" 
            element={<Main />} 
          />

          <Route
            path={kryptoPath}
            element={<LazyGameInfo name="krypto" description={traductions.kryptoDescription}/>}
          />

          <Route 
            path={kryptoPrivacyPath} 
            element={<Privacy name="krypto" />} 
          />

          <Route
            path={tnpPath}
            element={<LazyGameInfo name="tnp" description={traductions.tnpDescription}/>}
          />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
