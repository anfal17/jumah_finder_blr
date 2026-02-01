import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { convert12to24, convert24to12 } from '../../utils/time';
import MasjidAdminModal from '../../components/modals/MasjidAdminModal';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingReport, setViewingReport] = useState(null);
    const [linkedMasjid, setLinkedMasjid] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [showMasjidModal, setShowMasjidModal] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const { data } = await api.get('/reports');
            setReports(data);
        } catch (error) {
            console.error('Error fetching reports', error);
        } finally {
            setLoading(false);
        }
    };

    const handleView = async (report) => {
        setViewingReport(report);
        setEditMode(false);
        setLinkedMasjid(null);

        if (report.masjidId) {
            try {
                const { data } = await api.get(`/masjids/${report.masjidId}`);
                setLinkedMasjid(data);
            } catch (error) {
                console.error("Could not fetch linked masjid", error);
            }
        }
    };

    const handleResolve = async () => {
        try {
            if (editMode && linkedMasjid) {
                await api.put(`/masjids/${linkedMasjid._id}`, linkedMasjid);
            }

            const { data } = await api.put(`/reports/${viewingReport._id}`, { status: 'resolved' });
            setReports(reports.map(r => r._id === viewingReport._id ? data : r));
            setViewingReport(null);
            alert('Report resolved' + (editMode ? ' and Masjid updated' : '') + '.');
        } catch (error) {
            alert('Error updating status: ' + (error.response?.data?.message || error.message));
        }
    };

    const updateMasjidField = (field, value) => {
        setLinkedMasjid({ ...linkedMasjid, [field]: value });
    };

    const updateShift = (index, field, value) => {
        const newShifts = [...linkedMasjid.shifts];
        newShifts[index][field] = value;
        setLinkedMasjid({ ...linkedMasjid, shifts: newShifts });
    };

    const updateShiftTime = (index, value) => {
        const time12 = convert24to12(value);
        updateShift(index, 'time', time12);
    };

    // Open full Masjid Edit Modal
    const handleOpenMasjidEdit = () => {
        setShowMasjidModal(true);
    };

    const handleSaveMasjidFromModal = async (formData) => {
        try {
            const { data } = await api.put(`/masjids/${linkedMasjid._id}`, formData);
            setLinkedMasjid(data);
            setShowMasjidModal(false);
            alert('Masjid updated successfully!');
        } catch (error) {
            alert('Error saving masjid: ' + (error.response?.data?.message || error.message));
        }
    };

    // Filtered reports
    const filteredReports = reports.filter(r => {
        if (statusFilter === 'All') return true;
        return r.status === statusFilter.toLowerCase();
    });

    return (
        <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6">Issue Reports</h1>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Filter Bar */}
                    <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-2 sm:gap-3 items-center">
                        <select
                            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">🔄 All Status</option>
                            <option value="pending">🟡 Pending</option>
                            <option value="resolved">✅ Resolved</option>
                        </select>
                        {statusFilter !== 'All' && (
                            <button
                                onClick={() => setStatusFilter('All')}
                                className="text-xs text-slate-500 hover:text-red-500 font-medium underline"
                            >
                                Clear Filter
                            </button>
                        )}
                        <span className="ml-auto text-xs text-slate-500">
                            {filteredReports.length} of {reports.length}
                        </span>
                    </div>

                    {/* Scrollable Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600 min-w-[550px]">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3">Status</th>
                                    <th className="px-4 sm:px-6 py-3">Masjid</th>
                                    <th className="px-4 sm:px-6 py-3">Issue</th>
                                    <th className="px-4 sm:px-6 py-3 hidden sm:table-cell">Date</th>
                                    <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.map((item) => (
                                    <tr key={item._id} className="bg-white border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                                        <td className="px-4 sm:px-6 py-4">
                                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold uppercase ${item.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 font-semibold text-slate-800">
                                            <div className="max-w-[100px] sm:max-w-none truncate">{item.masjidName}</div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-slate-600 capitalize text-xs sm:text-sm">{item.issueType.replace('_', ' ')}</td>
                                        <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">{new Date(item.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 sm:px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleView(item)}
                                                className="text-blue-600 hover:text-blue-900 font-bold text-xs bg-blue-50 px-2 sm:px-3 py-1 rounded-lg border border-blue-100"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredReports.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                                            No reports found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* View Report Modal */}
            {viewingReport && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Resolve Report</h2>
                                <p className="text-sm text-slate-500">Reported on {new Date(viewingReport.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => setViewingReport(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-100">
                            <h4 className="font-bold text-amber-800 mb-2">Report Details</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm text-amber-900">
                                <p><span className="font-semibold">Issue:</span> {viewingReport.issueType}</p>
                                <p><span className="font-semibold">Suggested Time:</span> {viewingReport.correctTime || 'N/A'}</p>
                                <div className="col-span-2 mt-2 pt-2 border-t border-amber-200">
                                    <p className="font-semibold mb-1">Description / Context:</p>
                                    <p className="whitespace-pre-wrap">{viewingReport.description}</p>
                                </div>
                            </div>
                        </div>

                        {linkedMasjid ? (
                            <div className="border rounded-xl p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-800">Masjid Data</h3>
                                    <div className="flex gap-2">
                                        {viewingReport.status === 'pending' && (
                                            <>
                                                <label className="flex items-center gap-2 cursor-pointer bg-blue-50 px-3 py-1 rounded-lg">
                                                    <input
                                                        type="checkbox"
                                                        checked={editMode}
                                                        onChange={(e) => setEditMode(e.target.checked)}
                                                        className="w-4 h-4 text-blue-600 rounded"
                                                    />
                                                    <span className="text-sm font-bold text-blue-800">Quick Edit</span>
                                                </label>
                                                <button
                                                    onClick={handleOpenMasjidEdit}
                                                    className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm font-bold hover:bg-indigo-200"
                                                >
                                                    Full Edit →
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Name</label>
                                            <input
                                                type="text"
                                                className={`w-full border rounded-lg px-3 py-2 ${editMode ? 'border-slate-300' : 'bg-slate-50 border-transparent'}`}
                                                value={linkedMasjid.name}
                                                readOnly={!editMode}
                                                onChange={(e) => updateMasjidField('name', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Area</label>
                                            <input
                                                type="text"
                                                className={`w-full border rounded-lg px-3 py-2 ${editMode ? 'border-slate-300' : 'bg-slate-50 border-transparent'}`}
                                                value={linkedMasjid.area || ''}
                                                readOnly={!editMode}
                                                onChange={(e) => updateMasjidField('area', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Timings</label>
                                        {linkedMasjid.shifts.map((shift, idx) => (
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
                                                    className={`flex-1 border rounded-lg px-3 py-2 ${editMode ? 'border-slate-300' : 'bg-slate-50 border-transparent'}`}
                                                    value={shift.lang}
                                                    readOnly={!editMode}
                                                    onChange={(e) => updateShift(idx, 'lang', e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-slate-500 italic py-4">Masjid data not found (ID: {viewingReport.masjidId})</p>
                        )}

                        <div className="flex gap-3 pt-6 mt-4 border-t border-slate-100">
                            <button
                                onClick={() => setViewingReport(null)}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors"
                            >
                                Close
                            </button>
                            {viewingReport.status === 'pending' && (
                                <button
                                    onClick={handleResolve}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg"
                                >
                                    {editMode ? 'Update Masjid & Resolve' : 'Mark as Resolved'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Full Masjid Edit Modal */}
            {showMasjidModal && linkedMasjid && (
                <MasjidAdminModal
                    masjid={linkedMasjid}
                    onClose={() => setShowMasjidModal(false)}
                    onSave={handleSaveMasjidFromModal}
                />
            )}
        </div>
    );
};

export default Reports;
