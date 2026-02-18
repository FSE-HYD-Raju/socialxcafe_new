import { InstagramIcon, MessageCircle } from "lucide-react";

export default function SocialRail() {
  return (
    <div
      className="
        fixed right-4 bottom-1/3 z-50
        flex flex-col gap-3
        opacity-100 md:opacity-0
        md:group-hover:opacity-100
        transition-all duration-300

      "
    >
      <a
        href="https://wa.me/91XXXXXXXXXX"
        target="_blank"
        rel="noopener noreferrer"
        className="w-11 h-11 flex items-center justify-center
                   rounded-full bg-primary text-bg
                   hover:scale-105 transition"
        aria-label="WhatsApp"
      >
        <MessageCircle size={18} />
      </a>
      <a
        href="https://instagram.com/socialxcafe"
        target="_blank"
        rel="noopener noreferrer"
        className="w-11 h-11 flex items-center justify-center
                   rounded-full border border-primary/20
                   hover:bg-primary hover:text-bg
                   transition"
        aria-label="Instagram"
      >
        {/* <InstagramIcon size={18} /> */}
      </a>
    </div>
  );
}
