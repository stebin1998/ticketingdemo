import React, { useState } from 'react';
import logo from '../assets/TicketMiLogo-H.png';
import FileUpload from '../components/ui/fileUpload';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Card, CardContent } from '../components/ui/card';
import TagsInput from '../components/ui/tagInput';
import { Link } from 'react-router-dom';
import { Select, SelectTrigger, SelectContent, SelectItem } from '../components/ui/select';
import { useEffect } from 'react';
import { useMemo } from 'react';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import AuthService from '../utils/authService';
import { useAuth } from '../contexts/AuthContext';

export default function CreateEventPage() {
    const navigate = useNavigate();

    // Event Details
    const [details, setDetails] = useState({
        name: '',
        description: '',
        category: '',
        tags: [],
        location: {
            eventType: '',
            venueName: '',
            streetAddress: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
        },
    });

    const [formError, setFormError] = useState('');
    const [uploadedImages, setUploadedImages] = useState([]);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const { user, profile, authenticated } = useAuth();
    console.log("🔍 useAuth state:", { user, profile, authenticated });

    useEffect(() => {
        if (user) {
          console.log("📧 Setting organizer email from user:", user);
          setOrganizer(prev => ({
            ...prev,
            email: user,
          }));
        }
      }, [user]);

    const updateDetails = (field, value) => {
        setDetails((prev) => ({ ...prev, [field]: value }));
    };

    const updateLocation = (field, value) => {
        setDetails((prev) => ({
            ...prev,
            location: {
                ...(prev.location ?? {}),
                [field]: value,
            },
        }));
    };



    // Event Slots Handlers
    const updateSlot = (index, field, value) => {
        setEventSlots((prev) => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };

    const addSlot = () => {
        setEventSlots((prev) => [
            ...prev,
            { startDate: '', startTime: '', endDate: '', endTime: '' },
        ]);
    };


    const removeSlot = (index) => {
        setEventSlots((prev) => prev.filter((_, i) => i !== index));
    };


    // Date & Time
    const [isMultiDate, setIsMultiDate] = useState(false);
    const [eventSlots, setEventSlots] = useState([
        { startDate: '', startTime: '', endDate: '', endTime: '' },
    ]);

    const [tiers, setTiers] = useState([
        {
            name: '',
            type: 'free',
            price: '',
            quantity: '',
            description: '',
            active: true,
            public: true,
        },
    ]);

    const updateTier = (index, key, value) => {
        const newTiers = [...tiers];
        newTiers[index][key] = value;
        setTiers(newTiers);
    };
    const removeTier = (indexToRemove) => {
        setTiers((prev) => prev.filter((_, i) => i !== indexToRemove));
    };

    const addTier = () => {
        setTiers([...tiers, { name: '', type: 'free', price: '', quantity: '', description: '', active: true, public: true }]);
    };

    // Discount Codes
    const [codes, setCodes] = useState([
        {
            code: '',
            tiers: [],
            maxUses: '',
            discountAmount: '',
            discountType: 'percentage',
            startDate: '',
            endDate: '',
        },
    ]);

    const addCode = () => {
        setCodes((prev) => [
            ...prev,
            {
                code: '',
                tiers: [],
                maxUses: '',
                discountAmount: '',
                discountType: 'percentage',
                startDate: '',
                endDate: '',
            },
        ]);
    };

    const updateCode = (index, field, value) => {
        const newCodes = [...codes];
        newCodes[index][field] = value;
        setCodes(newCodes);
    };

    const removeCode = (index) => {
        setCodes(codes.filter((_, i) => i !== index));
    };

    // Event Policy
    const [policy, setPolicy] = useState({
        refundPolicy: '',
        refundPolicyText: '',
        visibility: 'public',
        status: 'draft',
    });

    const updatePolicy = (field, value) => {
        setPolicy((prev) => ({ ...prev, [field]: value }));
    };




    // Organizer Contact
    const [organizer, setOrganizer] = useState({
        email: '',
        instagram: '',
        facebook: '',
        twitter: '',
      });

    // Organizer Handlers
    const updateOrganizer = (field, value) => {
        setOrganizer((prev) => ({ ...prev, [field]: value }));
    };



    const sections = useMemo(() => [
        { id: 'event-details', label: 'Create Event Details' },
        { id: 'ticket-tiers', label: 'Create Ticket' },
        { id: 'discount-codes', label: 'Provide Discount Codes' },
        { id: 'event-settings', label: 'Event Settings' },
        { id: 'organizer-contact', label: 'Organizer Contact' },
    ], []);

    const [activeSection, setActiveSection] = useState('event-details');

    useEffect(() => {
        const handleScroll = () => {
            for (let section of sections) {
                const el = document.getElementById(section.id);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top < 150 && rect.bottom > 150) {
                        setActiveSection(section.id);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [sections]);

    // Image upload state


    // Submit / Save Draft Handlers
    const handleSubmit = async (draft = false) => {
        setFormSubmitted(true);
        if (
            !details.name?.trim() ||
            !details.description?.trim() ||
            !details.category ||
            details.tags.length === 0 ||
            !details.location?.city?.trim() ||
            !details.location?.country?.trim() ||
            !details.location?.postalCode?.trim() ||
            !details.location?.state?.trim() ||
            !details.location?.streetAddress?.trim() ||
            !details.location?.venueName?.trim() ||
            !policy.refundPolicy ||
            !policy.visibility ||
            uploadedImages.length === 0

        ) {
            setFormError('Please fill out all required fields before continuing.');
            return;
        }

        setFormError('');
        try {
            // Debug log for eventSlots
            console.log('eventSlots state:', eventSlots);

            // Ensure at least one slot exists
            if (eventSlots.length === 0) {
                setEventSlots([{ startDate: '', startTime: '', endDate: '', endTime: '' }]);
                throw new Error('At least one event slot is required');
            }

            // Validate first event slot
            const firstSlot = eventSlots[0];
            if (!firstSlot.startDate || !firstSlot.startTime || !firstSlot.endDate || !firstSlot.endTime) {
                throw new Error('Please fill in all date and time fields for the event');
            }

            // Format dates to ISO strings
            const formattedSlots = eventSlots.map(slot => ({
                ...slot,
                startDate: slot.startDate ? new Date(slot.startDate).toISOString() : undefined,
                endDate: slot.endDate ? new Date(slot.endDate).toISOString() : undefined
            }));

            const payload = {
                name: details.name,
                description: details.description,
                genre: details.category,
                tags: details.tags,
                location: details.location,
                files: uploadedImages,
                dateTimes: {
                    isMultiDate,
                    eventSlots: formattedSlots
                },
                ticketTiers: tiers,
                discountCodes: codes,
                eventSettings: {
                    ...policy,
                    publishStatus: 'draft',
                },
                organizerContact: organizer,
            };



            const response = await AuthService.makeAuthenticatedRequest('http://localhost:4556/events', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to save event.' }));

                // Handle seller upgrade needed
                if (errorData.code === 'UPGRADE_TO_SELLER_NEEDED') {
                    const userChoice = window.confirm(
                        `${errorData.message}\n\nWould you like to become a seller now?`
                    );

                    if (userChoice) {
                        // Redirect to seller signup with current user's email
                        window.location.href = `/seller-signup?email=${encodeURIComponent(errorData.userInfo?.email || '')}`;
                        return;
                    }
                } else {
                    throw new Error(errorData.error || errorData.message || 'Failed to save event.');
                }
                return; // Don't show success message if we're handling upgrade
            }



            const createdEvent = await response.json();


            navigate(`/event-results/${createdEvent._id}`);

        } catch (error) {
            alert(error.message);
        }
    };


    return (
        <>
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





            {/* Main Form Content */}
            <div className="flex-1 space-y-6">

                <div className="min-h-screen flex justify-center items-start bg-gray-100 py-10">
                    <div className="w-64 sticky top-24 self-start">
                        <nav className="relative bg-white rounded-xl shadow-md p-6 space-y-6 text-sm font-medium">
                            {/* Vertical progress line */}
                            <div className="absolute left-3 top-6 bottom-6 w-1 bg-gray-200 rounded-full" />
                            <div className="space-y-6 relative z-10">
                                {sections.map((section, idx) => (
                                    <a
                                        key={section.id}
                                        href={`#${section.id}`}
                                        onClick={(e) => {
                                            e.preventDefault(); // prevent default jump
                                            const el = document.getElementById(section.id);
                                            if (el) {
                                                el.scrollIntoView({ behavior: 'smooth', block: 'start' }); // smooth scroll
                                                setActiveSection(section.id); // update active state immediately
                                            }
                                        }}
                                        className={`group flex items-center gap-4 transition-colors duration-300 ${activeSection === section.id ? 'text-blue-600 font-semibold' : 'text-gray-600'
                                            }`}
                                    >
                                        <div
                                            className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${activeSection === section.id ? 'bg-blue-600 border-blue-600 scale-110' : 'bg-white border-gray-400'
                                                }`}
                                        ></div>
                                        <span className="group-hover:underline">{section.label}</span>
                                    </a>
                                ))}
                            </div>
                        </nav>
                    </div>

                    <div className="w-full max-w-4xl space-y-6 p-5">
                        <h1 id="event-details" className="text-2xl font-bold">Create Event</h1>
                        <div className="flex items-center my-6">

                            <hr className="flex-grow border-gray-300" />
                        </div>
                        <Card>
                            <CardContent className="grid gap-6 p-6">
                                {/* Event Details */}
                                <div className="space-y-4">
                                    <h2 className="text-xl font-semibold">Event Details</h2>

                                    <div>
                                        <h3 className="mb-1">Name<span className="text-red-500">*</span></h3>
                                        <Input
                                            placeholder="Give Name"
                                            value={details.name}
                                            onChange={(e) => updateDetails('name', e.target.value)}
                                            className={formSubmitted && !details.name.trim() ? 'border-red-500' : 'border-gray-300'}
                                        />
                                        {formSubmitted && !details.name.trim() && (
                                            <p className="text-sm text-red-500 mt-1">Name is required.</p>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="mb-1">Description<span className="text-red-500">*</span></h3>
                                        <Textarea
                                            value={details.description}
                                            onChange={(e) => updateDetails('description', e.target.value)}
                                            error={formSubmitted && !details.description.trim()}
                                        />
                                        {formSubmitted && !details.description.trim() && (
                                            <p className="text-sm text-red-500 mt-1">Description is required.</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="mb-1">Genre / Category<span className="text-red-500">*</span></h3>
                                            <Select onChange={(value) => updateDetails('category', value)} error={formSubmitted && !details.category}>
                                                <SelectTrigger />
                                                <SelectContent>
                                                    <SelectItem value="concert">Concert</SelectItem>
                                                    <SelectItem value="workshop">Workshop</SelectItem>
                                                    <SelectItem value="conference">Conference</SelectItem>
                                                    <SelectItem value="sports">Sports</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <TagsInput
                                                tags={details.tags}
                                                onChange={(tags) => updateDetails('tags', tags)}
                                                error={formSubmitted && details.tags.length === 0}
                                            />
                                        </div>
                                    </div>

                                    {/* Location Moved Here */}
                                    <div>
                                        <h3 className="mb-1">Location</h3>
                                        <div className="grid grid-cols-2 gap-6 border p-4 rounded-lg">

                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="font-semibold mb-1">Event Type<span className="text-red-500">*</span></h4>
                                                    <Select
                                                        value={details.location.eventType}
                                                        onChange={(value) => updateLocation('eventType', value)}
                                                        error={formSubmitted && !details.location.eventType}
                                                    >
                                                        <SelectTrigger>{details.location.eventType}</SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="physical">Physical</SelectItem>
                                                            <SelectItem value="online">Online</SelectItem>
                                                            <SelectItem value="hybrid">Hybrid</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="font-semibold mb-1">
                                                        Venue Name<span className="text-red-500">*</span>
                                                    </h4>
                                                    <Input
                                                        placeholder="Venue Name"
                                                        value={details.location.venueName}
                                                        onChange={(e) => updateLocation('venueName', e.target.value)}
                                                        error={formSubmitted && !details.location.venueName.trim()}
                                                    />
                                                    {formSubmitted && !details.location.venueName.trim() && (
                                                        <p className="text-sm text-red-500 mt-1">Venue Name is required.</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <h4 className="font-semibold mb-1">
                                                        Street Address<span className="text-red-500">*</span>
                                                    </h4>
                                                    <Input
                                                        placeholder="Street Address"
                                                        value={details.location.streetAddress}
                                                        onChange={(e) => updateLocation('streetAddress', e.target.value)}
                                                        error={formSubmitted && !details.location.streetAddress.trim()}
                                                    />
                                                    {formSubmitted && !details.location.streetAddress.trim() && (
                                                        <p className="text-sm text-red-500 mt-1">Street Address is required.</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <h4 className="font-semibold mb-1">
                                                        City<span className="text-red-500">*</span>
                                                    </h4>
                                                    <Input
                                                        placeholder="City"
                                                        value={details.location.city}
                                                        onChange={(e) => updateLocation('city', e.target.value)}
                                                        error={formSubmitted && !details.location.city.trim()}
                                                    />
                                                    {formSubmitted && !details.location.city.trim() && (
                                                        <p className="text-sm text-red-500 mt-1">City is required.</p>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="font-semibold mb-1">
                                                            State/Province<span className="text-red-500">*</span>
                                                        </h4>
                                                        <Input
                                                            placeholder="State/Province"
                                                            value={details.location.state}
                                                            onChange={(e) => updateLocation('state', e.target.value)}
                                                            error={formSubmitted && !details.location.state.trim()}
                                                        />
                                                        {formSubmitted && !details.location.state.trim() && (
                                                            <p className="text-sm text-red-500 mt-1">State is required.</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold mb-1">
                                                            Postal Code<span className="text-red-500">*</span>
                                                        </h4>
                                                        <Input
                                                            placeholder="Postal Code"
                                                            value={details.location.postalCode}
                                                            onChange={(e) => updateLocation('postalCode', e.target.value)}
                                                            error={formSubmitted && !details.location.postalCode.trim()}
                                                        />
                                                        {formSubmitted && !details.location.postalCode.trim() && (
                                                            <p className="text-sm text-red-500 mt-1">Postal Code is required.</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-semibold mb-1">
                                                        Country<span className="text-red-500">*</span>
                                                    </h4>
                                                    <Input
                                                        placeholder="Country"
                                                        value={details.location.country}
                                                        onChange={(e) => updateLocation('country', e.target.value)}
                                                        error={formSubmitted && !details.location.country.trim()}
                                                    />
                                                    {formSubmitted && !details.location.country.trim() && (
                                                        <p className="text-sm text-red-500 mt-1">Country is required.</p>
                                                    )}
                                                </div>

                                            </div>
                                        </div>
                                    </div>

                                    <FileUpload
                                        onUpload={(url) => setUploadedImages([url])}
                                        hasError={uploadedImages.length === 0 && formSubmitted}
                                    />
                                </div>

                                {/* Date & Time */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold">Event Date & Time</h2>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm ">Multiple Event Dates</span>
                                            <Switch
                                                checked={isMultiDate}
                                                onCheckedChange={setIsMultiDate}
                                                label="Multiple Dates / Slots"
                                            />
                                        </div>
                                    </div>

                                    {isMultiDate ? (
                                        <div className="space-y-4">
                                            {eventSlots.map((slot, index) => (
                                                <div
                                                    key={index}
                                                    className="grid grid-cols-2 gap-6 border p-4 rounded-lg relative"
                                                >
                                                    <div className="flex flex-col gap-2">
                                                        <h4 className="text-sm font-medium">Start Date<span className="text-red-500">*</span></h4>
                                                        <Input
                                                            type="date"
                                                            value={slot.startDate}
                                                            onChange={(e) => updateSlot(index, "startDate", e.target.value)}
                                                        />
                                                        <Input
                                                            type="time"
                                                            value={slot.startTime}
                                                            onChange={(e) => updateSlot(index, "startTime", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <h4 className="text-sm font-medium">End Date<span className="text-red-500">*</span></h4>
                                                        <Input
                                                            type="date"
                                                            value={slot.endDate}
                                                            onChange={(e) => updateSlot(index, "endDate", e.target.value)}
                                                        />
                                                        <Input
                                                            type="time"
                                                            value={slot.endTime}
                                                            onChange={(e) => updateSlot(index, "endTime", e.target.value)}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSlot(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={addSlot}
                                                className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                                            >
                                                + Add Another Date & Time
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="flex flex-col">
                                                <h3 className="mb-1">Date</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="text-sm text-gray-500 mb-1">Start<span className="text-red-500">*</span></h4>
                                                        <Input
                                                            type="date"
                                                            placeholder="Start Date"
                                                            value={eventSlots[0]?.startDate || ''}
                                                            onChange={e => updateSlot(0, 'startDate', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm text-gray-500 mb-1">End<span className="text-red-500">*</span></h4>
                                                        <Input
                                                            type="date"
                                                            placeholder="End Date"
                                                            value={eventSlots[0]?.endDate || ''}
                                                            onChange={e => updateSlot(0, 'endDate', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="mb-1">Time</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="text-sm text-gray-500 mb-1">Start<span className="text-red-500">*</span></h4>
                                                        <Input
                                                            type="time"
                                                            placeholder="Start Time"
                                                            value={eventSlots[0]?.startTime || ''}
                                                            onChange={e => updateSlot(0, 'startTime', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm text-gray-500 mb-1">End<span className="text-red-500">*</span></h4>
                                                        <Input
                                                            type="time"
                                                            placeholder="End Time"
                                                            value={eventSlots[0]?.endTime || ''}
                                                            onChange={e => updateSlot(0, 'endTime', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>

                        </Card>


                        <h1 id="ticket-tiers" className="text-2xl font-bold">Create Ticket</h1>
                        <div className="flex items-center my-6">

                            <hr className="flex-grow border-gray-300" />
                        </div>
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <h2 className="font-semibold text-xl">Ticket Tiers<span className="text-red-500">*</span></h2>

                                {tiers.map((tier, index) => (
                                    <div key={index} className="grid grid-cols-2 gap-4 border p-4 rounded-xl">
                                        <Input
                                            placeholder="Tier Name"
                                            value={tier.name}
                                            onChange={(e) => updateTier(index, 'name', e.target.value)}
                                        />

                                        {/* Ticket Type Dropdown */}
                                        <Select
                                            value={tier.type}
                                            onChange={(value) => updateTier(index, 'type', value)}
                                        >
                                            <SelectTrigger>
                                                {tier.type ? (
                                                    tier.type === 'free' ? 'Free' :
                                                        tier.type === 'paid' ? 'Paid' :
                                                            tier.type === 'donation' ? 'Donation' : 'Ticket Type'
                                                ) : 'Ticket Type'}
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="free">Free</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                                <SelectItem value="donation">Donation</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Input
                                            placeholder="Price"
                                            type="number"
                                            value={tier.price}
                                            onChange={(e) => updateTier(index, 'price', e.target.value)}
                                        />

                                        <Input
                                            placeholder="Quantity"
                                            type="number"
                                            value={tier.quantity}
                                            onChange={(e) => updateTier(index, 'quantity', e.target.value)}
                                        />

                                        <Textarea
                                            placeholder="Description"
                                            value={tier.description}
                                            onChange={(e) => updateTier(index, 'description', e.target.value)}
                                        />

                                        <div className="flex items-center justify-between col-span-2">
                                            <div className="flex items-center gap-6">
                                                {/* Active Switch */}
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={tier.active}
                                                        onCheckedChange={(value) => updateTier(index, 'active', value)}
                                                    />
                                                    <span>Active</span>
                                                </div>

                                                {/* Public/Private Switch */}
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={tier.public}
                                                        onCheckedChange={(value) => updateTier(index, 'public', value)}
                                                    />
                                                    <span>{tier.public ? 'Public' : 'Private'}</span>
                                                </div>
                                            </div>

                                            {/* Trash Button */}
                                            {tiers.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTier(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                        className="h-5 w-5"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M9 3a1 1 0 00-1 1v1H5a1 1 0 000 2h14a1 1 0 100-2h-3V4a1 1 0 00-1-1H9zM6 8a1 1 0 011 1v10a2 2 0 002 2h6a2 2 0 002-2V9a1 1 0 112 0v10a4 4 0 01-4 4H9a4 4 0 01-4-4V9a1 1 0 011-1z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Add Tier Button */}
                                <Button onClick={addTier}>Add Tier</Button>

                                {/* Total Quantity Display */}
                                <div className="text-right font-medium text-gray-700">
                                    Total Tickets: {tiers.reduce((total, tier) => total + Number(tier.quantity || 0), 0)}
                                </div>
                            </CardContent>
                        </Card>


                        <h1 id="discount-codes" className="text-2xl font-bold">Ticket and Code Information</h1>
                        <div className="flex items-center my-6">

                            <hr className="flex-grow border-gray-300" />
                        </div>

                        <Card>
                            <CardContent className="grid gap-8 p-6">
                                <h2 className="font-semibold text-2xl">Discount Codes</h2>

                                {codes.map((code, index) => (
                                    <div key={index} className="relative border rounded-xl p-6 bg-white space-y-6 shadow-sm">
                                        {/* Remove button */}
                                        {codes.length > 1 && (
                                            <button
                                                onClick={() => removeCode(index)}
                                                className="absolute top-3 right-3 text-red-500 hover:text-red-600"
                                                title="Remove Code"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 11-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        )}

                                        {/* Code name */}
                                        <Input
                                            placeholder="Discount Code (e.g., KOTHUFESTSALE)"
                                            value={code.code}
                                            onChange={(e) => updateCode(index, 'code', e.target.value)}
                                        />

                                        {/* Ticket tier checkboxes */}
                                        <div>
                                            <label className="block font-medium text-sm text-gray-700 mb-2">
                                                Apply to Ticket Tiers:
                                            </label>

                                            {tiers.filter(tier => tier.name.trim() !== '').length === 0 ? (
                                                <p className="text-sm text-gray-500 italic">No tickets have been created</p>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {tiers
                                                        .filter(tier => tier.name.trim() !== '')
                                                        .map((tier, tIndex) => {
                                                            const isSelected = code.tiers?.includes(tier.name);

                                                            return (
                                                                <button
                                                                    key={tIndex}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const updatedTiers = isSelected
                                                                            ? code.tiers.filter(t => t !== tier.name)
                                                                            : [...(code.tiers || []), tier.name];
                                                                        updateCode(index, 'tiers', updatedTiers);
                                                                    }}
                                                                    className={`px-4 py-2 rounded-xl border text-sm transition-all duration-200
                                                                    ${isSelected
                                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                                            : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'}
                                                                    `}
                                                                >
                                                                    {tier.name}
                                                                </button>
                                                            );
                                                        })}
                                                </div>
                                            )}
                                        </div>




                                        {/* Uses and discount */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Input
                                                type="number"
                                                placeholder="Max Uses"
                                                value={code.maxUses}
                                                onChange={(e) => updateCode(index, 'maxUses', e.target.value)}
                                            />

                                            <div className="flex gap-2 items-center">
                                                <Input
                                                    type="number"
                                                    placeholder="Discount Amount"
                                                    value={code.discountAmount}
                                                    onChange={(e) => updateCode(index, 'discountAmount', e.target.value)}
                                                />
                                                <select
                                                    className="border rounded px-2 py-1 text-sm"
                                                    value={code.discountType}
                                                    onChange={(e) => updateCode(index, 'discountType', e.target.value)}
                                                >
                                                    <option value="percentage">%</option>
                                                    <option value="fixed">$</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Start/end dates */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Input
                                                type="date"
                                                value={code.startDate}
                                                onChange={(e) => updateCode(index, 'startDate', e.target.value)}
                                            />
                                            <Input
                                                type="date"
                                                value={code.endDate}
                                                onChange={(e) => updateCode(index, 'endDate', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}

                                {/* Add code button */}
                                <div className="text-right">
                                    <Button variant="outline" onClick={addCode}>
                                        + Add Another Discount Code
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <h1 id="event-settings" className="text-2xl font-bold">Event Policy</h1>
                        <div className="flex items-center my-6">

                            <hr className="flex-grow border-gray-300" />
                        </div>

                        <Card>
                            <CardContent className="grid gap-4 p-6">
                                <h2 className="font-semibold text-xl">Event Settings</h2>
                                <h3 className="mb-1">Refund Policy<span className="text-red-500">*</span></h3>
                                <Select
                                    value={policy.refundPolicy}
                                    onChange={(value) => updatePolicy('refundPolicy', value)}
                                >
                                    <SelectTrigger>{policy.refundPolicy || 'Refund Policy'}</SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1_day_before">Refund available until 1 day before event</SelectItem>
                                        <SelectItem value="2_day_before">Refund available until 2 days before event</SelectItem>
                                        <SelectItem value="14_day_before">Refund available until 14 days before event</SelectItem>
                                        <SelectItem value="30_day_before">Refund available until 30 days before event</SelectItem>
                                        <SelectItem value="no_refund">No Refund at anytime</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Textarea
                                    placeholder="Refund Policy (optional)"
                                    value={policy.refundDetails}
                                    onChange={(e) => updatePolicy('refundDetails', e.target.value)}
                                />

                                <Select>
                                    <h3 className="mb-1">Listing Visibility<span className="text-red-500">*</span></h3>
                                    <SelectTrigger>Visibility</SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Public </SelectItem>
                                        <SelectItem value="private">Private</SelectItem>
                                    </SelectContent>
                                </Select>


                            </CardContent>
                        </Card>
                        <h1 id="organizer-contact" className="text-2xl font-bold">Organizer Contact</h1>
                        <div className="flex items-center my-6">

                            <hr className="flex-grow border-gray-300" />
                        </div>

                        <Card>
                            <CardContent className="grid gap-4 p-6">
                                <h2 className="font-semibold text-xl">Email Contact</h2>
                                <Input
                                    type="email"
                                    placeholder="Public Contact Email"
                                    value={organizer.email || ''}
                                    readOnly
                                    className="cursor-not-allowed opacity-70"
                                />
                                <h2 className="font-semibold text-xl">Social Media Handles</h2>
                                <Input
                                    placeholder="Instagram"
                                    value={organizer.instagram}
                                    onChange={(e) => updateOrganizer('instagram', e.target.value)}
                                />
                                <Input
                                    placeholder="Facebook"
                                    value={organizer.facebook}
                                    onChange={(e) => updateOrganizer('facebook', e.target.value)}
                                />
                                <Input
                                    placeholder="Twitter"
                                    value={organizer.twitter}
                                    onChange={(e) => updateOrganizer('twitter', e.target.value)}
                                />
                                <h2 className="font-semibold text-xl">Phone Contact</h2>
                                <Input type="number" placeholder="Phone Number" />
                            </CardContent>
                        </Card>
                        {formError && (
                            <p className="text-red-500 text-sm mb-2">{formError}</p>
                        )}
                        <div className='flex space-x-4 '>

                            <Button onClick={() => handleSubmit(false)}>Review</Button>
                        </div>

                    </div>
                </div>
            </div>


            <Footer />

        </>
    );
}
