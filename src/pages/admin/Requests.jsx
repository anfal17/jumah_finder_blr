import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { convert12to24, convert24to12 } from '../../utils/time';
import { extractCoordinatesFromUrl } from '../../utils/maps';

const Requests = () => {
    const [requests, setRequests] = useState([]);
    const [allRequests, setAllRequests] = useState([]); // Store original for filtering
    const [loading, setLoading] = useState(true);
    const [viewingRequest, setViewingRequest] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [rejectNote, setRejectNote] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [extractionStatus, setExtractionStatus] = useState('');

    // Filters
    const [selectedCity, setSelectedCity] = useState('All');
    const [selectedArea, setSelectedArea] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data } = await api.get('/requests');
            setRequests(data);
            setAllRequests(data);
        } catch (error) {
            console.error('Error fetching requests', error);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (request) => {
        setViewingRequest(request);
        setEditMode(false);
        setShowRejectModal(false);
        setExtractionStatus('');
    };

    const handleApprove = async () => {
        if (!window.confirm('Approve this request and create a new Masjid?')) return;

        try {
            // Include edited details if in edit mode, otherwise use original request
            if (editMode) {
                await api.put(`/requests/${viewingRequest._id}`, viewingRequest);
            }

            await api.post(`/requests/${viewingRequest._id}/approve`);
            alert('Request approved! Masjid created.');
            setViewingRequest(null);
            fetchRequests();
        } catch (error) {
            alert('Error approving request: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleReject = async () => {
        try {
            await api.post(`/requests/${viewingRequest._id}/reject`, { adminNote: rejectNote });
            alert('Request rejected.');
            setShowRejectModal(false);
            setRejectNote('');
            setViewingRequest(null);
            fetchRequests();
        } catch (error) {
            alert('Error rejecting request');
        }
    };

    const updateRequestField = (field, value) => {
        setViewingRequest(prev => ({ ...prev, [field]: value }));
    };

    const updateShift = (index, field, value) => {
        const newShifts = [...viewingRequest.shifts];
        newShifts[index][field] = value;
        setViewingRequest(prev => ({ ...prev, shifts: newShifts }));
    };

    const updateShiftTime = (index, value) => {
        const time12 = convert24to12(value);
        updateShift(index, 'time', time12);
    };

    const addShift = () => {
        setViewingRequest(prev => ({
            ...prev,
            shifts: [...prev.shifts, { time: '', lang: '' }]
        }));
    };

    const removeShift = (index) => {
        const newShifts = viewingRequest.shifts.filter((_, i) => i !== index);
        setViewingRequest(prev => ({ ...prev, shifts: newShifts }));
    };

    // Filtered requests
    const filteredRequests = allRequests.filter(req => {
        const matchCity = selectedCity === 'All' || (req.city || 'Bengaluru') === selectedCity;
        const matchArea = selectedArea === 'All' || (req.area || '') === selectedArea;
        const matchStatus = selectedStatus === 'All' || req.status === selectedStatus.toLowerCase();
        const query = searchQuery.toLowerCase();
        const matchSearch = req.name?.toLowerCase().includes(query) || req.area?.toLowerCase().includes(query);
        return matchCity && matchArea && matchStatus && matchSearch;
    });

    // Get unique values for filters
    const uniqueCities = ['All', ...new Set(allRequests.map(r => r.city || 'Bengaluru'))];
    const uniqueAreas = ['All', ...new Set(allRequests.filter(r => r.area).map(r => r.area))];

    const clearFilters = () => {
        setSelectedCity('All');
        setSelectedArea('All');
        setSelectedStatus('All');
        setSearchQuery('');
    };

    const hasActiveFilters = selectedCity !== 'All' || selectedArea !== 'All' || selectedStatus !== 'All' || searchQuery;

    return (
        <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6">Masjid Requests</h1>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Filters - Shopping Style */}
                    <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200">
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 items-center">
                            <select
                                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="All">🔄 All Status</option>
                                <option value="pending">🟡 Pending</option>
                                <option value="approved">✅ Approved</option>
                                <option value="rejected">❌ Rejected</option>
                            </select>
                            <select
                                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white"
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                            >
                                {uniqueCities.map(city => (
                                    <option key={city} value={city}>{city === 'All' ? '🏙️ All Cities' : city}</option>
                                ))}
                            </select>
                            <select
                                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white col-span-2 sm:col-span-1"
                                value={selectedArea}
                                onChange={(e) => setSelectedArea(e.target.value)}
                            >
                                {uniqueAreas.map(area => (
                                    <option key={area} value={area}>{area === 'All' ? '📍 All Areas' : area}</option>
                                ))}
                            </select>
                            <div className="col-span-2 sm:flex-1 sm:min-w-[200px] sm:max-w-md">
                                <input
                                    type="text"
                                    placeholder="🔍 Search by Name..."
                                    className="w-full border border-slate-300 rounded-lg pl-4 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-xs text-slate-500 hover:text-red-500 font-medium underline col-span-2 sm:col-span-1"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                        <div className="mt-2 text-xs text-slate-500 text-right">
                            Showing {filteredRequests.length} of {allRequests.length} requests
                        </div>
                    </div>

                    {/* Scrollable Table Container */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600 min-w-[600px]">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3">Status</th>
                                    <th className="px-4 sm:px-6 py-3 hidden sm:table-cell">City</th>
                                    <th className="px-4 sm:px-6 py-3">Masjid Name</th>
                                    <th className="px-4 sm:px-6 py-3 hidden sm:table-cell">Submitted</th>
                                    <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.map((req) => (
                                    <tr key={req._id} className="bg-white border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                                        <td className="px-4 sm:px-6 py-4">
                                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold uppercase ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 font-semibold text-slate-700 hidden sm:table-cell">{req.city || 'Bengaluru'}</td>
                                        <td className="px-4 sm:px-6 py-4 font-semibold text-slate-800">{req.name}</td>
                                        <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">{new Date(req.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 sm:px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleView(req)}
                                                className="text-blue-600 hover:text-blue-900 font-bold text-xs bg-blue-50 px-2 sm:px-3 py-1 rounded-lg border border-blue-100"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRequests.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                                            No requests found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* View/Edit Modal */}
            {viewingRequest && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Review Request</h2>
                                <p className="text-sm text-slate-500">Submitted by: {viewingRequest.submitterEmail || 'Anonymous'}</p>
                            </div>
                            <button onClick={() => setViewingRequest(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        {viewingRequest.status === 'pending' && (
                            <div className="mb-6 flex gap-4 bg-blue-50 p-4 rounded-xl">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editMode}
                                        onChange={(e) => setEditMode(e.target.checked)}
                                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                                    />
                                    <span className="font-bold text-blue-800">Enable Edit Mode</span>
                                </label>
                                <p className="text-sm text-blue-600 self-center">Check this to modify details before approving.</p>
                            </div>
                        )}

                        <div className="bg-amber-50 rounded-xl p-4 mb-4 text-sm border border-amber-100">
                            <p className="font-bold text-amber-800 mb-1">Requester's Note / Maps Link:</p>
                            <p className="whitespace-pre-wrap text-amber-700">{viewingRequest.adminNote}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Name</label>
                                    <input
                                        type="text"
                                        className={`w-full border rounded-lg px-3 py-2 ${editMode ? 'border-slate-300' : 'bg-slate-50 border-transparent'}`}
                                        value={viewingRequest.name}
                                        readOnly={!editMode}
                                        onChange={(e) => updateRequestField('name', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">City</label>
                                    <input
                                        type="text"
                                        className={`w-full border rounded-lg px-3 py-2 ${editMode ? 'border-slate-300' : 'bg-slate-50 border-transparent'}`}
                                        value={viewingRequest.city || 'Bengaluru'}
                                        readOnly={!editMode}
                                        onChange={(e) => updateRequestField('city', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Area / Locality</label>
                                    <input
                                        type="text"
                                        className={`w-full border rounded-lg px-3 py-2 ${editMode ? 'border-slate-300' : 'bg-slate-50 border-transparent'}`}
                                        value={viewingRequest.area || ''}
                                        readOnly={!editMode}
                                        onChange={(e) => updateRequestField('area', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Map Link</label>
                                    <input
                                        type="text"
                                        className={`w-full border rounded-lg px-3 py-2 ${editMode ? 'border-slate-300' : 'bg-slate-50 border-transparent'}`}
                                        value={viewingRequest.mapLink || ''}
                                        readOnly={!editMode}
                                        placeholder="maps.google.com/..."
                                        onChange={(e) => updateRequestField('mapLink', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Coordinates (Lat / Lng)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="Latitude"
                                        className={`w-full border rounded-lg px-3 py-2 ${editMode ? 'border-slate-300' : 'bg-slate-50 border-transparent'}`}
                                        value={viewingRequest.lat}
                                        readOnly={!editMode}
                                        onChange={(e) => updateRequestField('lat', parseFloat(e.target.value))}
                                    />
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="Longitude"
                                        className={`w-full border rounded-lg px-3 py-2 ${editMode ? 'border-slate-300' : 'bg-slate-50 border-transparent'}`}
                                        value={viewingRequest.lng}
                                        readOnly={!editMode}
                                        onChange={(e) => updateRequestField('lng', parseFloat(e.target.value))}
                                    />
                                </div>
                                {editMode && <p className="text-xs text-slate-400 mt-1">Get these from the Google Maps link above.</p>}
                                {editMode && (
                                    <button
                                        onClick={async () => {
                                            const urlRegex = /(https?:\/\/[^\s]+)/g;
                                            const match = viewingRequest.adminNote.match(urlRegex);
                                            const link = match ? match[0] : '';

                                            if (!link) {
                                                setExtractionStatus('No link found');
                                                alert('No http/https link found in note.');
                                                return;
                                            }

                                            setExtractionStatus('Extracting...');

                                            try {
                                                const coords = await extractCoordinatesFromUrl(link.trim());

                                                if (coords && coords.lat && coords.lng) {
                                                    setViewingRequest(prev => ({
                                                        ...prev,
                                                        lat: parseFloat(coords.lat),
                                                        lng: parseFloat(coords.lng)
                                                    }));
                                                    setExtractionStatus('✓ Coordinates Found');
                                                    setTimeout(() => setExtractionStatus(''), 3000);
                                                } else {
                                                    setExtractionStatus('❌ Failed');
                                                    alert('Could not extract coordinates.');
                                                }
                                            } catch (err) {
                                                setExtractionStatus('❌ Error');
                                            }
                                        }}
                                        className="mt-2 text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg border border-blue-100 hover:bg-blue-100 font-semibold"
                                    >
                                        Extract from Note Link
                                    </button>
                                )}
                                {extractionStatus && (
                                    <p className={`text-xs mt-1 font-bold ${extractionStatus.includes('✓') ? 'text-emerald-600' : extractionStatus.includes('❌') ? 'text-red-500' : 'text-blue-500'}`}>
                                        {extractionStatus}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Facilities</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={viewingRequest.facilities?.ladies || false}
                                            disabled={!editMode}
                                            onChange={(e) => updateRequestField('facilities', { ...viewingRequest.facilities, ladies: e.target.checked })}
                                            className="rounded text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm">Ladies Area</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={viewingRequest.facilities?.parking || false}
                                            disabled={!editMode}
                                            onChange={(e) => updateRequestField('facilities', { ...viewingRequest.facilities, parking: e.target.checked })}
                                            className="rounded text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm">Parking</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={viewingRequest.facilities?.outsidersAllowed !== false} // Default true
                                            disabled={!editMode}
                                            onChange={(e) => {
                                                const currentFacilities = viewingRequest.facilities || {};
                                                updateRequestField('facilities', { ...currentFacilities, outsidersAllowed: e.target.checked });
                                            }}
                                            className="rounded text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm">Outsiders Allowed</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Timings</label>
                                    {editMode && (
                                        <button
                                            type="button"
                                            onClick={addShift}
                                            className="text-xs text-emerald-600 font-bold hover:underline"
                                        >
                                            + Add Shift
                                        </button>
                                    )}
                                </div>
                                {viewingRequest.shifts.map((shift, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <input
                                            type="time"
                                            className={`flex-1 border rounded-lg px-3 py-2 ${editMode ? 'border-slate-300' : 'bg-slate-50 border-transparent'}`}
                                            value={convert12to24(shift.time)}
                                            readOnly={!editMode}
                                            onChange={(e) => updateShiftTime(idx, e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Language"
                                            className={`flex-1 border rounded-lg px-3 py-2 ${editMode ? 'border-slate-300' : 'bg-slate-50 border-transparent'}`}
                                            value={shift.lang || ''}
                                            readOnly={!editMode}
                                            onChange={(e) => updateShift(idx, 'lang', e.target.value)}
                                        />
                                        {editMode && viewingRequest.shifts.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeShift(idx)}
                                                className="text-red-500 px-2 hover:bg-red-50 rounded"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Approval Actions */}
                            {viewingRequest.status === 'pending' && !showRejectModal && (
                                <div className="flex gap-3 pt-6 border-t border-slate-100 mt-6">
                                    <button
                                        onClick={() => setShowRejectModal(true)}
                                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3 rounded-xl transition-colors"
                                    >
                                        Reject Request
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg"
                                    >
                                        {editMode ? 'Save & Approve' : 'Approve Request'}
                                    </button>
                                </div>
                            )}

                            {/* Reject Form */}
                            {showRejectModal && (
                                <div className="bg-red-50 p-4 rounded-xl border border-red-100 mt-4">
                                    <h4 className="font-bold text-red-800 mb-2">Rejection Reason</h4>
                                    <textarea
                                        className="w-full border-red-200 rounded-lg p-3 text-sm mb-3 focus:ring-red-200"
                                        placeholder="Why is this request being rejected?"
                                        rows={3}
                                        value={rejectNote}
                                        onChange={(e) => setRejectNote(e.target.value)}
                                    ></textarea>
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => setShowRejectModal(false)} className="text-slate-500 font-medium px-3 py-2">Cancel</button>
                                        <button onClick={handleReject} className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-red-700">Confirm Rejection</button>
                                    </div>
                                </div>
                            )}

                            {viewingRequest.status !== 'pending' && (
                                <div className="bg-slate-100 p-4 rounded-xl text-center text-slate-500 font-medium mt-6">
                                    This request has already been {viewingRequest.status}.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Requests;
