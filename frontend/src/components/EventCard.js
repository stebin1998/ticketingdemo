import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faCalendarAlt, faImage } from '@fortawesome/free-solid-svg-icons';

const EventCard = ({
  event = {
    image: '',
    title: 'Untitled Event',
    date: '',
    location: 'Unknown',
    price: 0,
    organizer: 'Unknown',
  },
  formatDate = () => '',
  getCategoryIcon,
  getImage,
  actions,
}) => {
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
        <p className="text-sm text-blue-600 font-semibold mt-1">
          {event.price === 0 ? (
            "Free"
          ) : (
            <>
              ${event.price.toFixed(2)} <span className="text-xs text-gray-500 ml-1">(lowest)</span>
            </>
          )}
        </p>
        <p className="text-sm text-gray-500 mt-1">by {event.organizer}</p>
        {actions ? (
          <div className="mt-3">{actions}</div>
        ) : (
          <button className="bg-[#5E4DC3] text-white rounded w-full py-2 mt-3 hover:bg-opacity-90 transition-colors">
            Buy Ticket
          </button>
        )}
      </div>
    </div>
  );
};

EventCard.propTypes = {
  event: PropTypes.shape({
    image: PropTypes.string,
    title: PropTypes.string,
    date: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
    location: PropTypes.string,
    price: PropTypes.number,
    organizer: PropTypes.string,
  }),
  formatDate: PropTypes.func,
  getCategoryIcon: PropTypes.func,
  getImage: PropTypes.func,
  actions: PropTypes.node,
};

export default EventCard;
