import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-slate-500 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        masjids: 0,
        requests: 0,
        pending: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [masjidsRes, requestsRes] = await Promise.all([
                    api.get('/masjids'),
                    api.get('/requests')
                ]);

                const pendingCount = requestsRes.data.filter(r => r.status === 'pending').length;

                setStats({
                    masjids: masjidsRes.data.length,
                    requests: requestsRes.data.length,
                    pending: pendingCount
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                <p className="text-slate-500">Welcome back to Jummah Finder admin</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Masjids"
                    value={stats.masjids}
                    icon="🕌"
                    color="bg-emerald-100 text-emerald-600"
                />
                <StatCard
                    title="Pending Requests"
                    value={stats.pending}
                    icon="⏳"
                    color="bg-amber-100 text-amber-600"
                />
                <StatCard
                    title="Total Submissions"
                    value={stats.requests}
                    icon="📩"
                    color="bg-blue-100 text-blue-600"
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">👋</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Welcome to Panel</h3>
                <p className="text-slate-500 max-w-md mx-auto mt-2">
                    Select an option from the sidebar to manage masjids or review pending requests.
                </p>
            </div>
        </div>
    );
};

export default Dashboard;
