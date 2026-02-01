import React, { useState } from 'react';
import api from '../../utils/api';
import { convert12to24, convert24to12 } from '../../utils/time';

const ReportModal = ({ masjid, onClose }) => {
    const [issueType, setIssueType] = useState('incorrect_time');
    const [correctTime, setCorrectTime] = useState('');
    const [description, setDescription] = useState('');
    const [selectedShift, setSelectedShift] = useState(null); // Index of shift
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const shiftDetails = selectedShift !== null
                ? `Shift: ${masjid.shifts[selectedShift].time} (${masjid.shifts[selectedShift].lang})`
                : 'General/All Shifts';

            await api.post('/reports', {
                masjidId: masjid._id,
                masjidName: masjid.name,
                issueType,
                correctTime,
                description: `${description}\n\n[Context: ${shiftDetails}]`
            });
            setSubmitted(true);
        } catch (error) {
            alert('Failed to submit report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4" onClick={onClose}>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center" onClick={(e) => e.stopPropagation()} style={{ animation: 'modalSlideUp 0.3s ease-out' }}>
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Thank You!</h3>
                    <p className="text-slate-600 mb-6">Your report has been submitted for review.</p>
                    <button onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-colors">Done</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} style={{ animation: 'modalSlideUp 0.3s ease-out' }}>
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 px-6 py-5">
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">⚠️</span>
                        <div>
                            <h3 className="text-white font-bold text-xl">Report Issue</h3>
                            <p className="text-amber-100 text-sm mt-1">{masjid.name}</p>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Masjid Details</p>
                    <p className="text-sm text-slate-700 font-medium">{masjid.name}</p>
                    <div className="space-y-1 mb-2">
                        <p className="text-xs text-slate-500 font-medium">Click to select incorrect shift (optional):</p>
                        <div className="flex flex-wrap gap-2">
                            {masjid.shifts.map((s, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSelectedShift(selectedShift === idx ? null : idx)}
                                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${selectedShift === idx
                                        ? 'bg-amber-100 border-amber-300 text-amber-800 font-bold'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-amber-200'
                                        }`}
                                >
                                    {s.time} ({s.lang || 'General'})
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Issue Type</label>
                        <select value={issueType} onChange={(e) => setIssueType(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200">
                            <option value="incorrect_time">Incorrect Timing</option>
                            <option value="mosque_closed">Mosque Closed/Moved</option>
                            <option value="other">Other Issue</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Correct Time</label>
                        <input type="time" value={convert12to24(correctTime)} onChange={(e) => setCorrectTime(convert24to12(e.target.value))} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 font-medium placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Comments</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue..." rows={3} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 font-medium placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 resize-none" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-70">
                            {loading ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;
