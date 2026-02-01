import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const Feedbacks = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingFeedback, setViewingFeedback] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const { data } = await api.get('/feedbacks');
            setFeedbacks(data);
        } catch (error) {
            console.error('Error fetching feedbacks', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkReviewed = async (id) => {
        try {
            const { data } = await api.put(`/feedbacks/${id}`, { status: 'reviewed' });
            setFeedbacks(feedbacks.map(f => f._id === id ? data : f));
        } catch (error) {
            alert('Error updating status');
        }
    };

    // Filtered feedbacks
    const filteredFeedbacks = feedbacks.filter(f => {
        if (statusFilter === 'All') return true;
        return f.status === statusFilter.toLowerCase();
    });

    return (
        <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6">User Feedback</h1>

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
                            <option value="reviewed">✅ Reviewed</option>
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
                            {filteredFeedbacks.length} of {feedbacks.length}
                        </span>
                    </div>

                    {/* Scrollable Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600 min-w-[500px]">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3">Status</th>
                                    <th className="px-4 sm:px-6 py-3">Content</th>
                                    <th className="px-4 sm:px-6 py-3 hidden sm:table-cell">Email</th>
                                    <th className="px-4 sm:px-6 py-3 hidden sm:table-cell">Date</th>
                                    <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFeedbacks.map((item) => (
                                    <tr key={item._id} className="bg-white border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                                        <td className="px-4 sm:px-6 py-4">
                                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold uppercase ${item.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-slate-800">
                                            <div className="max-w-[120px] sm:max-w-xs truncate">{item.content}</div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-slate-500 hidden sm:table-cell">{item.contactEmail || '-'}</td>
                                        <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">{new Date(item.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 sm:px-6 py-4 text-right flex gap-1 sm:gap-2 justify-end">
                                            <button
                                                onClick={() => setViewingFeedback(item)}
                                                className="text-slate-600 hover:text-slate-900 font-bold text-xs bg-slate-100 px-2 sm:px-3 py-1 rounded-lg border border-slate-200"
                                            >
                                                View
                                            </button>
                                            {item.status === 'pending' && (
                                                <button
                                                    onClick={() => handleMarkReviewed(item._id)}
                                                    className="text-blue-600 hover:text-blue-900 font-bold text-xs bg-blue-50 px-2 sm:px-3 py-1 rounded-lg border border-blue-100 hidden sm:inline-block"
                                                >
                                                    Mark Reviewed
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredFeedbacks.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                                            No feedback found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewingFeedback && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-slate-800">Feedback Details</h2>
                            <button onClick={() => setViewingFeedback(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100 max-h-[60vh] overflow-y-auto">
                            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">
                                {viewingFeedback.content}
                            </p>
                        </div>

                        <div className="flex justify-between items-center text-xs text-slate-500 mb-6">
                            <span>From: {viewingFeedback.contactEmail || 'Anonymous'}</span>
                            <span>{new Date(viewingFeedback.createdAt).toLocaleString()}</span>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setViewingFeedback(null)}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors"
                            >
                                Close
                            </button>
                            {viewingFeedback.status === 'pending' && (
                                <button
                                    onClick={() => {
                                        handleMarkReviewed(viewingFeedback._id);
                                        setViewingFeedback(null);
                                    }}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
                                >
                                    Mark as Reviewed
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Feedbacks;
