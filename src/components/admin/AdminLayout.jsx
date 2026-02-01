import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const adminInfo = localStorage.getItem('adminInfo');
        if (!adminInfo) {
            navigate('/admin/login');
        } else {
            setAdmin(JSON.parse(adminInfo));
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminInfo');
        navigate('/admin/login');
    };

    const closeSidebar = () => setSidebarOpen(false);

    if (!admin) return null;

    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`;

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🛡️</span>
                    <span className="font-bold">Admin Panel</span>
                </div>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                >
                    {sidebarOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/50"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-64 bg-slate-900 text-white flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                lg:transform-none
                pt-16 lg:pt-0
            `}>
                <div className="p-6">
                    <div className="hidden lg:flex items-center gap-3 mb-8">
                        <span className="text-3xl">🛡️</span>
                        <div>
                            <h1 className="font-bold text-lg">Admin Panel</h1>
                            <p className="text-xs text-slate-400">Jummah Finder</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        <NavLink to="/admin/dashboard" className={navLinkClass} onClick={closeSidebar}>
                            <span>📊</span> Dashboard
                        </NavLink>
                        <NavLink to="/admin/masjids" className={navLinkClass} onClick={closeSidebar}>
                            <span>🕌</span> All Masjids
                        </NavLink>
                        <NavLink to="/admin/requests" className={navLinkClass} onClick={closeSidebar}>
                            <span>📩</span> Requests
                        </NavLink>
                        <NavLink to="/admin/reports" className={navLinkClass} onClick={closeSidebar}>
                            <span>⚠️</span> Reports
                        </NavLink>
                        <NavLink to="/admin/feedbacks" className={navLinkClass} onClick={closeSidebar}>
                            <span>💬</span> Feedbacks
                        </NavLink>
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                            {admin.email[0].toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate">{admin.email}</p>
                            <p className="text-xs text-slate-500 capitalize">{admin.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-red-200 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                        <span>🚪</span> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
                <div className="p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
