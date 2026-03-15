// src/components/Contact.jsx
import { motion } from "framer-motion";

export default function Contact() {
  return (
    <motion.section
      id="visit"
      className="bg-black text-white py-16"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-6 md:flex md:justify-between md:items-start gap-10">
        {/* Business Info */}
        <div className="md:w-1/2">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            SocialX Cafe | Snooker and Co-workspace
          </h2>
          <p className="mb-2">
            Address: 3rd Floor, Mani Tech Space, Siddhi Vinayak Nagar, Madhapur,
            Hyderabad, Telangana 500081
          </p>
          <p className="mb-4">
            Phone:{" "}
            <a
              href="tel:07842296700"
              className="underline hover:text-yellow-500"
            >
              7842296700
            </a>
          </p>

          <h3 className="text-xl font-semibold mb-2">Hours:</h3>
          <ul className="text-gray-300">
            <li>Monday: Closed</li>
            <li>Tuesday: 5:00 PM – 11:30 PM</li>
            <li>Wednesday: 11:00 AM – 11:30 PM</li>
            <li>Thursday: 11:00 AM – 11:30 PM</li>
            <li>Friday: 11:00 AM – 11:30 PM</li>
            <li>Saturday: 11:00 AM – 11:30 PM</li>
            <li>Sunday: 10:00 AM – 11:30 PM</li>
          </ul>
        </div>

        {/* Optional: Map or Additional Info */}
        <div className="md:w-1/2 mt-8 md:mt-0">
          <iframe
            title="SocialX Cafe Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.945484558203!2d78.40180881508006!3d17.441020888090314!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb914f8462b1f7%3A0x8e8c7b5eb4f8d128!2sSocialX%20Cafe!5e0!3m2!1sen!2sin!4v1695929345678!5m2!1sen!2sin"
            className="w-full h-64 rounded-xl shadow-lg border-0"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-12 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} SocialX Cafe. All rights reserved.
      </div>
    </motion.section>
  );
}