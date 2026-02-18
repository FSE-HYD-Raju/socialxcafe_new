import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Events from "./components/Events";
import Gallery from "./components/Gallery";
import Visit from "./components/Visit";
import WhatsApp from "./components/WhatsApp";
import TheSpace from "./components/TheSpace";

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <TheSpace />
      <Events />
      <Gallery />
      <Visit />
      <WhatsApp />
    </>
  );
}
