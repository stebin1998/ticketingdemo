import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../utils/authService';
import loginImage from '../assets/login-image-playmi.jpg';

const UpgradeToSeller = () => {
    const navigate = useNavigate();
    const location = useLocation();

    
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        companyName: '',
        website: '',
        businessAddress: '',
        contactNumber: '',
        paymentInstitution: '',
        paymentInfo: 'Mock payment integration - for demo purposes'
    });

    const updateFormData = (field, value) => {
        // Auto-format website URL if it's a website field
        if (field === 'website' && value.trim() !== '') {
            value = formatWebsiteUrl(value);
        }
        
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Helper function to format website URL
    const formatWebsiteUrl = (url) => {
        if (!url || url.trim() === '') return '';
        
        let formattedUrl = url.trim();
        
        // If it doesn't start with http:// or https://, add https://
        if (!formattedUrl.match(/^https?:\/\//)) {
            formattedUrl = 'https://' + formattedUrl;
        }
        
        return formattedUrl;
    };

    const handleStep1Next = (e) => {
        e.preventDefault();
        if (!formData.companyName || !formData.contactNumber) {
            setError('Please fill in all required fields');
            return;
        }
        setError('');
        setCurrentStep(2);
    };

    const handleFinalUpgrade = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('🔄 Upgrading user to seller...');
            
            // Prepare form data with formatted URL
            const upgradeData = {
                ...formData,
                website: formData.website ? formatWebsiteUrl(formData.website) : ''
            };
            
            // Use AuthService directly for the upgrade
            await AuthService.upgradeToSeller(upgradeData);
            
            console.log('✅ Successfully upgraded to seller');
            
            // Get redirect URL from query params or default to create-event
            const searchParams = new URLSearchParams(location.search);
            const redirectTo = searchParams.get('redirect') || '/create-event';
            
            // Redirect to intended destination
            navigate(redirectTo);
            
        } catch (err) {
            console.error('❌ Upgrade failed:', err);
            setError('Upgrade failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const goToPreviousStep = () => {
        setCurrentStep(prev => Math.max(1, prev - 1));
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4"
            style={{
                backgroundImage: `linear-gradient(rgba(45, 43, 143, 0.1), rgba(45, 43, 143, 0.1)), url(${loginImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex overflow-hidden">
                
                {/* Left Side - Branding */}
                <div className="md:w-1/2 w-full bg-gradient-to-br from-blue-900 to-blue-950 text-white p-10 md:p-20 flex flex-col justify-center">
                    <h1 className="text-4xl font-bold mb-4">
                        Become a Seller
                    </h1>
                    <p className="text-lg mb-8 leading-relaxed">
                        Complete your business information to start creating and selling event tickets on TicketMi.
                    </p>
                    
                    {/* Progress Indicator */}
                    <div className="flex items-center space-x-4 mb-8">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            currentStep >= 1 ? 'bg-white text-blue-950' : 'bg-blue-900 text-white'
                        }`}>
                            1
                        </div>
                        <div className={`w-8 h-1 ${currentStep >= 2 ? 'bg-white' : 'bg-blue-900'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            currentStep >= 2 ? 'bg-white text-blue-950' : 'bg-blue-900 text-white'
                        }`}>
                            2
                        </div>
                    </div>
                    
                    <div className="text-center text-sm">
                        <p>Step {currentStep} of 2</p>
                        <p className="mt-2">
                            {currentStep === 1 && "Business Details"}
                            {currentStep === 2 && "Payment Setup"}
                        </p>
                    </div>
                </div>

                {/* Right Side - Form Steps */}
                <div className="md:w-1/2 w-full p-10 md:p-20 text-center flex flex-col justify-center">
                    
                    {/* Step 1: Business Information */}
                    {currentStep === 1 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">Business Information</h2>
                            
                            <form onSubmit={handleStep1Next} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Company / Organization Name"
                                    value={formData.companyName}
                                    onChange={(e) => updateFormData('companyName', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                
                                <input
                                    type="text"
                                    placeholder="Website URL"
                                    value={formData.website}
                                    onChange={(e) => updateFormData('website', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                
                                <textarea
                                    placeholder="Business Address"
                                    value={formData.businessAddress}
                                    onChange={(e) => updateFormData('businessAddress', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                                />
                                
                                <input
                                    type="tel"
                                    placeholder="Contact Number"
                                    value={formData.contactNumber}
                                    onChange={(e) => updateFormData('contactNumber', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition font-medium"
                                >
                                    Next
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Step 2: Billing Details */}
                    {currentStep === 2 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">Billing Details</h2>
                            
                            <form onSubmit={handleFinalUpgrade} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Payment Institution"
                                    value={formData.paymentInstitution}
                                    onChange={(e) => updateFormData('paymentInstitution', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                
                                <div className="bg-gray-100 p-6 rounded-lg text-center">
                                    <p className="text-gray-600 font-medium">[Payment info here]</p>
                                </div>

                                <div className="flex space-x-4">
                                    <button
                                        type="button"
                                        onClick={goToPreviousStep}
                                        className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-full hover:bg-gray-400 transition font-medium"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition font-medium disabled:opacity-50"
                                    >
                                        {loading ? 'Upgrading...' : 'Done'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Back to dashboard */}
                    <div className="mt-6 text-gray-500 text-sm">
                        <Link to="/dashboard" className="text-blue-600 font-semibold hover:underline">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UpgradeToSeller; 