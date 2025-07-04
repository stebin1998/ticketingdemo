import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EventResults = () => {
    const [showPublishConfirm, setShowPublishConfirm] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch(`http://localhost:4556/events/${eventId}`);
                const data = await res.json();
                setEvent(data);
            } catch (err) {
                console.error("Failed to load event:", err);
            }
        };
        fetchEvent();
    }, [eventId]);

    useEffect(() => {
        if (showSuccessModal || showPublishConfirm) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [showSuccessModal, showPublishConfirm]);

    if (!event) return <p className="text-center py-10 text-gray-600">Loading event details...</p>;

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleString(undefined, {
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch {
            return 'Not provided';
        }
    };

    const handlePublish = async () => {
        try {
            const response = await fetch(`http://localhost:4556/events/${event._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventSettings: {
                        ...event.eventSettings,
                        publishStatus: 'published',
                    },
                }),
            });

            if (!response.ok) throw new Error(await response.text());

            const updated = await response.json();
            setEvent(updated);
            setShowPublishConfirm(false);
            setShowSuccessModal(true);
        } catch (err) {
            console.error('Publish failed:', err);
            alert('Failed to publish event.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-10">
            <div className="w-full max-w-4xl bg-white shadow-md rounded-lg overflow-hidden">
                {event.files?.[0] ? (
                    <img
                        src={event.files[0]}
                        alt="Event banner"
                        className="w-full h-64 object-cover"
                    />
                ) : (
                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400 text-xl">
                        No banner image provided
                    </div>
                )}

                <div className="p-6 space-y-4">
                    <h1 className="text-3xl font-bold text-ticketmi-primary">{event.name || 'Untitled Event'}</h1>
                    <p className="text-gray-700">{event.description || 'No description provided.'}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <p className="font-semibold text-sm text-gray-500">Category</p>
                            <p className="text-gray-800">{event.genre || 'Not provided'}</p>
                        </div>

                        <div>
                            <p className="font-semibold text-sm text-gray-500">Organizer</p>
                            <p className="text-gray-800">{event.organizerContact?.name || 'Not provided'}</p>
                        </div>

                        <div>
                            <p className="font-semibold text-sm text-gray-500">Start Date</p>
                            <p className="text-gray-800">{formatDate(event.dateTimes?.eventSlots?.[0]?.startDate)}</p>
                        </div>

                        <div>
                            <p className="font-semibold text-sm text-gray-500">End Date</p>
                            <p className="text-gray-800">{formatDate(event.dateTimes?.eventSlots?.[0]?.endDate)}</p>
                        </div>

                        <div>
                            <p className="font-semibold text-sm text-gray-500">Location</p>
                            <p className="text-gray-800">
                                {event.location?.venueName || 'Not provided'}, {event.location?.city || ''}
                            </p>
                        </div>

                        <div>
                            <p className="font-semibold text-sm text-gray-500">Ticket Price</p>
                            <p className="text-gray-800">
                                {event.ticketTiers?.[0]?.price !== undefined ? `$${event.ticketTiers[0].price}` : 'Not provided'}
                            </p>
                        </div>

                        <div>
                            <p className="font-semibold text-sm text-gray-500">Status</p>
                            <p className="text-gray-800 capitalize">
                                {event.eventSettings?.publishStatus || 'Not provided'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mt-8">
                {event.eventSettings?.publishStatus === 'draft' ? (
                    <>
                        <button
                            onClick={handlePublish}
                            className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition"
                        >
                            Publish Event
                        </button>

                        <button
                            onClick={() => navigate('/')}
                            className="bg-gray-300 text-gray-800 px-5 py-2 rounded-full hover:bg-gray-400 transition"
                        >
                            Save as Draft
                        </button>
                    </>
                ) : (
                    <p className="text-green-700 text-lg font-semibold">✅ This event is now published!</p>
                )}
            </div>

            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center relative">
                        <div className="text-green-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-gray-800">Event Published Successfully</h2>
                        <p className="text-gray-600 mb-6">
                            Your event "<strong>{event.name}</strong>" is now live. You can go back to the dashboard or create a new event.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    navigate('/');
                                }}
                                className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition"
                            >
                                Go to Dashboard
                            </button>
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    navigate('/create-event');
                                }}
                                className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition"
                            >
                                Create Another Event
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventResults;
