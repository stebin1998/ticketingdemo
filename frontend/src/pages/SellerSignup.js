import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import backgroundImage from "../assets/login-image-playmi.jpg";

const SellerSignup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signupSellerWithInfo } = useAuth();
    
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Form data for all steps
    const [formData, setFormData] = useState({
        // Step 1: Basic Info
        email: '',
        password: '',
        
        // Step 2: Business Info
        companyName: '',
        website: '',
        businessAddress: '',
        contactNumber: '',
        
        // Step 3: Payment Info
        paymentInstitution: '',
        paymentInfo: ''
    });
    
    const [showPassword, setShowPassword] = useState(false);

    // Pre-fill email from URL parameters and handle redirect
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const emailParam = urlParams.get('email');
        
        if (emailParam) {
            setFormData(prev => ({
                ...prev,
                email: emailParam
            }));
        }
    }, [location.search]);

    // Update form data
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

    // Step 1: Basic Information
    const handleStep1Next = (e) => {
        e.preventDefault();
        
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }
        
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        
        setError('');
        setCurrentStep(2);
    };

    // Step 2: Business Information
    const handleStep2Next = (e) => {
        e.preventDefault();
        
        if (!formData.companyName || !formData.contactNumber) {
            setError('Company name and contact number are required');
            return;
        }
        
        setError('');
        setCurrentStep(3);
    };

    // Step 3: Final Signup
    const handleFinalSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            // Prepare seller info with formatted URL
            const sellerInfo = {
                companyName: formData.companyName,
                website: formData.website ? formatWebsiteUrl(formData.website) : '',
                businessAddress: formData.businessAddress,
                contactNumber: formData.contactNumber,
                paymentInstitution: formData.paymentInstitution,
                paymentInfo: 'Mock payment integration - for demo purposes'
            };

            // Create seller account with all business information
            await signupSellerWithInfo(formData.email, formData.password, sellerInfo);
            
            console.log('✅ Seller signup successful with business info!');
            
            // Check if there's a redirect URL from the upgrade prompt
            const urlParams = new URLSearchParams(location.search);
            const redirectParam = urlParams.get('redirect');
            
            if (redirectParam) {
                navigate(redirectParam); // Redirect to the page they were trying to access
            } else {
                navigate('/dashboard'); // Default redirect to dashboard
            }
            
        } catch (error) {
            console.error('❌ Seller signup failed:', error);
            setError('Signup failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Go back to previous step
    const goToPreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setError('');
        }
    };

    return (
        <div
            className="flex items-center justify-center min-h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="flex flex-col md:flex-row border-[10px] border-white rounded-3xl w-full max-w-6xl min-h-[600px] bg-white shadow-2xl">
                
                {/* Left Side - Progress & Welcome */}
                <div className="md:w-1/2 w-full bg-blue-950 text-white rounded-t-3xl md:rounded-tr-none md:rounded-l-3xl flex flex-col justify-center items-center p-10">
                    <h2 className="text-3xl font-extrabold mb-4 text-center">Become a Seller</h2>
                    <p className="text-lg text-blue-100 text-center mb-8">
                        Join our platform and start selling tickets for your events
                    </p>
                    
                    {/* Progress Indicator */}
                    <div className="flex items-center space-x-4 mb-8">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            currentStep >= 1 ? 'bg-white text-blue-950' : 'bg-blue-800 text-white'
                        }`}>
                            1
                        </div>
                        <div className={`w-8 h-1 ${currentStep >= 2 ? 'bg-white' : 'bg-blue-800'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            currentStep >= 2 ? 'bg-white text-blue-950' : 'bg-blue-800 text-white'
                        }`}>
                            2
                        </div>
                        <div className={`w-8 h-1 ${currentStep >= 3 ? 'bg-white' : 'bg-blue-800'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            currentStep >= 3 ? 'bg-white text-blue-950' : 'bg-blue-800 text-white'
                        }`}>
                            3
                        </div>
                    </div>
                    
                    <div className="text-center text-sm">
                        <p>Step {currentStep} of 3</p>
                        <p className="mt-2">
                            {currentStep === 1 && "Basic Information"}
                            {currentStep === 2 && "Business Details"}
                            {currentStep === 3 && "Payment Setup"}
                        </p>
                    </div>
                </div>

                {/* Right Side - Form Steps */}
                <div className="md:w-1/2 w-full p-10 md:p-20 text-center flex flex-col justify-center">
                    
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-gray-800">Sign Up</h2>
                            
                            <form onSubmit={handleStep1Next} className="space-y-4">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={(e) => updateFormData('email', e.target.value)}
                                    className="w-full px-4 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={(e) => updateFormData('password', e.target.value)}
                                        className="w-full px-4 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3.5 text-blue-600 font-semibold"
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition font-medium"
                                >
                                    Next
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Step 2: Business Information */}
                    {currentStep === 2 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">Seller Account Information</h2>
                            
                            <form onSubmit={handleStep2Next} className="space-y-4">
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
                                        className="flex-1 bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition font-medium"
                                    >
                                        Next
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 3: Billing Details */}
                    {currentStep === 3 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">Billing Details</h2>
                            
                            <form onSubmit={handleFinalSignup} className="space-y-4">
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
                                        {loading ? 'Creating Account...' : 'Signup'}
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

                    {/* Back to regular signup */}
                    <div className="mt-6 text-gray-500 text-sm">
                        Want a regular account instead?{" "}
                        <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
                            Sign up as user
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SellerSignup; 