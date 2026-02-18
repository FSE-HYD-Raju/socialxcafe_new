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
    <section id="events" className="py-24 px-6 bg-section">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <h2 className="font-heading text-3xl md:text-5xl mb-4">
            Community Events
          </h2>
          <p className="text-muted">
            Our events are shaped by the people who attend them. They are about
            shared moments, ideas, and connections. Whether it's a game night, a
            workshop, or a casual meetup, every event is an opportunity to be
            part of something bigger. Check out our upcoming events and join us
            in creating memorable experiences together.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {events.map((event, i) => (
            <a
              key={i}
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-8 rounded-2xl border border-primary/10 
                         transition hover:shadow-lg hover:-translate-y-1"
            >
              <p className="text-sm text-muted mb-2">{event.date}</p>

              <h3 className="font-heading text-xl mb-3">{event.title}</h3>

              <p className="text-muted text-sm">{event.description}</p>

              <div className="mt-6 text-sm font-medium text-primary">
                View Details →
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
