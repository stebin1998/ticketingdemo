import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faCalendarAlt, faImage } from '@fortawesome/free-solid-svg-icons';

const EventCard = ({ event, formatDate, getCategoryIcon, getImage }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        {event.image ? (
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <FontAwesomeIcon icon={faImage} size="3x" className="text-gray-400" />
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold">{event.title}</h3>
        <p className="text-sm text-gray-600 flex items-center mt-1">
          <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" /> {formatDate(event.date)}
        </p>
        <p className="text-sm text-gray-600 flex items-center mt-1">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" /> {event.location}
        </p>
        
        {/* Updated Price Line with "(lowest)" */}
        <p className="text-sm text-blue-600 font-semibold mt-1">
          ${event.price.toFixed(2)} <span className="text-xs text-gray-500 ml-1">(lowest)</span>
        </p>
        
        <p className="text-sm text-gray-500 mt-1">by {event.organizer}</p>
      </div>
    </div>
  );
};

export default EventCard;
