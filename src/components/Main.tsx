import { Header } from "./Header";
import { Home } from "./Home";
import { About } from "./About";
import { Contact } from "./Contact";
import { Games } from "./Games";
import { Footer } from "./Footer";

export function Main() {
  return (
    <main>
      <Header />
      <Home />
      <About />
      <Contact />
      <Games />
      <Footer />
    </main>
  );
}
