import { useState } from "react";
import { motion } from "framer-motion";

export default function Gallery() {
  const imageModules = import.meta.glob("../../assets/gallery/*.webp", {
    eager: true,
  });
  const images = Object.values(imageModules).map((module) => module.default);
  const [selected, setSelected] = useState(null);
  return (
    <section className="py-32 px-6 bg-section overflow-hidden" id="gallery">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16 max-w-2xl"
        >
          <h2 className="font-heading text-4xl md:text-6xl mb-4">
            Captured Moments
          </h2>
          <p className="text-muted text-lg">
            A glimpse into the atmosphere, people, and experiences at SocialX.
          </p>
        </motion.div>
        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl group cursor-pointer"
              onClick={() => setSelected(img)}
            >
              <img
                src={img}
                alt="Social X Hub"
                loading="lazy"
                className="
                 w-full h-full object-cover aspect-[4/5]
                 transition-transform duration-700
                 group-hover:scale-110
               "
              />
              {/* Hover Overlay */}
              <div
                className="
               absolute inset-0 bg-black/20 opacity-0
               group-hover:opacity-100
               transition duration-500
             "
              />
            </motion.div>
          ))}
        </div>
        {/* Google Link */}
        <div className="mt-20 text-center">
          <a
            href="https://www.google.com/search?q=socialx&oq=social&gs_lcrp=EgZjaHJvbWUqDggDEEUYJxg7GIAEGIoFMgYIABBFGDwyBggBEEUYPDIPCAIQRRg5GLEDGMkDGIAEMg4IAxBFGCcYOxiABBiKBTIKCAQQABixAxiABDIKCAUQABixAxiABDIGCAYQRRg8MgYIBxBFGD3SAQg2MjUyajBqNKgCALACAQ&sourceid=chrome&ie=UTF-8&lqi=Cgdzb2NpYWx4SIHb4cXzuoCACFoNEAAYACIHc29jaWFseJIBBGNhZmU#rlimm=11268004468422833635&lpg=cid:CgIgAQ%3D%3D,ik:CAoSHENJQUJJaERwUVl6a0RqbjkxVmxmOXlSb09UaDk%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="
             inline-block px-8 py-4 rounded-full
             border border-primary/20
             transition hover:bg-primary hover:text-white
           "
          >
            View more photos on Google →
          </a>
        </div>
      </div>
      {/* Lightbox Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-6"
          onClick={() => setSelected(null)}
        >
          <motion.img
            src={selected}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="max-h-[90vh] rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </section>
  );
}
