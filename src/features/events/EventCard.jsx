import { useNavigate } from "react-router-dom";

export default function EventCard({ event }) {
  const navigate = useNavigate();
  console.log(event);

  return (
    <div
      onClick={() => navigate(`/events/${event.slug}`)}
      className="cursor-pointer rounded-3xl overflow-hidden shadow hover:shadow-xl transition bg-white"
    >
      <img src={event.poster} className="h-64 w-full object-cover" />
      <div className="p-5">
        <h3 className="font-semibold text-lg">{event.title}</h3>

        <p className="text-sm text-gray-500 mt-1">{event.location}</p>

        <p className="text-sm text-gray-500">
          {event.eventDate?.toDate()?.toDateString()}
        </p>

        <div className="flex justify-between items-center mt-4">
          <span className="text-primary font-semibold">₹{event.price}</span>

          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
            {event.category}
          </span>
        </div>
      </div>
    </div>
  );
}
