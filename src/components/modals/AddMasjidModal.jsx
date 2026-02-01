import React, { useState } from 'react';
import api from '../../utils/api';
import { convert12to24, convert24to12 } from '../../utils/time';

const AddMasjidModal = ({ onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        area: '',
        city: 'Bengaluru',
        googleMapsLink: '',
        shifts: [{ time: '', lang: '' }], // Start with one empty shift
        facilities: {
            ladies: false,
            parking: false
        },
        notes: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAddShift = () => {
        if (formData.shifts.length < 5) {
            setFormData({
                ...formData,
                shifts: [...formData.shifts, { time: '', lang: '' }]
            });
        }
    };

    const handleRemoveShift = (index) => {
        const newShifts = formData.shifts.filter((_, i) => i !== index);
        setFormData({ ...formData, shifts: newShifts });
    };

    const handleShiftChange = (index, field, value) => {
        const newShifts = [...formData.shifts];
        newShifts[index][field] = value;
        setFormData({ ...formData, shifts: newShifts });
    };

    const handleShiftTimeChange = (index, value) => {
        const time12 = convert24to12(value);
        handleShiftChange(index, 'time', time12);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Filter out empty shifts
            const validShifts = formData.shifts.filter(s => s.time.trim() !== '');
            if (validShifts.length === 0) {
                alert('Please add at least one jamat time.');
                setLoading(false);
                return;
            }

            // Transform data to match backend Request model
            const requestPayload = {
                name: formData.name,
                area: formData.area,
                city: formData.city,
                mapLink: formData.googleMapsLink,
                lat: 0, // Will be updated by admin
                lng: 0,
                shifts: validShifts,
                facilities: formData.facilities,
                submitterEmail: '', // Optional
                adminNote: `Notes: ${formData.notes}`
            };

            await api.post('/requests', requestPayload);
            setSubmitted(true);
        } catch (error) {
            alert('Failed to submit request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4" onClick={onClose}>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center" onClick={(e) => e.stopPropagation()} style={{ animation: 'modalSlideUp 0.3s ease-out' }}>
                    <div className="text-6xl mb-4">🕌</div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Request Submitted!</h3>
                    <p className="text-slate-600 mb-6">JazakAllah Khair! We'll verify and add the masjid shortly.</p>
                    <button onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-colors">Done</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} style={{ animation: 'modalSlideUp 0.3s ease-out' }}>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-5">
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">➕</span>
                        <div>
                            <h3 className="text-white font-bold text-xl">Add New Masjid</h3>
                            <p className="text-emerald-100 text-sm mt-1">Help the community find Jummah</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Masjid Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        />
                    </div>
                    <div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">City *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                />
                            </div>
                            <div className="flex-[2]">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Area / Locality *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Koramangala"
                                    value={formData.area}
                                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Jummah Shifts</label>
                            <button type="button" onClick={handleAddShift} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                                + Add Shift
                            </button>
                        </div>
                        <div className="space-y-3">
                            {formData.shifts.map((shift, index) => (
                                <div key={index} className="flex gap-2">
                                    <div className="flex-1">
                                        <input
                                            type="time"
                                            value={convert12to24(shift.time)}
                                            onChange={(e) => handleShiftTimeChange(index, e.target.value)}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                            required={index === 0}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder="Language (Opt)"
                                            value={shift.lang}
                                            onChange={(e) => handleShiftChange(index, 'lang', e.target.value)}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                        />
                                    </div>
                                    {formData.shifts.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveShift(index)}
                                            className="w-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Google Maps Link</label>
                        <input
                            type="text"
                            placeholder="Share location link"
                            value={formData.googleMapsLink}
                            onChange={(e) => setFormData({ ...formData, googleMapsLink: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Facilities</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.facilities.ladies}
                                    onChange={(e) => setFormData({ ...formData, facilities: { ...formData.facilities, ladies: e.target.checked } })}
                                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                                />
                                <span className="text-sm font-medium text-slate-700">Ladies Area</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.facilities.parking}
                                    onChange={(e) => setFormData({ ...formData, facilities: { ...formData.facilities, parking: e.target.checked } })}
                                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                                />
                                <span className="text-sm font-medium text-slate-700">Parking</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-70">
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMasjidModal;
