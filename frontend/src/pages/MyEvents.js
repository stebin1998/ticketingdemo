import React, {  useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed
import logo from '../assets/TicketMiLogo-H.png';
import EventCard from '../components/EventCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMusic, faPalette, faUtensils, faRunning, faFilm, faMicrophoneAlt, faTicketAlt, faImage
} from '@fortawesome/free-solid-svg-icons';

const MyEvents = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        console.log("🔥 User from useAuth:", user); // Add this

        if (!user?.email) {
            console.log("No user email yet, waiting...");
            setLoading(false); // Stop loading if no user to fetch events for
            setEvents([]);     // Clear events as fallback
            return;
        }

        const fetchEvents = async () => {
            setLoading(true);
            try {
                console.log("Fetching events for:", user.email);
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/events?organizerEmail=${encodeURIComponent(user.email)}`);
                if (!response.ok) throw new Error('Failed to fetch events');
                const data = await response.json();

                console.log("Fetched events:", data);

                const transformedEvents = data.map(event => ({
                    id: event._id,
                    title: event.name,
                    date: event.dateTimes?.eventSlots?.[0]?.startDate || new Date().toISOString(),
                    location: `${event.location?.venueName || ''}, ${event.location?.city || ''}`,
                    price: event.ticketTiers?.[0]?.price || 0,
                    organizer: event.organizerContact?.name || 'Unknown',
                    image: event.files?.[0] || '',
                    description: event.description,
                    category: event.genre,
                }));

                setEvents(transformedEvents);
            } catch (error) {
                console.error('Error fetching events:', error);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [user]);

    const getCategoryIcon = (category) => ({
        music: faMusic,
        art: faPalette,
        food: faUtensils,
        sports: faRunning,
        film: faFilm,
        comedy: faMicrophoneAlt
    }[category?.toLowerCase()] || faTicketAlt);

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

    if (loading) return <p className="text-center py-10 text-gray-600">Loading your events...</p>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Nav */}
            <nav className="sticky top-0 bg-[#9D9CDA] shadow-md z-10">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between relative h-20">
                    <Link to="/" className="flex items-center gap-2 text-black hover:text-black z-10">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="font-medium">Go Back</span>
                    </Link>
                    <div className="absolute left-1/2 transform -translate-x-1/2">
                        <a href="/" className="flex items-center space-x-2">
                            <img src={logo} alt="Logo" className="h-12 w-auto" />
                        </a>
                    </div>
                </div>
            </nav>

            {/* Main */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-[#2D2B8F] mb-8 text-center">My Events</h1>

                {events.length === 0 ? (
                    <p className="text-center text-gray-500">You have not created any events yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {events.map(event => (
                            <EventCard
                                key={event.id}
                                event={event}
                                formatDate={formatDate}
                                getCategoryIcon={getCategoryIcon}
                                getImage={(image) =>
                                    image || (
                                        <div className="bg-gray-200 flex items-center justify-center h-full">
                                            <FontAwesomeIcon icon={faImage} size="3x" className="text-gray-400" />
                                        </div>
                                    )
                                }
                                actions={
                                    <Link
                                        to={`/edit-event/${event.id}`}
                                        className="block w-full text-center bg-[#2D2B8F] text-white px-3 py-2 rounded hover:bg-[#1a1875] transition"
                                    >
                                        Edit
                                    </Link>
                                }
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyEvents;
