import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Navbar */}
      <header
        className={`fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center transition-all duration-300 ${
          scrolled
            ? "bg-bg shadow-md text-primary"
            : "bg-transparent text-white"
        }`}
      >
        <span className="font-heading font-bold letter-spacing">
          SOCIALXCAFE
        </span>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 text-sm">
          <a href="#hero">HOME</a>
          <a href="#about">ABOUT</a>
          <a href="#thespace">THE SPACE</a>
          <a href="#events">EVENTS</a>
          <a href="#gallery">GALLERY</a>
          <a href="#visit">VISIT US</a>
        </nav>

        {/* Mobile Hamburger */}
        {!open && (
          <button className="md:hidden" onClick={() => setOpen(true)}>
            <Menu size={30} />
          </button>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-bg z-[100] flex flex-col items-center justify-center gap-8 text-2xl font-heading transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          className="absolute top-4 right-2 z-[110]"
          onClick={() => setOpen(false)}
        >
          <X size={28} />
        </button>

        <a href="#hero" onClick={() => setOpen(false)}>
          HOME
        </a>
        <a href="#about" onClick={() => setOpen(false)}>
          ABOUT
        </a>
        <a href="#thespace" onClick={() => setOpen(false)}>
          THE SPACE
        </a>
        <a href="#events" onClick={() => setOpen(false)}>
          EVENTS
        </a>
        <a href="#gallery" onClick={() => setOpen(false)}>
          GALLERY
        </a>
        <a href="#visit" onClick={() => setOpen(false)}>
          VISIT US
        </a>
      </div>
    </>
  );
}
