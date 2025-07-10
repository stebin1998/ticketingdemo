import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faRefresh, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import AuthService from '../utils/authService';

const InvitationManager = ({ event, onTokenRegenerated }) => {
    const [showToken, setShowToken] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const baseUrl = window.location.origin;
    const invitationUrl = event.invitationToken 
        ? `${baseUrl}/invite/${event.invitationToken}`
        : null;

    const copyToClipboard = async () => {
        if (!invitationUrl) return;
        
        try {
            await navigator.clipboard.writeText(invitationUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const regenerateToken = async () => {
        if (!event._id) return;
        
        setIsRegenerating(true);
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
                onTokenRegenerated(result.invitationToken);
            } else {
                const error = await response.json();
                alert(`Failed to regenerate token: ${error.error}`);
            }
        } catch (error) {
            console.error('Error regenerating token:', error);
            alert('Failed to regenerate invitation token');
        } finally {
            setIsRegenerating(false);
        }
    };

    if (!event.eventSettings || event.eventSettings.visibility !== 'private') {
        return null;
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faEye} className="text-blue-600" />
                Private Event Invitation
            </h3>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Invitation Link
                    </label>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                            <input
                                type={showToken ? 'text' : 'password'}
                                value={invitationUrl || 'No invitation token generated'}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                            />
                            <button
                                onClick={() => setShowToken(!showToken)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                <FontAwesomeIcon icon={showToken ? faEyeSlash : faEye} />
                            </button>
                        </div>
                        <button
                            onClick={copyToClipboard}
                            disabled={!invitationUrl}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            <FontAwesomeIcon icon={faCopy} />
                        </button>
                    </div>
                    {copySuccess && (
                        <p className="text-green-600 text-sm mt-1">Link copied to clipboard!</p>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={regenerateToken}
                        disabled={isRegenerating}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        <FontAwesomeIcon icon={faRefresh} className={isRegenerating ? 'animate-spin' : ''} />
                        {isRegenerating ? 'Regenerating...' : 'Regenerate Link'}
                    </button>
                    
                    <div className="text-sm text-gray-600">
                        <p>⚠️ Warning: Regenerating will invalidate the current link</p>
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Security Notes:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Only share this link with invited guests</li>
                        <li>• The link provides full access to your private event</li>
                        <li>• If compromised, regenerate the link immediately</li>
                        <li>• Public search engines cannot find private events</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default InvitationManager; 