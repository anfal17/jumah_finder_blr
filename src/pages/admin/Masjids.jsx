import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { convert12to24, convert24to12 } from '../../utils/time';
import { extractCoordinatesFromUrl } from '../../utils/maps';
import MasjidAdminModal from '../../components/modals/MasjidAdminModal';

const Masjids = () => {
    const [masjids, setMasjids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingMasjid, setEditingMasjid] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [selectedCity, setSelectedCity] = useState('All');
    const [selectedArea, setSelectedArea] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchMasjids();
    }, []);

    const fetchMasjids = async () => {
        try {
            const { data } = await api.get('/masjids');
            setMasjids(data);
        } catch (error) {
            console.error('Error fetching masjids', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this masjid?')) {
            try {
                await api.delete(`/masjids/${id}`);
                setMasjids(masjids.filter(m => m._id !== id));
            } catch (error) {
                alert('Error deleting masjid');
            }
        }
    };

    const handleEdit = (masjid) => {
        setEditingMasjid(masjid);
        setShowModal(true);
    };

    const handleAddNew = () => {
        setEditingMasjid(null);
        setShowModal(true);
    };

    const handleSaveMasjid = async (formData) => {
        try {
            if (editingMasjid) {
                const { data } = await api.put(`/masjids/${editingMasjid._id}`, formData);
                setMasjids(masjids.map(m => m._id === data._id ? data : m));
            } else {
                const { data } = await api.post('/masjids', formData);
                setMasjids([...masjids, data]);
            }
            setShowModal(false);
        } catch (error) {
            alert('Error saving masjid: ' + (error.response?.data?.message || error.message));
        }
    };

    const filteredMasjids = masjids.filter(masjid => {
        const matchCity = selectedCity === 'All' || (masjid.city || 'Bengaluru') === selectedCity;
        const matchArea = selectedArea === 'All' || (masjid.area || '') === selectedArea;
        const query = searchQuery.toLowerCase();
        const matchSearch = (masjid.name?.toLowerCase().includes(query) ||
            masjid.area?.toLowerCase().includes(query));
        return matchCity && matchArea && matchSearch;
    });

    // Get unique cities and areas for dropdowns
    const uniqueCities = ['All', ...new Set(masjids.map(m => m.city || 'Bengaluru'))];
    const uniqueAreas = ['All', ...new Set(masjids.filter(m => m.area).map(m => m.area))];

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Masjids Management</h1>
                <button
                    onClick={handleAddNew}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                    + Add New Masjid
                </button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Filters - Shopping Style */}
                    <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200">
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 items-center">
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
                                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white"
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
                            {(selectedCity !== 'All' || selectedArea !== 'All' || searchQuery) && (
                                <button
                                    onClick={() => { setSelectedCity('All'); setSelectedArea('All'); setSearchQuery(''); }}
                                    className="text-xs text-slate-500 hover:text-red-500 font-medium underline col-span-2 sm:col-span-1"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Scrollable Table Container */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600 min-w-[700px]">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3">Name</th>
                                    <th className="px-4 sm:px-6 py-3">City</th>
                                    <th className="px-4 sm:px-6 py-3">Area</th>
                                    <th className="px-4 sm:px-6 py-3 hidden sm:table-cell">Location</th>
                                    <th className="px-4 sm:px-6 py-3">Timings</th>
                                    <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMasjids.map((masjid) => (
                                    <tr key={masjid._id} className="bg-white border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                                        <td className="px-4 sm:px-6 py-4 font-semibold text-slate-800">{masjid.name}</td>
                                        <td className="px-4 sm:px-6 py-4 text-slate-600">{masjid.city || 'Bengaluru'}</td>
                                        <td className="px-4 sm:px-6 py-4 text-slate-600">{masjid.area || '-'}</td>
                                        <td className="px-4 sm:px-6 py-4 text-xs text-slate-500 hidden sm:table-cell">{masjid.lat.toFixed(4)}, {masjid.lng.toFixed(4)}</td>
                                        <td className="px-4 sm:px-6 py-4 text-xs">
                                            {masjid.shifts.map(s => s.time).join(', ')}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-right space-x-1 sm:space-x-2">
                                            <button
                                                onClick={() => handleEdit(masjid)}
                                                className="text-indigo-600 hover:text-indigo-900 font-medium text-xs sm:text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(masjid._id)}
                                                className="text-red-600 hover:text-red-900 font-medium text-xs sm:text-sm"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredMasjids.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                                            {masjids.length === 0 ? "No masjids found. Add one to get started." : "No matching masjids found."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <MasjidAdminModal
                    masjid={editingMasjid}
                    onClose={() => setShowModal(false)}
                    onSave={handleSaveMasjid}
                />
            )}
        </div >
    );
};

export default Masjids;
