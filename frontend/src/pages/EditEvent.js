import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const EditEvent = () => {
    const { id: eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [newTier, setNewTier] = useState({ name: '', price: '', quantity: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventRes] = await Promise.all([
                    fetch(`${process.env.REACT_APP_API_BASE_URL}/events/${eventId}`),

                ]);

                const [eventData] = await Promise.all([
                    eventRes.json(),

                ]);

                setEvent(eventData);

            } catch (err) {
                console.error('Error loading event or payouts:', err);
            }
        };

        fetchData();
    }, [eventId]);

    const handleGeneralChange = (e) => {
        setEvent({ ...event, [e.target.name]: e.target.value });
    };

    const formatDateTimeLocal = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const pad = (n) => String(n).padStart(2, '0');

        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const handleTierChange = (index, field, value) => {
        const updatedTiers = [...event.ticketTiers];
        updatedTiers[index][field] = field === 'price' || field === 'quantity' ? Number(value) : value;
        setEvent({ ...event, ticketTiers: updatedTiers });
    };

    const handleAddTier = () => {
        if (!newTier.name || !newTier.price || !newTier.quantity) return;
        const tierToAdd = { ...newTier, id: Date.now(), live: false };
        setEvent({ ...event, ticketTiers: [...event.ticketTiers, tierToAdd] });
        setNewTier({ name: '', price: '', quantity: '' });
    };

    const handleDeactivateTier = (index) => {
        const updatedTiers = [...event.ticketTiers];
        updatedTiers[index].active = false;
        setEvent({ ...event, ticketTiers: updatedTiers });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/events/${eventId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event),
            });

            if (!res.ok) throw new Error('Update failed');
            alert('Event updated successfully!');
        } catch (err) {
            console.error('Update error:', err);
            alert('Failed to update event');
        }
    };

    if (!event) return <p className="text-center py-4">Loading event...</p>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-semibold mb-4 text-[#2D2B8F]">Edit Event</h1>
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* General Info */}
                <div className="space-y-3">
                    <input name="title" value={event.title} onChange={handleGeneralChange} className="w-full border px-4 py-2 rounded" placeholder="Event Title" />
                    <input
                        type="datetime-local"
                        name="date"
                        value={formatDateTimeLocal(event.date)}
                        onChange={handleGeneralChange}
                        className="w-full border px-4 py-2 rounded"
                    />
                    <input name="location" value={event.location?.venueName || ''} onChange={(e) => setEvent({ ...event, location: { ...event.location, venueName: e.target.value } })} className="w-full border px-4 py-2 rounded" placeholder="Location" />
                    <textarea name="description" value={event.description} onChange={handleGeneralChange} className="w-full border px-4 py-2 rounded" placeholder="Description" />
                </div>

                {/* Visibility & Password */}
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={event.isPublic} onChange={(e) => setEvent({ ...event, isPublic: e.target.checked })} />
                        Public
                    </label>
                    {event.isPublic === false && (
                        <input type="text" value={event.password || ''} onChange={(e) => setEvent({ ...event, password: e.target.value })} className="border px-2 py-1 rounded" placeholder="Event Password" />
                    )}
                </div>

                {/* Refund Period */}
                <div>
                    <label className="block text-sm font-medium">Refund Period (days before event)</label>
                    <input type="number" value={event.refundPolicy?.daysBefore || 0} onChange={(e) => setEvent({ ...event, refundPolicy: { daysBefore: Number(e.target.value) } })} className="w-full border px-4 py-2 rounded" />
                </div>

                {/* Ticket Tiers */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">Ticket Tiers</h2>
                    {event.ticketTiers.map((tier, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 items-center mb-2">
                            <input value={tier.name} onChange={(e) => handleTierChange(index, 'name', e.target.value)} disabled={tier.live} className="border px-2 py-1 rounded" placeholder="Tier Name" />
                            <input type="number" value={tier.price} onChange={(e) => handleTierChange(index, 'price', e.target.value)} className="border px-2 py-1 rounded" />
                            <input type="number" value={tier.quantity} onChange={(e) => handleTierChange(index, 'quantity', e.target.value)} className="border px-2 py-1 rounded" />
                            {tier.live ? (
                                <button type="button" onClick={() => handleDeactivateTier(index)} className="text-sm text-red-600 underline">Deactivate</button>
                            ) : (
                                <span className="text-green-600 text-sm">Editable</span>
                            )}
                        </div>
                    ))}

                    {/* Add New Tier */}
                    <div className="grid grid-cols-4 gap-2 mt-3">
                        <input value={newTier.name} onChange={(e) => setNewTier({ ...newTier, name: e.target.value })} placeholder="New Tier Name" className="border px-2 py-1 rounded" />
                        <input type="number" value={newTier.price} onChange={(e) => setNewTier({ ...newTier, price: e.target.value })} placeholder="Price" className="border px-2 py-1 rounded" />
                        <input type="number" value={newTier.quantity} onChange={(e) => setNewTier({ ...newTier, quantity: e.target.value })} placeholder="Quantity" className="border px-2 py-1 rounded" />
                        <button type="button" onClick={handleAddTier} className="bg-[#2D2B8F] text-white px-3 py-1 rounded">Add Tier</button>
                    </div>
                </div>

                {/* Payment Deposit */}
                {/* Payment Deposit (Stub UI only) */}
                <div>
                    <label className="block mb-1 font-medium">Payout Destination (Preview Only)</label>
                    <select disabled className="w-full border px-4 py-2 rounded bg-gray-100 text-gray-500">
                        <option>Bank of America - ****1234</option>
                        <option>Chase - ****5678</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                        This section will allow you to choose where your ticket sales are deposited. Coming soon.
                    </p>
                </div>


                {/* Submit */}
                <button type="submit" className="bg-[#2D2B8F] text-white px-4 py-2 rounded">Save Changes</button>
            </form>
        </div>
    );
};

export default EditEvent;
