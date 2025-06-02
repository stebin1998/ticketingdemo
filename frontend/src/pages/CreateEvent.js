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

export default function CreateEventPage() {
    const [tiers, setTiers] = useState([{ name: '', price: '', quantity: '', description: '', active: true }]);
    const [refundable, setRefundable] = useState(false);

    const addTier = () => {
        setTiers([...tiers, { name: '', price: '', quantity: '', description: '', active: true }]);
    };

    const updateTier = (index, key, value) => {
        const newTiers = [...tiers];
        newTiers[index][key] = value;
        setTiers(newTiers);
    };
    const removeTier = (indexToRemove) => {
        setTiers((prev) => prev.filter((_, i) => i !== indexToRemove));
    };

    const [codes, setCodes] = useState([
        { code: '', maxUses: '', discountAmount: '', discountType: 'percentage', startDate: '', endDate: '' },
    ]);

    const updateCode = (index, field, value) => {
        const newCodes = [...codes];
        newCodes[index][field] = value;
        setCodes(newCodes);
    };

    const addCode = () => {
        setCodes([...codes, { code: '', maxUses: '', discountAmount: '', discountType: 'percentage', startDate: '', endDate: '' }]);
    };

    const removeCode = (index) => {
        setCodes(codes.filter((_, i) => i !== index));
    };

    return (
        <>
            <nav className="shadow-md bg-[#9D9CDA] relative">
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




            <div className="min-h-screen flex justify-center items-start bg-gray-100 py-10">


                <div className="w-full max-w-4xl space-y-6 p-5">
                    <h1 className="text-2xl font-bold">Create Event</h1>
                    <div className="flex items-center my-6">

                        <hr className="flex-grow border-gray-300" />
                    </div>
                    <Card>
                        <CardContent className="grid gap-6 p-6">
                            {/* Event Details */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold">Event Details</h2>

                                <div>
                                    <h3 className="mb-1">Event Name</h3>
                                    <Input placeholder="Give Name" />
                                </div>

                                <div>
                                    <h3 className="mb-1">Event Description</h3>
                                    <Textarea placeholder="Provide a Description" />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="mb-1">Event Genre / Category</h3>
                                        <Select>
                                            <SelectTrigger>Category</SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="concert">Concert</SelectItem>
                                                <SelectItem value="workshop">Workshop</SelectItem>
                                                <SelectItem value="conference">Conference</SelectItem>
                                                <SelectItem value="sports">Sports</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <TagsInput />
                                    </div>
                                </div>

                                <FileUpload />
                            </div>

                            {/* Date & Time */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Date Section */}
                                    <div className="flex flex-col">
                                        <h3 className="mb-1">Date</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="text-sm text-gray-500 mb-1">Start</h4>
                                                <Input type="date" placeholder="Start Date" className="border rounded p-1 w-full" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm text-gray-500 mb-1">End</h4>
                                                <Input type="date" placeholder="End Date" className="border rounded p-1 w-full" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Time Section */}
                                    <div className="flex flex-col">
                                        <h3 className="mb-1">Time</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="text-sm text-gray-500 mb-1">Start</h4>
                                                <Input type="time" placeholder="Start Time" className="border rounded p-1 w-full" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm text-gray-500 mb-1">End</h4>
                                                <Input type="time" placeholder="End Time" className="border rounded p-1 w-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    <h1 className="text-2xl font-bold">Location</h1>
                    <div className="flex items-center my-6">

                        <hr className="flex-grow border-gray-300" />
                    </div>
                    <Card>
                        <CardContent className="grid grid-cols-2 gap-6 p-6">
                            {/* Event Type Selector */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-1">Event Type</h4>
                                    <Select>
                                        <SelectTrigger>Event Type</SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="physical">Physical</SelectItem>
                                            <SelectItem value="online">Online</SelectItem>
                                            <SelectItem value="hybrid">Hybrid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Venue Details */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-1">Venue Name</h4>
                                    <Input placeholder="Venue Name" />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Street Address</h4>
                                    <Input placeholder="Street Address" />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">City</h4>
                                    <Input placeholder="City" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold mb-1">State/Province</h4>
                                        <Input placeholder="State/Province" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Postal Code</h4>
                                        <Input placeholder="Postal Code" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Country</h4>
                                    <Input placeholder="Country" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <h1 className="text-2xl font-bold">Create Ticket</h1>
                    <div className="flex items-center my-6">

                        <hr className="flex-grow border-gray-300" />
                    </div>
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <h2 className="font-semibold text-xl">Ticket Tiers</h2>

                            {tiers.map((tier, index) => (
                                <div key={index} className="grid grid-cols-2 gap-4 border p-4 rounded-xl">
                                    <Input
                                        placeholder="Tier Name"
                                        value={tier.name}
                                        onChange={(e) => updateTier(index, 'name', e.target.value)}
                                    />
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
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={tier.active}
                                                onCheckedChange={(value) => updateTier(index, 'active', value)}
                                            />
                                            <span>Active</span>
                                        </div>

                                        {tiers.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeTier(index)}
                                                className="text-red-500 hover:text-red-700"
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
                                    </div>
                                </div>
                            ))}



                            <Button onClick={addTier}>Add Tier</Button>
                        </CardContent>
                    </Card>

                    <h1 className="text-2xl font-bold">Ticket and Code Information</h1>
                    <div className="flex items-center my-6">

                        <hr className="flex-grow border-gray-300" />
                    </div>

                    <Card>
                        <CardContent className="grid gap-6 p-6">
                            <h2 className="font-semibold text-xl">Access & Discount Codes</h2>

                            {codes.map((code, index) => (
                                <div key={index} className="border rounded-xl p-4 space-y-4 relative">
                                    {codes.length > 1 && (
                                        <button
                                            onClick={() => removeCode(index)}
                                            className="absolute top-2 right-2 text-red-500 hover:text-red-600"
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

                                    <Input
                                        placeholder="Code Name (e.g., KOTHUFESTSALE)"
                                        value={code.code}
                                        onChange={(e) => updateCode(index, 'code', e.target.value)}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            type="number"
                                            placeholder="Max Uses"
                                            value={code.maxUses}
                                            onChange={(e) => updateCode(index, 'maxUses', e.target.value)}
                                        />

                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                placeholder="Discount Amount"
                                                value={code.discountAmount}
                                                onChange={(e) => updateCode(index, 'discountAmount', e.target.value)}
                                            />
                                            <select
                                                className="border rounded p-1 text-sm"
                                                value={code.discountType}
                                                onChange={(e) => updateCode(index, 'discountType', e.target.value)}
                                            >
                                                <option value="percentage">%</option>
                                                <option value="fixed">$</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            type="date"
                                            placeholder="Start Date"
                                            value={code.startDate}
                                            onChange={(e) => updateCode(index, 'startDate', e.target.value)}
                                        />
                                        <Input
                                            type="date"
                                            placeholder="End Date (optional)"
                                            value={code.endDate}
                                            onChange={(e) => updateCode(index, 'endDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}

                            <Button variant="outline" onClick={addCode}>
                                Add Another Discount Code
                            </Button>
                        </CardContent>
                    </Card>
                    <h1 className="text-2xl font-bold">Event Policy</h1>
                    <div className="flex items-center my-6">

                        <hr className="flex-grow border-gray-300" />
                    </div>

                    <Card>
                        <CardContent className="grid gap-4 p-6">
                            <h2 className="font-semibold text-xl">Event Settings</h2>
                            <div className="flex items-center gap-2">
                                <Switch checked={refundable} onCheckedChange={setRefundable} />
                                <span>Refundable</span>
                            </div>
                            <Textarea placeholder="Refund Policy (optional)" />
                            <Select>
                                <h3 className="mb-1">Age Restriction</h3>
                                <SelectTrigger>Age Restriction</SelectTrigger>
                                <SelectContent>

                                    <SelectItem value="all">All Ages</SelectItem>
                                    <SelectItem value="18+">18+</SelectItem>
                                    <SelectItem value="21+">21+</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select>
                                <h3 className="mb-1">Event Visibility</h3>
                                <SelectTrigger>Visibility</SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">Public</SelectItem>
                                    <SelectItem value="private">Private</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select>
                                <h3 className="mb-1">Publish Status</h3>
                                <SelectTrigger>Status</SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                    <h1 className="text-2xl font-bold">Organizer Contact</h1>
                    <div className="flex items-center my-6">

                        <hr className="flex-grow border-gray-300" />
                    </div>

                    <Card>
                        <CardContent className="grid gap-4 p-6">
                            <h2 className="font-semibold text-xl">Email Contact</h2>
                            <Input type="email" placeholder="Public Contact Email" />
                            <h2 className="font-semibold text-xl">Social Media Handles</h2>
                            <Input type="instagram" placeholder="Instagram" />
                            <Input type="facebook" placeholder="Facebook" />
                            <Input type="X (Twitter)" placeholder="X (Twitter)" />
                            <h2 className="font-semibold text-xl">Phone Contact</h2>
                            <Input type="number" placeholder="Phone Number" />
                        </CardContent>
                    </Card>

                    <Button>Submit Event</Button>
                </div>
            </div>

        </>
    );
}
