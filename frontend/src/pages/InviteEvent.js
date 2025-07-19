import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarAlt, faMapMarkerAlt,
    faExclamationCircle, faHeart, faArrowUpRightFromSquare, faBookmark
} from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/TicketMiLogo-H.png';

const InviteEvent = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const MAX_LENGTH = 200;

    useEffect(() => {
        const fetchPrivateEvent = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/events/invite/${token}`);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        setError('This invitation link is invalid or has expired.');
                    } else {
                        setError('Failed to load event. Please try again.');
                    }
                    return;
                }

                const eventData = await response.json();
                setEvent(eventData);
            } catch (err) {
                setError('Failed to load event. Please check your connection and try again.');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchPrivateEvent();
        }
    }, [token]);

    const formatEventDateTime = (event) => {
        if (!event.dateTimes?.eventSlots?.[0]) return '';

        const slot = event.dateTimes.eventSlots[0];
        if (!slot.startDate || !slot.startTime) return '';

        const startDatePart = new Date(slot.startDate);
        const [startHour, startMinute] = slot.startTime.split(':').map(Number);
        const startDateTime = new Date(startDatePart);
        startDateTime.setHours(startHour, startMinute);

        // build end DateTime if available
        let endDateTime = null;
        if (slot.endDate && slot.endTime) {
            const endDatePart = new Date(slot.endDate);
            const [endHour, endMinute] = slot.endTime.split(':').map(Number);
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
    };

    const getLowestPrice = () => {
        if (!event?.ticketTiers?.length) return 0;
        
        const prices = event.ticketTiers
            .filter(tier => tier.active && tier.public)
            .map(tier => tier.price)
            .sort((a, b) => a - b);

        return prices[0] || 0;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading event...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center max-w-md mx-4">
                    <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500 text-4xl mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    if (!event) {
        return null;
    }

    const shouldTruncate = event.description?.length > MAX_LENGTH;
    const displayedDescription = event.description
        ? isExpanded || !shouldTruncate
            ? event.description
            : event.description.slice(0, MAX_LENGTH) + '...'
        : '';

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header with Logo - Matching Create Event Page */}
            <nav className="relative shadow-md bg-[#9D9CDA]">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between relative h-20">
                    {/* Left Arrow with Text */}
                    <Link to="/" className="flex items-center gap-2 text-black hover:text-black dark:text-black dark:hover:text-white z-10">
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

                    {/* Logo centered absolutely */}
                    <div className="absolute left-1/2 transform -translate-x-1/2">
                        <a href="/" className="flex items-center space-x-2">
                            <img src={logo} alt="Logo" className="h-12 w-auto" />
                        </a>
                    </div>
                </div>
            </nav>

            {/* Event Content - Matching Dashboard Modal Style */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                    {/* Banner Image */}
                    <div className="relative w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400 text-xl">
                        {event.files && event.files.length > 0 ? (
                            <img
                                src={event.files[0]}
                                alt={event.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            "No banner available"
                        )}
                        
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

                    {/* Event Content */}
                    <div className="p-6">
                        {/* Title */}
                        <h1 className="text-3xl font-extrabold text-ticketmi-primary leading-tight mb-4 break-words">
                            {event.name}
                        </h1>

                        {/* Description */}
                        {event.description && (
                            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                {displayedDescription}
                                {shouldTruncate && (
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

                        {/* Date Section */}
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Date</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-ticketmi-primary w-4 h-4" />
                                <span>{formatEventDateTime(event)}</span>
                            </div>
                        </div>

                        {/* Location Section */}
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">Location</h3>
                            {event.location ? (
                                <ul className="text-sm text-gray-700 space-y-1">
                                    {(event.location.venueName ||
                                        event.location.streetAddress ||
                                        event.location.city ||
                                        event.location.postalCode ||
                                        event.location.country) && (
                                            <li className="flex items-start">
                                                <FontAwesomeIcon
                                                    icon={faMapMarkerAlt}
                                                    className="mr-2 mt-1 text-ticketmi-primary"
                                                />
                                                <div>
                                                    {event.location.venueName && (
                                                        <div className="font-semibold">{event.location.venueName}</div>
                                                    )}
                                                    <div>
                                                        {[
                                                            event.location.streetAddress,
                                                            event.location.city,
                                                            event.location.postalCode,
                                                            event.location.country,
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
                        {event.ticketTiers?.length > 0 ? (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Ticket Price</h3>
                                <p className="text-gray-700 font-semibold">
                                    {(() => {
                                        const prices = event.ticketTiers
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

                        {/* Tags */}
                        {event.tags?.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {event.tags.map((tag, idx) => (
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

                        {/* Organizer Section */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Organizer</h3>
                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl shadow-sm">
                                <div className="flex items-center gap-4">
                                    <img
                                        src="https://i.pravatar.cc/100?img=12"
                                        alt="Organizer Profile"
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {event.organizerContact?.name || 'Event Organizer'}
                                        </p>
                                        <p className="text-xs text-gray-500">Event Organizer</p>
                                    </div>
                                </div>
                                <button className="px-4 py-1 text-sm font-medium text-ticketmi-primary border border-ticketmi-primary rounded-full hover:bg-ticketmi-primary hover:text-white transition">
                                    Follow
                                </button>
                            </div>
                        </div>

                        {/* Refund Policy Section */}
                        {event.eventSettings?.refundPolicy && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Refund Policy</h3>
                                <p className="text-sm text-gray-700">
                                    {event.eventSettings.refundPolicyText?.trim()
                                        ? event.eventSettings.refundPolicyText
                                        : (() => {
                                            switch (event.eventSettings.refundPolicy) {
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

                    {/* Action Buttons - Sticky at bottom */}
                    <div className="p-6 border-t-2 border-gray-300 bg-white">
                        <div className="flex items-center gap-4">
                            {/* Save Button */}
                            <button
                                className="w-12 h-12 flex items-center justify-center bg-gray-100 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
                                onClick={() => alert("Saved for later! 💾")}
                            >
                                <FontAwesomeIcon icon={faBookmark} className="w-5 h-5" />
                            </button>

                            {/* Buy Tickets Button */}
                            <button
                                className="flex-1 bg-gradient-to-r from-green-500 to-green-700 text-white py-3 px-4 rounded-lg shadow-lg hover:from-green-600 hover:to-green-800 transition text-sm font-semibold"
                                onClick={() => {
                                    alert("Proceeding to checkout flow 🚀");
                                    navigate(`/event-results/${event._id}`);
                                }}
                            >
                                Grab your ticket now from just <strong>${getLowestPrice().toFixed(2)}</strong>!
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InviteEvent; 