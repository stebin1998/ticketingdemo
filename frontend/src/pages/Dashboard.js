import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch, faMapMarkerAlt, faPlus, faCalendarAlt, faTicketAlt,
  faMusic, faPalette, faUtensils, faRunning, faFilm, faMicrophoneAlt,
  faExclamationCircle, faImage
} from '@fortawesome/free-solid-svg-icons';
import debounce from 'lodash.debounce';
import ErrorBoundary from '../components/ErrorBoundary';
import EventCardSkeleton from '../components/EventCardSkeleton';
import FeaturedEvent from '../components/FeaturedEvent';
import EventCard from '../components/EventCard';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('Toronto');
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockEvents = [
        {
          id: 1,
          title: "Summer Music Festival",
          date: "2023-07-15T19:00:00",
          location: "Toronto Waterfront",
          price: 49.99,
          organizer: "Music Inc.",
          image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4",
          isFeatured: true,
          description: "3 days of music!",
          category: "music",
          status: "featured"
        },
        ...Array.from({ length: 10 }, (_, i) => ({
          id: i + 2,
          title: `Event ${i + 2}`,
          date: new Date(Date.now() + i * 86400000).toISOString(),
          location: ["Toronto", "Vancouver", "Montreal"][i % 3],
          price: Math.floor(Math.random() * 100) + 10,
          organizer: `Organizer ${i + 1}`,
          image: i % 2 === 0 ? `https://picsum.photos/seed/event${i}/300/200` : '',
          description: `Description for event ${i + 2}`,
          category: ["music", "art", "food", "sports"][i % 4],
          status: ["featured", "upcoming", "discover"][i % 3],
        })),
      ];
      setEvents(mockEvents);
    } catch (err) {
      setError("Failed to load events. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleSearchChange = useCallback(
    debounce((value) => setSearchQuery(value), 300),
    []
  );

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = searchQuery.trim() === '' ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLocation = locationFilter === 'All Locations' || 
        locationFilter.trim() === '' ||
        event.location.toLowerCase().includes(locationFilter.toLowerCase());

      return matchesSearch && matchesLocation;
    });
  }, [events, searchQuery, locationFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ticketmi-neutral flex flex-col">
        <Header />
        <div className="flex-grow container mx-auto px-5 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <EventCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ticketmi-neutral flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-lg shadow-sm max-w-md">
            <FontAwesomeIcon icon={faExclamationCircle} size="2x" className="text-ticketmi-error mb-4" />
            <h3 className="text-lg font-bold text-ticketmi-text mb-2">Error Loading Events</h3>
            <p className="text-ticketmi-text mb-4">{error}</p>
            <button onClick={fetchEvents} className="px-4 py-2 bg-gradient-to-r from-ticketmi-primary to-ticketmi-secondary text-white rounded-full hover:scale-105 transition">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-ticketmi-neutral flex flex-col">
        <Header
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          locationFilter={locationFilter}
          onLocationChange={setLocationFilter}
        />

        {events.some(e => e.isFeatured) && (
          <FeaturedEvent
            event={events.find(e => e.isFeatured)}
            formatDate={(dateString) => new Date(dateString).toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
            getImage={(image) => image || (<div className="bg-gray-200 flex items-center justify-center h-full"><FontAwesomeIcon icon={faImage} size="3x" className="text-gray-400" /></div>)}
          />
        )}

        <main className="flex-grow container mx-auto px-5 py-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-ticketmi-text text-left">
              Top Events in {locationFilter || 'Your Area'}
            </h2>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  formatDate={(dateString) => new Date(dateString).toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                  getCategoryIcon={category => ({
                    music: faMusic, art: faPalette, food: faUtensils, sports: faRunning, film: faFilm, comedy: faMicrophoneAlt
                  }[category] || faTicketAlt)}
                  getImage={(image) => image || (<div className="bg-gray-200 flex items-center justify-center h-full"><FontAwesomeIcon icon={faImage} size="3x" className="text-gray-400" /></div>)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-ticketmi-text">No events found. Try adjusting your filters.</p>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
