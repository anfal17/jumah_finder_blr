import React, { useState, useEffect } from 'react';
import { convert12to24, convert24to12 } from '../../utils/time';
import { extractCoordinatesFromUrl } from '../../utils/maps';

const MasjidAdminModal = ({ masjid, onClose, onSave }) => {
    const initialFormState = {
        name: '',
        area: '',
        city: 'Bengaluru',
        mapLink: '',
        lat: '',
        lng: '',
        shifts: [{ time: '1:30 PM', lang: 'Urdu' }],
        facilities: { ladies: false, parking: false, outsidersAllowed: true },
        verified: true
    };

    const [formData, setFormData] = useState(initialFormState);
    const [extractionStatus, setExtractionStatus] = useState('');

    useEffect(() => {
        if (masjid) {
            setFormData({ ...initialFormState, ...masjid });
        } else {
            setFormData(initialFormState);
        }
    }, [masjid]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const updateShift = (index, field, value) => {
        const newShifts = [...formData.shifts];
        newShifts[index][field] = value;
        setFormData({ ...formData, shifts: newShifts });
    };

    const updateShiftTime = (index, value) => {
        const time12 = convert24to12(value);
        updateShift(index, 'time', time12);
    };

    const addShift = () => {
        setFormData({ ...formData, shifts: [...formData.shifts, { time: '', lang: '' }] });
    };

    const removeShift = (index) => {
        const newShifts = formData.shifts.filter((_, i) => i !== index);
        setFormData({ ...formData, shifts: newShifts });
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-slate-800 mb-4">
                    {masjid ? 'Edit Masjid' : 'Add New Masjid'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">City</label>
                            <input
                                type="text"
                                required
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Area / Locality</label>
                            <input
                                type="text"
                                required
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Map Link</label>
                            <input
                                type="text"
                                value={formData.mapLink || ''}
                                placeholder="maps.google.com/..."
                                onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Verify Status</label>
                            <select
                                value={formData.verified}
                                onChange={(e) => setFormData({ ...formData, verified: e.target.value === 'true' })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                            >
                                <option value="true">Verified</option>
                                <option value="false">Unverified</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Auto-fill Location from Maps Link</label>
                        <div className="flex gap-2">
                            <input
                                placeholder="Paste Google Maps link here and press Enter..."
                                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                onKeyDown={async (e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const val = e.target.value;
                                        setExtractionStatus('Extracting...');

                                        try {
                                            const coords = await extractCoordinatesFromUrl(val);
                                            if (coords && coords.lat && coords.lng) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    lat: parseFloat(coords.lat),
                                                    lng: parseFloat(coords.lng)
                                                }));
                                                setExtractionStatus('✓ Coordinates Found');
                                                e.target.value = val;
                                                setTimeout(() => setExtractionStatus(''), 3000);
                                            } else {
                                                setExtractionStatus('❌ Extraction Failed');
                                            }
                                        } catch (err) {
                                            setExtractionStatus('❌ Error');
                                        }
                                    }
                                }}
                            />
                        </div>
                        {extractionStatus && (
                            <p className={`text-xs mt-1 font-bold ${extractionStatus.includes('✓') ? 'text-emerald-600' : extractionStatus.includes('❌') ? 'text-red-500' : 'text-blue-500'}`}>
                                {extractionStatus}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Latitude</label>
                            <input
                                type="number"
                                step="any"
                                required
                                value={formData.lat}
                                onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Longitude</label>
                            <input
                                type="number"
                                step="any"
                                required
                                value={formData.lng}
                                onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Facilities</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.facilities.ladies}
                                    onChange={(e) => setFormData({ ...formData, facilities: { ...formData.facilities, ladies: e.target.checked } })}
                                />
                                <span className="text-sm">Ladies Area</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.facilities.parking}
                                    onChange={(e) => setFormData({ ...formData, facilities: { ...formData.facilities, parking: e.target.checked } })}
                                />
                                <span className="text-sm">Parking</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.facilities.outsidersAllowed}
                                    onChange={(e) => setFormData({ ...formData, facilities: { ...formData.facilities, outsidersAllowed: e.target.checked } })}
                                />
                                <span className="text-sm">Outsiders Allowed</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Shifts (Jamats)</label>
                            <button type="button" onClick={addShift} className="text-xs text-emerald-600 font-bold hover:underline">+ Add Shift</button>
                        </div>
                        <div className="space-y-2">
                            {formData.shifts.map((shift, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input
                                        type="time"
                                        value={convert12to24(shift.time)}
                                        onChange={(e) => updateShiftTime(idx, e.target.value)}
                                        className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Language (e.g. Urdu)"
                                        value={shift.lang}
                                        onChange={(e) => updateShift(idx, 'lang', e.target.value)}
                                        className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                    {formData.shifts.length > 1 && (
                                        <button type="button" onClick={() => removeShift(idx)} className="text-red-500 px-2">×</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors">Save Masjid</button>
                    </div>
                </form>
            </div>
        </div >
    );
};

export default MasjidAdminModal;
