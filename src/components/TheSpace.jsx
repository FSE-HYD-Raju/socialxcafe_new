import { motion } from "framer-motion";
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
    icon: "☕️",
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
    <section
      id="thespace"
      className="relative py-6 px-6 bg-section overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Intro */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-2xl mb-10"
        >
          <h2 className="font-heading text-4xl md:text-4xl mb-6 leading-tight">
            Designed to be experienced.
          </h2>
          <p className="text-md text-muted">
            Every corner of SocialXCafe is shaped for presence — whether you’re
            here to play, focus, read, or simply be.
          </p>
        </motion.div>
        {/* Features */}
        <div className="grid md:grid-cols-2 gap-12">
          {features.map((f, index) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="
               group p-5 rounded-3xl
               border border-primary/10
               bg-white/40 backdrop-blur-sm
               transition-all duration-500
               hover:shadow-2xl hover:-translate-y-2
             "
            >
              <div className="text-4xl mb-6">{f.icon}</div>
              <h3 className="font-heading text-2xl mb-3">{f.title}</h3>
              <p className="text-muted text-lg">{f.desc}</p>
              {/* subtle hover underline */}
              <div className="mt-6 h-[1px] bg-primary/20 w-0 group-hover:w-full transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
