import React, { useState } from 'react';
import api from '../../utils/api';

const FeedbackModal = ({ onClose }) => {
    const [content, setContent] = useState('');
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/feedbacks', {
                content,
                contactEmail: email
            });
            setSubmitted(true);
        } catch (error) {
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4" onClick={onClose}>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center" onClick={(e) => e.stopPropagation()} style={{ animation: 'modalSlideUp 0.3s ease-out' }}>
                    <div className="text-6xl mb-4">💙</div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Feedback Sent!</h3>
                    <p className="text-slate-600 mb-6">Thanks for helping us improve Jummah Finder.</p>
                    <button onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-colors">Done</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} style={{ animation: 'modalSlideUp 0.3s ease-out' }}>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 px-6 py-5">
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">💬</span>
                        <div>
                            <h3 className="text-white font-bold text-xl">Feedback</h3>
                            <p className="text-blue-100 text-sm mt-1">We'd love to hear from you</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            placeholder="Share your thoughts, suggestions, or bug reports..."
                            rows={4}
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 font-medium placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email (Optional)</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 font-medium placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-70">
                            {loading ? 'Sending...' : 'Send Feedback'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackModal;
