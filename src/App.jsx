import React, { useState, useMemo } from 'react';
import JummahMap from './components/JummahMap';
import masjidsData from './data/masjids.json';
import './index.css';

// Search Dropdown with mosque list
const SearchDropdown = ({ searchQuery, onSelect, onClose }) => {
  const filteredMasjids = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') return [];
    return masjidsData.filter(m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  if (filteredMasjids.length === 0 && searchQuery) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50">
        <p className="text-slate-500 text-sm text-center">No masjids found</p>
      </div>
    );
  }

  if (filteredMasjids.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-80 overflow-y-auto">
      {filteredMasjids.map((masjid) => (
        <button
          key={masjid.id}
          onClick={() => onSelect(masjid)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors border-b border-slate-100 last:border-b-0 text-left"
        >
          {/* Time Badge - "1st" only if multiple Jamats */}
          <div className="flex-shrink-0">
            {masjid.shifts.length > 1 ? (
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">1st</span>
              </div>
            ) : (
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-emerald-600 text-lg">🕌</span>
              </div>
            )}
          </div>

          {/* Masjid Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 text-sm truncate">{masjid.name}</p>
            <p className="text-xs text-slate-500">Bellandur, Bengaluru</p>
          </div>

          {/* Time */}
          <div className="flex-shrink-0 text-right">
            <p className="font-bold text-slate-800">{masjid.shifts[0].time}</p>
            {masjid.shifts.length > 1 && (
              <p className="text-xs text-emerald-600">+{masjid.shifts.length - 1} more</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

// Report Form Modal
const ReportModal = ({ masjid, onClose }) => {
  const [issueType, setIssueType] = useState('incorrect_time');
  const [correctTime, setCorrectTime] = useState('');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create mailto link with form data
    const subject = encodeURIComponent(`[Jummah Finder] Report: ${masjid.name}`);
    const body = encodeURIComponent(
      `MASJID DETAILS (Auto-filled)\n` +
      `========================\n` +
      `Name: ${masjid.name}\n` +
      `Current Times: ${masjid.shifts.map(s => s.time).join(', ')}\n` +
      `Location: Bellandur, Bengaluru\n\n` +
      `REPORTED ISSUE\n` +
      `========================\n` +
      `Issue Type: Incorrect Timing\n` +
      `Correct Time: ${correctTime || 'Not specified'}\n\n` +
      `ADDITIONAL COMMENTS\n` +
      `========================\n` +
      `${comments || 'None'}`
    );

    // Open email client
    window.location.href = `mailto:jumahfinder@gmail.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        className="fixed inset-0 z-[2100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div
          className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm w-full p-8 text-center"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: 'modalSlideUp 0.3s ease-out' }}
        >
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Thank You!</h3>
          <p className="text-slate-600 mb-6">Your report has been prepared. Please send the email that opened to complete your report.</p>
          <button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[2100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'modalSlideUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 px-6 py-5">
          <div className="flex items-center gap-4">
            <span className="text-4xl">⚠️</span>
            <div>
              <h3 className="text-white font-bold text-xl leading-tight">Report Issue</h3>
              <p className="text-amber-100 text-sm mt-1">{masjid.name}</p>
            </div>
          </div>
        </div>

        {/* Auto-filled Info */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Masjid Details (Auto-filled)</p>
          <p className="text-sm text-slate-700 font-medium">{masjid.name}</p>
          <p className="text-xs text-slate-500">Current times: {masjid.shifts.map(s => s.time).join(', ')}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Issue Type */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Issue Type</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="incorrect_time">Incorrect Timing</option>
              <option value="mosque_closed">Mosque Closed/Moved</option>
              <option value="other">Other Issue</option>
            </select>
          </div>

          {/* Correct Time */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Correct Time (if known)</label>
            <input
              type="text"
              value={correctTime}
              onChange={(e) => setCorrectTime(e.target.value)}
              placeholder="e.g., 1:00 PM, 1:30 PM"
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 font-medium placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          {/* Comments */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Additional Comments</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Describe the issue or provide any additional details..."
              rows={3}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 font-medium placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Centered Modal Popup for Masjid Details
const MasjidModal = ({ masjid, onClose }) => {
  const [showReportForm, setShowReportForm] = useState(false);

  if (!masjid) return null;

  if (showReportForm) {
    return <ReportModal masjid={masjid} onClose={() => { setShowReportForm(false); onClose(); }} />;
  }

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Modal Card */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'modalSlideUp 0.3s ease-out' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-5">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🕌</span>
            <div>
              <h3 className="text-white font-bold text-xl leading-tight">{masjid.name}</h3>
              <p className="text-emerald-100 text-sm mt-1">Bengaluru</p>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="px-6 py-5 bg-slate-50 border-b border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Jummah Schedule</p>
          <div className="space-y-3">
            {masjid.shifts.map((shift, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-slate-100">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                  {idx === 0 ? '1st' : idx === 1 ? '2nd' : '3rd'}
                </span>
                <span className="text-2xl font-black text-slate-800">{shift.time}</span>
                {shift.lang && (
                  <span className="text-xs text-slate-400 font-medium">{shift.lang}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Facilities */}
        <div className="px-6 py-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Facilities</p>
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${masjid.facilities.ladies
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}>
              <span>👩</span>
              Ladies Section
            </span>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${masjid.facilities.parking
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}>
              <span>🅿️</span>
              Parking
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 space-y-3">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${masjid.lat},${masjid.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-slate-800 hover:bg-slate-900 text-white text-center font-bold py-4 rounded-xl shadow-lg transition-colors text-base"
          >
            Get Directions →
          </a>

          {/* Report Button */}
          <button
            onClick={() => setShowReportForm(true)}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            <span>⚠️</span>
            Report Incorrect Timing
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMasjid, setSelectedMasjid] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [flyToMasjid, setFlyToMasjid] = useState(null);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleSelectMasjid = (masjid) => {
    // First: fly to the masjid
    setFlyToMasjid(masjid);
    setShowDropdown(false);
    setSearchQuery('');

    // Then: open modal after fly animation completes (800ms delay)
    setTimeout(() => {
      setSelectedMasjid(masjid);
    }, 800);
  };

  const handleMarkerClick = (masjid) => {
    setSelectedMasjid(masjid);
  };

  const closeModal = () => {
    setSelectedMasjid(null);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-50">
      {/* Clean header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] pointer-events-none">
        <div className="bg-white/95 backdrop-blur-sm shadow-md px-4 sm:px-6 py-4 pointer-events-auto border-b border-slate-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-2xl">🕌</span>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                    Jummah Finder
                  </h1>
                  <p className="text-sm text-slate-600">
                    Bengaluru
                  </p>
                </div>
              </div>

              {/* Info badge */}
              <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-emerald-700 text-sm font-semibold">{masjidsData.length} Masjids</span>
              </div>
            </div>

            {/* Clean search box */}
            <div className="relative">
              <div className="relative flex items-center">
                <div className="absolute left-4 pointer-events-none">
                  <span className="text-lg">🔍</span>
                </div>
                <input
                  type="text"
                  placeholder="Search for a masjid..."
                  value={searchQuery}
                  onChange={handleSearch}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full bg-white text-slate-800 placeholder-slate-400 rounded-lg pl-12 pr-12 py-3 text-sm sm:text-base font-medium shadow-sm border border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full p-1.5 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Search hint or dropdown */}
              {!searchQuery && !showDropdown && (
                <p className="text-slate-500 text-xs mt-2 ml-1">
                  💡 Try: &quot;Khadria&quot;, &quot;Bilal&quot;, or &quot;Jama&quot;
                </p>
              )}

              {/* Search Dropdown */}
              {showDropdown && searchQuery && (
                <SearchDropdown
                  searchQuery={searchQuery}
                  onSelect={handleSelectMasjid}
                  onClose={() => setShowDropdown(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map - flies to selected masjid */}
      <JummahMap
        onMarkerClick={handleMarkerClick}
        flyToMasjid={flyToMasjid}
      />

      {/* Centered Modal Popup */}
      <MasjidModal masjid={selectedMasjid} onClose={closeModal} />
    </div>
  );
}

export default App;
