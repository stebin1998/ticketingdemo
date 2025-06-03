import React from 'react';

const FeaturedEvent = ({ event, formatDate, getImage }) => (
  <section className="relative w-full h-96 overflow-hidden">
    <div className="absolute inset-0">
      {event.image ? (
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
      ) : getImage('')}
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
    <div className="absolute bottom-0 p-6 text-white">
      <h2 className="text-3xl font-bold">{event.title}</h2>
      <p className="text-sm mb-2">{formatDate(event.date)} | {event.location}</p>
      <p className="text-sm max-w-lg">{event.description}</p>
      <button className="mt-4 px-4 py-2 bg-[#2D2B8F] text-white rounded-md hover:bg-[#453C9B] transition">
        View Event
      </button>
    </div>
  </section>
);

export default FeaturedEvent;
