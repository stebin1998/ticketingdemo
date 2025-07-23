import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthService from '../utils/authService';

const EventResults = () => {
    const [showPublishConfirm, setShowPublishConfirm] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);

    const handleTokenRegenerated = (newToken) => {
        setEvent(prev => ({
            ...prev,
            invitationToken: newToken
        }));
    };

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                // Get auth token from AuthService for private event access
                let headers = {};
                
                try {
                    const token = await AuthService.getAuthToken();
                    headers['Authorization'] = `Bearer ${token}`;
                } catch (authError) {
                    console.log('No authentication token available, proceeding without auth');
                }
                
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/events/${eventId}`, {
                    headers
                });
                
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                
                const data = await res.json();
                setEvent(data);
            } catch (err) {
                console.error("Failed to load event:", err);
                // Show error message to user
                alert(`Failed to load event: ${err.message}`);
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
            let headers = { 'Content-Type': 'application/json' };
            
            try {
                const token = await AuthService.getAuthToken();
                headers['Authorization'] = `Bearer ${token}`;
            } catch (authError) {
                console.log('No authentication token available for publish');
            }
            
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/events/${event._id}`, {
                method: 'PATCH',
                headers,
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
                        
                        <div>
                            <p className="font-semibold text-sm text-gray-500">Visibility</p>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    event.eventSettings?.visibility === 'private' 
                                        ? 'bg-red-100 text-red-800' 
                                        : 'bg-green-100 text-green-800'
                                }`}>
                                    {event.eventSettings?.visibility === 'private' ? '🔒 Private' : '🌐 Public'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Combined Private Event Success Banner with Invitation Manager */}
            {event.eventSettings?.visibility === 'private' && event.invitationToken && (
                <div className="w-full max-w-4xl mt-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-600 text-white p-2 rounded-full">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-blue-900">Private Event Created Successfully!</h3>
                                <p className="text-blue-700">Your event is now private and can only be accessed via invitation link.</p>
                            </div>
                        </div>
                        
                        <div className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Invitation Link
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={`${window.location.origin}/invite/${event.invitationToken}`}
                                    readOnly
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/invite/${event.invitationToken}`);
                                        alert('Invitation link copied to clipboard!');
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                                >
                                    Copy Link
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                            <h4 className="font-medium text-yellow-800 mb-2">📋 Next Steps:</h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>• Copy the invitation link above</li>
                                <li>• Share it with your invited guests</li>
                                <li>• Only people with this link can access your event</li>
                                <li>• You can manage the link using the tools below</li>
                            </ul>
                        </div>
                        
                        {/* Integrated Invitation Manager */}
                        <div className="bg-white border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Manage Invitation Link
                            </h4>
                            
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={async () => {
                                        if (!event._id) return;
                                        
                                        try {
                                            const token = await AuthService.getAuthToken();
                                            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/events/${event._id}/regenerate-invitation`, {
                                                method: 'POST',
                                                headers: {
                                                    'Authorization': `Bearer ${token}`,
                                                    'Content-Type': 'application/json'
                                                }
                                            });

                                            if (response.ok) {
                                                const result = await response.json();
                                                handleTokenRegenerated(result.invitationToken);
                                                alert('Invitation link regenerated successfully!');
                                            } else {
                                                const error = await response.json();
                                                alert(`Failed to regenerate token: ${error.error}`);
                                            }
                                        } catch (error) {
                                            console.error('Error regenerating token:', error);
                                            alert('Failed to regenerate invitation token');
                                        }
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Regenerate Link
                                </button>
                                
                                <div className="text-sm text-gray-600">
                                    <p>⚠️ Warning: Regenerating will invalidate the current link</p>
                                </div>
                            </div>
                            
                            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                <h5 className="font-medium text-yellow-800 mb-2">Security Notes:</h5>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                    <li>• Only share this link with invited guests</li>
                                    <li>• The link provides full access to your private event</li>
                                    <li>• If compromised, regenerate the link immediately</li>
                                    <li>• Public search engines cannot find private events</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                        <h2 className="text-2xl font-bold mb-2 text-gray-800">
                            {event.eventSettings?.visibility === 'private' ? 'Private Event Created Successfully!' : 'Event Published Successfully'}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {event.eventSettings?.visibility === 'private' 
                                ? `Your private event "<strong>${event.name}</strong>" has been created. Share the invitation link with your guests to give them access.`
                                : `Your event "<strong>${event.name}</strong>" is now live. You can go back to the dashboard or create a new event.`
                            }
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
