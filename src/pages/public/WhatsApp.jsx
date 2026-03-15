import { Instagram, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
export default function SocialRail() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="
       fixed right-6 bottom-10 z-[120]
       flex flex-col gap-4
     "
    >
      {/* WhatsApp */}
      <a
        href="https://wa.me/917842296700"
        target="_blank"
        rel="noopener noreferrer"
        className="
         group w-12 h-12 flex items-center justify-center
         rounded-full bg-[#25D366] text-white
         shadow-lg
         transition-all duration-300
         hover:scale-110 hover:shadow-2xl
       "
        aria-label="WhatsApp"
      >
        <MessageCircle size={20} />
      </a>
      {/* Instagram */}
      <a
        href="https://instagram.com/socialxcafe"
        target="_blank"
        rel="noopener noreferrer"
        className="
         group w-12 h-12 flex items-center justify-center
         rounded-full bg-white
         border border-primary/20
         shadow-md
         transition-all duration-300
         hover:bg-gradient-to-tr hover:from-pink-500 hover:to-yellow-400
         hover:text-white hover:scale-110 hover:shadow-xl
       "
        aria-label="Instagram"
      >
        <Instagram size={20} />
      </a>
    </motion.div>
  );
}
