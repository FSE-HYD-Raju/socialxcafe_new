import { motion } from "framer-motion";

export default function Events() {
  const events = [
    {
      title: "Events, Games, and more.",
      date: "",
      description: "Events shaped by people, ideas, and shared moments.",
      link: "https://linktr.ee/Socialx.hub",
    },
  ];

  return (
    <section id="events" className="py-32 px-6 bg-section overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Intro */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl mb-20"
        >
          <h2 className="font-heading text-4xl md:text-6xl mb-6 leading-tight">
            Community Events
          </h2>
          <p className="text-lg text-muted leading-relaxed">
            Our events are shaped by the people who attend them. They are about
            shared moments, ideas, and connections. Whether it's a game night, a
            workshop, or a casual meetup, every gathering is an opportunity to
            be part of something meaningful.
          </p>
        </motion.div>

        {/* Event Card */}
        <div className="grid md:grid-cols-1 gap-10">
          {events.map((event, i) => (
            <motion.a
              key={i}
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="
                group block p-12 rounded-3xl
                border border-primary/10
                bg-white/40 backdrop-blur-sm
                transition-all duration-500
                hover:shadow-2xl hover:-translate-y-2
              "
            >
              {event.date && (
                <p className="text-sm text-muted mb-3">{event.date}</p>
              )}
              <h3 className="font-heading text-3xl mb-5 group-hover:text-primary transition">
                {event.title}
              </h3>
              <p className="text-muted text-lg max-w-2xl">
                {event.description}
              </p>
              <div className="mt-8 text-sm font-medium text-primary">
                View Details →
              </div>

              {/* subtle animated underline */}
              <div className="mt-4 h-[1px] bg-primary/20 w-0 group-hover:w-full transition-all duration-500" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
