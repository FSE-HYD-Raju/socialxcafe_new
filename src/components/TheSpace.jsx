const features = [
  {
    title: "Snooker & Games",
    desc: "Play, without urgency.",
    icon: "🎱",
  },
  {
    title: "Workspace",
    desc: "A calm place to focus.",
    icon: "💻",
  },
  {
    title: "Coffee & Snacks",
    desc: "Crafted to be savoured.",
    icon: "☕️ ",
  },
  {
    title: "Library",
    desc: "Quiet corners for reading.",
    icon: "📚",
  },
  {
    title: "Community",
    desc: "Events & shared moments.",
    icon: "🧑‍🤝‍🧑",
  },
];
export default function TheSpace() {
  return (
    <section className="px-6 py-24" id="thespace">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-heading text-4xl md:text-5xl mb-4">The Space</h1>
        <p className="text-muted mb-16">
          Everything here is designed to be used, not rushed.
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="border border-primary/10 rounded-2xl p-8"
            >
              <div className="text-2xl mb-4">{f.icon}</div>
              <h3 className="font-heading text-xl mb-2">{f.title}</h3>
              <p className="text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
