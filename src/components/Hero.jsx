import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import games from "../assets/images/games.webp";
import events from "../assets/images/events.webp";
import lib from "../assets/images/lib.webp";
import coffee from "../assets/images/coffee.jpeg";
import workspace from "../assets/images/workspace.jpeg";

const slides = [
  {
    title: "Play, at your own pace.",
    subtitle: "Snooker. Games. Unhurried evenings.",
    image: games,
  },
  {
    title: "Coffee, taken seriously.",
    subtitle: "Brewed slow. Savoured well.",
    image: coffee,
  },
  {
    title: "Stay a little longer.",
    subtitle: "Work. Think. Breathe.",
    image: workspace,
  },
  {
    title: "Where conversations belong.",
    subtitle: "Events. People. Shared moments.",
    image: events,
  },
  {
    title: "Quiet has a place here.",
    subtitle: "Read. Reflect. Disconnect.",
    image: lib,
  },
];

export default function Hero() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden" id="hero">
      {/* Background */}
      <AnimatePresence>
        <motion.img
          key={index}
          src={slides[index].image}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0.2 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        />
      </AnimatePresence>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[index].title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <h1 className="font-heading text-4xl md:text-6xl text-bg leading-tight">
              {slides[index].title}
            </h1>
            <p className="mt-4 text-bg/80 text-base md:text-lg">
              {slides[index].subtitle}
            </p>
            <div className="mt-8 flex gap-4">
              <a
                href="#visit"
                className="px-6 py-3 rounded-full bg-bg text-primary text-sm"
              >
                Visit Us
              </a>
              <a
                href="#events"
                className="px-6 py-3 rounded-full border border-bg text-bg text-sm"
              >
                What’s happening
              </a>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Indicators */}
        <div className="absolute bottom-8 left-6 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full transition-all ${
                i === index ? "bg-bg w-6" : "bg-bg/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
