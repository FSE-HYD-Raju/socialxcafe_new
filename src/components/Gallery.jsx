export default function Gallery() {
  // Dynamically import all .webp files from gallery folder
  const imageModules = import.meta.glob("../assets/gallery/*.webp", {
    eager: true,
  });

  // Convert modules to usable image paths
  const images = Object.values(imageModules).map((module) => module.default);

  return (
    <section className="py-24 px-6" id="gallery">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-heading text-3xl md:text-5xl mb-14">Gallery</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img, i) => (
            <div key={i} className="overflow-hidden rounded-2xl group">
              <img
                src={img}
                alt="Social X Cafe"
                loading="lazy"
                className="
                  w-full h-full object-cover aspect-[4/5]
                  transition-transform duration-500
                  group-hover:scale-105
                "
              />
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="https://www.google.com/maps/place/YOUR_BUSINESS"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-primary font-medium hover:opacity-70 transition"
          >
            View more photos on Google →
          </a>
        </div>
      </div>
    </section>
  );
}
