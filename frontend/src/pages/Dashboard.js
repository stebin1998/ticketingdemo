import React, { useState, useEffect, useMemo, useCallback, } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch, faMapMarkerAlt, faPlus, faCalendarAlt, faTicketAlt,
    faMusic, faPalette, faUtensils, faRunning, faFilm, faMicrophoneAlt,
    faExclamationCircle, faImage, faHeart, faShare, faArrowUpRightFromSquare, faLocationArrow, faBookmark
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';
import EventCardSkeleton from '../components/EventCardSkeleton';
import FeaturedEvent from '../components/FeaturedEvent';
import EventCard from '../components/EventCard';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Dashboard = () => {
    // Keep authentication logic from HEAD
    const { isAuthenticated, loading: authLoading } = useAuth();
    
    // Enhanced state from teammate's version
    const [searchQuery, setSearchQuery] = useState('');
    const [locationFilter, setLocationFilter] = useState('All Locations');
    const [isLoading, setIsLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Ticket purchase modal states
    const [modalView, setModalView] = useState('details'); // 'details' or 'tickets'
    const [ticketQuantities, setTicketQuantities] = useState({});
    const [cartItems, setCartItems] = useState([]);

    const MAX_LENGTH = 200;

    const openModal = (event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedEvent(null);
        setIsModalOpen(false);
        setModalView('details');
        setTicketQuantities({});
        setCartItems([]);
    };

    const switchToTicketView = () => {
        setModalView('tickets');
    };

    const switchToDetailsView = () => {
        setModalView('details');
    };

    const handleTicketQuantityChange = (tierIndex, quantity) => {
        setTicketQuantities(prev => ({
            ...prev,
            [tierIndex]: Math.max(0, parseInt(quantity) || 0)
        }));
    };

    const addToCart = (tierIndex) => {
        const tier = selectedEvent.ticketTiers[tierIndex];
        const quantity = ticketQuantities[tierIndex] || 0;
        
        if (quantity > 0) {
            setCartItems(prev => [...prev, {
                tierIndex,
                tierName: tier.name,
                quantity,
                price: tier.price,
                total: quantity * tier.price
            }]);
            alert(`Added ${quantity} ${tier.name} ticket(s) to cart!`);
        }
    };

    const handleProceedToCart = () => {
        const totalItems = Object.values(ticketQuantities).reduce((sum, qty) => sum + qty, 0);
        if (totalItems > 0) {
            alert(`Proceeding to checkout with ${totalItems} ticket(s)!`);
            closeModal();
        } else {
            alert("Please select at least one ticket to proceed.");
        }
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




    function formatEventDateTime(event) {
        if (!event.startDate || !event.startTime) return '';

        const startDatePart = new Date(event.startDate);
        const [startHour, startMinute] = event.startTime.split(':').map(Number);
        const startDateTime = new Date(startDatePart);
        startDateTime.setHours(startHour, startMinute);

        // build end DateTime if available
        let endDateTime = null;
        if (event.endDate && event.endTime) {
            const endDatePart = new Date(event.endDate);
            const [endHour, endMinute] = event.endTime.split(':').map(Number);
            endDateTime = new Date(endDatePart);
            endDateTime.setHours(endHour, endMinute);
        } else {
            // fallback: assume 4 hours duration
            endDateTime = new Date(startDateTime);
            endDateTime.setHours(endDateTime.getHours() + 4);
        }

        const dayDateFormatter = new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });
        const dayDate = dayDateFormatter.format(startDateTime);

        const timeFormatter = new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            hour12: true,
            timeZoneName: 'short',
        });

        const startTimeStr = timeFormatter.format(startDateTime).replace(':00', '');
        const endTimeStr = timeFormatter.format(endDateTime).replace(':00', '').replace(/\s[A-Z]{3,4}$/, '');

        return `${dayDate} · ${startTimeStr} - ${endTimeStr}`;
    }



    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/events`);
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
            const data = await response.json();

            // Transform the data to match our EventCard component's expected format
            const transformedEvents = data
                .filter(event => event.eventSettings?.publishStatus === 'published')
                .map(event => {
                    const firstSlot = event.dateTimes?.eventSlots?.[0] || {};
                    return {
                        ...event,
                        id: event._id,
                        tags: event.tags,
                        title: event.name,
                        location: {
                            eventType: event.location?.eventType || '',
                            venueName: event.location?.venueName || '',
                            streetAddress: event.location?.streetAddress || '',
                            city: event.location?.city || '',
                            postalCode: event.location?.postalCode || '',
                            country: event.location?.country || ''
                        },
                        price: event.ticketTiers?.[0]?.price || 0,
                        organizer: event.organizerContact?.name || 'Unknown',
                        image: event.files?.[0] || '',
                        description: event.description,
                        category: event.genre,
                        status: event.eventSettings?.publishStatus || 'published',
                        // new combined start and end datetime
                        startDate: firstSlot.startDate || null,
                        startTime: firstSlot.startTime || null,
                        endDate: firstSlot.endDate || firstSlot.startDate || null,  // fallback if no endDate
                        endTime: firstSlot.endTime || null,
                    };
                });



            setEvents(transformedEvents);
        } catch (err) {
            setError("Failed to load events. Please try again.");
            console.error('Error fetching events:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Wait for authentication to complete before loading events (from HEAD)
    useEffect(() => {
        if (!authLoading) {
            fetchEvents();
        }
    }, [authLoading, fetchEvents]);

    let lowestPrice = 0;

    if (selectedEvent?.ticketTiers?.length > 0) {
        const prices = selectedEvent.ticketTiers
            .filter(tier => tier.active && tier.public)
            .map(tier => tier.price)
            .sort((a, b) => a - b);

        lowestPrice = prices[0] || 0;
    }

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

            const locationString = [
                event.location.venueName,
                event.location.streetAddress,
                event.location.city,
                event.location.postalCode,
                event.location.country
            ].filter(Boolean).join(' ').toLowerCase();

            const matchesLocation = locationFilter === 'All Locations' ||
                locationFilter.trim() === '' ||
                locationString.includes(locationFilter.toLowerCase());


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
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50
               transition-opacity duration-300 ease-in-out"
                >
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full relative overflow-hidden
                    max-h-[90vh] flex flex-col">

                        {/* Close Button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-3 right-4 text-3xl text-gray-400 hover:text-gray-600
                                rounded-full p-1 shadow hover:shadow-md transition z-10"
                        >
                            &times;
                        </button>

                        {/* Banner Image */}
                        <div className="relative w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400 text-xl flex-shrink-0">
                            {selectedEvent.image ? (
                                <img
                                    src={selectedEvent.image}
                                    alt={selectedEvent.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                "No banner available"
                            )}
                            {/* Bottom gradient shadow */}
                           

                            {/* Icons positioned over the image */}
                            <div className="absolute bottom-2 right-5 flex space-x-4">
                                <div className="bg-black bg-opacity-50 rounded-full p-2 cursor-pointer hover:bg-red-600 transition">
                                    <FontAwesomeIcon
                                        icon={faHeart}
                                        size="lg"
                                        className="text-white"
                                    />
                                </div>
                                <div className="bg-black bg-opacity-50 rounded-full p-2 cursor-pointer hover:bg-blue-600 transition">
                                    <FontAwesomeIcon
                                        icon={faArrowUpRightFromSquare}
                                        size="lg"
                                        className="text-white"
                                    />
                                </div>
                            </div>
                        </div>
                        

                        {/* Modal Content Scrollable */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {modalView === 'details' ? (
                                // Event Details View
                                <div>
                                    {/* Title */}
                                    <h2 className="text-3xl font-extrabold text-ticketmi-primary leading-tight mb-4 break-words max-w-full sm:max-w-[55%]">
                                        {selectedEvent.title}
                                    </h2>

                            {/* Description */}
                            {selectedEvent.description && (
                                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
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

                            <hr className="border-t border-gray-200 mb-6" />

                            {/* Event Details */}
                            {/* Date Section */}
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Date</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-ticketmi-primary w-4 h-4" />
                                    <span>{formatEventDateTime(selectedEvent)}</span>
                                </div>
                            </div>



                            {/* Location Section */}
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-1">Location</h3>
                                {selectedEvent?.location ? (
                                    <ul className="text-sm text-gray-700 space-y-1">
                                        {(selectedEvent.location.venueName ||
                                            selectedEvent.location.streetAddress ||
                                            selectedEvent.location.city ||
                                            selectedEvent.location.postalCode ||
                                            selectedEvent.location.country) && (
                                                <li className="flex items-start">
                                                    <FontAwesomeIcon
                                                        icon={faMapMarkerAlt}
                                                        className="mr-2 mt-1 text-ticketmi-primary"
                                                    />
                                                    <div>
                                                        {selectedEvent.location.venueName && (
                                                            <div className="font-semibold">{selectedEvent.location.venueName}</div>
                                                        )}
                                                        <div>
                                                            {[
                                                                selectedEvent.location.streetAddress,
                                                                selectedEvent.location.city,
                                                                selectedEvent.location.postalCode,
                                                                selectedEvent.location.country,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(' ')}
                                                        </div>
                                                    </div>
                                                </li>
                                            )}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500">Location not available.</p>
                                )}
                            </div>



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
                            {selectedEvent.tags?.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedEvent.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-ticketmi-primary/10 text-ticketmi-primary px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Organizer</h3>

                                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-4">
                                        {/* Dummy Profile Image */}
                                        <img
                                            src="https://i.pravatar.cc/100?img=12" // Placeholder avatar image
                                            alt="Organizer Profile"
                                            className="w-12 h-12 rounded-full object-cover"
                                        />

                                        <div>
                                            {/* Dummy Organizer Name */}
                                            <p className="text-sm font-semibold text-gray-800">Alex Johnson</p>
                                            <p className="text-xs text-gray-500">Event Organizer</p>
                                        </div>
                                    </div>

                                    {/* Non-functional Follow Button */}
                                    <button
                                        className="px-4 py-1 text-sm font-medium text-ticketmi-primary border border-ticketmi-primary rounded-full hover:bg-ticketmi-primary hover:text-white transition"
                                        onClick={() => { }}
                                    >
                                        Follow
                                    </button>
                                </div>
                            </div>

                            {/* Refund Policy Section */}
                            {selectedEvent.eventSettings?.refundPolicy && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Refund Policy</h3>
                                    <p className="text-sm text-gray-700">
                                        {selectedEvent.eventSettings.refundPolicyText?.trim()
                                            ? selectedEvent.eventSettings.refundPolicyText
                                            : (() => {
                                                switch (selectedEvent.eventSettings.refundPolicy) {
                                                    case '1_day_before':
                                                        return 'Refunds are available up to 1 day before the event.';
                                                    case '7_days_before':
                                                        return 'Refunds are available up to 7 days before the event.';
                                                    case 'no_refund':
                                                        return 'This event does not offer refunds.';
                                                    default:
                                                        return 'Please contact the organizer for refund details.';
                                                }
                                            })()}
                                    </p>
                                </div>
                            )}
                                </div>
                            ) : (
                                // Ticket Selection View
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800">Select Tickets</h2>
                                        <button
                                            onClick={switchToDetailsView}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            ← Back to Details
                                        </button>
                                    </div>
                                    
                                    {selectedEvent.ticketTiers?.length > 0 ? (
                                        <div className="space-y-4">
                                            {selectedEvent.ticketTiers
                                                .filter(tier => tier.active && tier.public)
                                                .map((tier, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h3 className="font-semibold text-lg text-gray-800">{tier.name}</h3>
                                                            <p className="text-sm text-gray-600">{tier.description}</p>
                                                            <p className="text-lg font-bold text-green-600 mt-1">${tier.price}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleTicketQuantityChange(index, (ticketQuantities[index] || 0) - 1)}
                                                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="w-8 text-center font-medium">
                                                                {ticketQuantities[index] || 0}
                                                            </span>
                                                            <button
                                                                onClick={() => handleTicketQuantityChange(index, (ticketQuantities[index] || 0) + 1)}
                                                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-sm text-gray-500">
                                                            {tier.quantity} tickets available
                                                        </p>
                                                        <button
                                                            onClick={() => addToCart(index)}
                                                            disabled={!ticketQuantities[index]}
                                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                                                ticketQuantities[index] 
                                                                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                            }`}
                                                        >
                                                            Add to Cart
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-500 py-8">No tickets available for this event.</p>
                                    )}
                                </div>
                            )}
                        </div>




                        {/* Checkout Button sticky at bottom */}
                        <div className="p-6 border-t-2 border-gray-300 bg-white sticky bottom-0">
                            <div className="flex items-center gap-4">
                                {/* Save Button */}
                                <button
                                    className="w-12 h-12 flex items-center justify-center bg-gray-100 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
                                    onClick={() => alert("Saved for later! 💾")}
                                >
                                    <FontAwesomeIcon icon={faBookmark} className="w-5 h-5" />
                                </button>

                                {/* Checkout Button */}
                                {modalView === 'details' ? (
                                    <button
                                        className="flex-1 bg-gradient-to-r from-green-500 to-green-700 text-white py-3 px-4 rounded-lg shadow-lg hover:from-green-600 hover:to-green-800 transition text-sm font-semibold"
                                        onClick={switchToTicketView}
                                    >
                                        Grab your ticket now from just <strong>${lowestPrice.toFixed(2)}</strong>!
                                    </button>
                                ) : (
                                    <button
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 px-4 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-800 transition text-sm font-semibold"
                                        onClick={handleProceedToCart}
                                    >
                                        Proceed to Cart ({Object.values(ticketQuantities).reduce((sum, qty) => sum + qty, 0)} tickets)
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}


        </ErrorBoundary>
    );
};

export default Dashboard;
