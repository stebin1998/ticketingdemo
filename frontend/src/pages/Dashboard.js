import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch, faMapMarkerAlt, faPlus, faCalendarAlt, faTicketAlt,
    faMusic, faPalette, faUtensils, faRunning, faFilm, faMicrophoneAlt,
    faExclamationCircle, faImage, faHeart, faShare
} from '@fortawesome/free-solid-svg-icons';
import ErrorBoundary from '../components/ErrorBoundary';
import EventCardSkeleton from '../components/EventCardSkeleton';
import FeaturedEvent from '../components/FeaturedEvent';
import EventCard from '../components/EventCard';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Dashboard = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [locationFilter, setLocationFilter] = useState('All Locations');
    const [isLoading, setIsLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const MAX_LENGTH = 200;

    const openModal = (event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedEvent(null);
        setIsModalOpen(false);
    };

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        // Clean up on unmount just in case
        return () => {
            document.body.style.overflow = '';
        };
    }, [isModalOpen]);


    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:4556/events');
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
            const data = await response.json();

            // Transform the data to match our EventCard component's expected format
            const transformedEvents = data
                .filter(event => event.eventSettings?.publishStatus === 'published')
                .map(event => ({
                    ...event,
                    id: event._id,
                    title: event.name,
                    date: event.dateTimes?.eventSlots?.[0]?.startDate || new Date().toISOString(),
                    location: `${event.location?.venueName || ''}, ${event.location?.city || ''}`,
                    price: event.ticketTiers?.[0]?.price || 0,
                    organizer: event.organizerContact?.name || 'Unknown',
                    image: event.files?.[0] || '',
                    description: event.description,
                    category: event.genre,
                    status: event.eventSettings?.publishStatus || 'published'
                }));

            setEvents(transformedEvents);
        } catch (err) {
            setError("Failed to load events. Please try again.");
            console.error('Error fetching events:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const shouldTruncate = selectedEvent?.description?.length > MAX_LENGTH;
    const displayedDescription =
        selectedEvent?.description
            ? isExpanded || !shouldTruncate
                ? selectedEvent.description
                : selectedEvent.description.slice(0, MAX_LENGTH) + '...'
            : '';

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const handleSearchChange = (value) => {
        setSearchQuery(value);
    };

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
                                    actions={
                                        <button

                                            onClick={() => {
                                                setSelectedEvent(event);
                                                openModal(event);
                                                setIsModalOpen(true);
                                            }}
                                            className="bg-[#5E4DC3] text-white rounded w-full py-2 hover:bg-opacity-90 transition-colors"
                                        >
                                            Buy Ticket
                                        </button>
                                    }
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
            {isModalOpen && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl relative overflow-hidden">

                        {/* Close Button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-3 right-4 text-3xl text-gray-400 hover:text-gray-600 z-10"
                        >
                            &times;
                        </button>

                        {/* Banner Image */}
                        <div className="relative w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400 text-xl">
                            {selectedEvent.image ? (
                                <img
                                    src={selectedEvent.image}
                                    alt={selectedEvent.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                "No banner available"
                            )}

                            {/* Icons positioned over the image */}
                            <div className="absolute bottom-2 right-5 flex space-x-4 text-white drop-shadow-lg">
                                <FontAwesomeIcon
                                    icon={faHeart}
                                    className="cursor-pointer hover:text-red-500"
                                    size="lg"
                                />
                                <FontAwesomeIcon
                                    icon={faShare}
                                    className="cursor-pointer hover:text-blue-500"
                                    size="lg"
                                />
                            </div>
                        </div>
                        {/* Modal Content */}
                        <div className="p-6">
                            {/* Title */}
                            {selectedEvent && (
                                <>
                                    <h2 className="text-2xl font-bold text-ticketmi-primary break-words max-w-full sm:max-w-[55%] mb-2">
                                        {selectedEvent.title}
                                    </h2>

                                    {selectedEvent.description && (
                                        <p className="text-sm text-gray-600 mb-4 mt-2">
                                            {isExpanded
                                                ? selectedEvent.description
                                                : selectedEvent.description.slice(0, 200) + (selectedEvent.description.length > 200 ? '...' : '')}
                                            {selectedEvent.description.length > 200 && (
                                                <button
                                                    onClick={() => setIsExpanded(!isExpanded)}
                                                    className="text-ticketmi-primary underline ml-1 text-xs"
                                                >
                                                    {isExpanded ? 'Read less' : 'Read more'}
                                                </button>
                                            )}
                                        </p>
                                    )}
                                </>
                            )}

                            {/* Event Details */}
                            <ul className="text-sm text-gray-700 space-y-1 mb-4">
                                <li><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleString()}</li>
                                <li><strong>Location:</strong> {selectedEvent.location}</li>
                                <li><strong>Organizer:</strong> {selectedEvent.organizer}</li>
                            </ul>
                            {/* Ticket Price Range Section */}
                            {selectedEvent.ticketTiers?.length > 0 ? (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Ticket Price</h3>
                                    <p className="text-gray-700 font-semibold">
                                        {(() => {
                                            const prices = selectedEvent.ticketTiers
                                                .filter(tier => tier.active && tier.public)
                                                .map(tier => tier.price)
                                                .sort((a, b) => a - b);
                                            if (prices.length === 0) return "No available tickets";
                                            if (prices.length === 1) return `$${prices[0].toFixed(2)}`;
                                            return `$${prices[0].toFixed(2)} - $${prices[prices.length - 1].toFixed(2)}`;
                                        })()}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 mb-6">No ticket tiers available.</p>
                            )}

                            {/* Checkout Button */}
                            <button
                                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                                onClick={() => {
                                    alert("Proceeding to checkout flow 🚀");
                                    closeModal();
                                }}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </ErrorBoundary>
    );
};

export default Dashboard;
