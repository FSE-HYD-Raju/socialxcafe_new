// src/components/About.jsx
import { motion } from "framer-motion";

export default function About() {
  return (
    <motion.section
      id="about"
      className="py-20 bg-gray-50"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-6 md:flex items-center gap-10">
        {/* Text Section */}
        <motion.div
          className="md:w-1/2"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold mb-4">Welcome to SocialX</h2>
          <p className="text-lg text-gray-600 mb-4">
            SocialXcafe is a vibrant community space where people come together to meet,
            interact, play games, explore arts, and spend quality time. Whether you want
            to relax with coffee and snacks, enjoy our library, reserve a workspace, or
            participate in workshops and events — we are open for it all!
          </p>
          <p className="text-lg text-gray-600">
            Our goal is to create a welcoming environment where creativity, collaboration,
            and fun meet. SocialXcafe is more than a cafe — it’s a hub for community,
            learning, and entertainment.
          </p>
        </motion.div>

        {/* Image Section */}
        <motion.div
          className="md:w-1/2 mt-8 md:mt-0"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src="https://dutchreview.com/wp-content/uploads/young-girl-working-in-a-cafe-in-eindhoven-1024x683.jpg"
            alt="Community Space"
            className="rounded-xl shadow-lg object-cover w-full h-full"
          />
        </motion.div>
      </div>
    </motion.section>
  );
}