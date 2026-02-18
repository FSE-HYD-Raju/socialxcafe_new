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
        <span className="font-heading">SOCIALXCAFE</span>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 text-sm">
          <a href="#hero">Home</a>
          <a href="#about">About</a>
          <a href="#thespace">The Space</a>
          <a href="#events">Events</a>
          <a href="#gallery">Gallery</a>
          <a href="#visit">Visit Us</a>
        </nav>

        {/* Mobile Hamburger */}
        {!open && (
          <button className="md:hidden mr-8 " onClick={() => setOpen(true)}>
            <Menu size={30} />
          </button>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-bg z-40 flex flex-col items-center justify-center gap-8 text-2xl font-heading transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          className="absolute top-6 right-8"
          onClick={() => setOpen(false)}
        >
          <X size={28} />
        </button>

        <a href="#hero" onClick={() => setOpen(false)}>
          Home
        </a>
        <a href="#about" onClick={() => setOpen(false)}>
          About
        </a>
        <a href="#thespace" onClick={() => setOpen(false)}>
          The Space
        </a>
        <a href="#events" onClick={() => setOpen(false)}>
          Events
        </a>
        <a href="#gallery" onClick={() => setOpen(false)}>
          Gallery
        </a>
        <a href="#visit" onClick={() => setOpen(false)}>
          Visit Us
        </a>
      </div>
    </>
  );
}
