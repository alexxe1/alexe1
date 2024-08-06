import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Privacy } from "./components/Privacy";
import { Main } from "./components/Main";
import React, { Suspense } from "react";
import { Loading } from "./components/Loading";

const LazyGameInfo = React.lazy(() => import("./components/GameInfo"));

function App() {
  console.log("page version: 1.4");

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/krypto" element={<LazyGameInfo name="krypto" />}>
          <Route path="/krypto/privacy" element={<Privacy name="krypto" />} />
        </Route>
        <Route path="/thenorisproject" element={<LazyGameInfo name="tnp" />} />
      </Routes>
    </Suspense>
  );
}

export default App;
