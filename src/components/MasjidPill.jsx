import React from 'react';
import { renderToString } from 'react-dom/server';
import L from 'leaflet';

/**
 * Airbnb-style "Pill" Marker Component
 * Renders to static HTML for Leaflet L.divIcon
 */
export const MasjidPillMockup = ({ time, name }) => (
  <div className="relative group">
    {/* Floating Pill Container */}
    <div className="flex flex-col items-center transform transition-transform hover:scale-110 duration-200 cursor-pointer">
      
      {/* The main white pill */}
      <div className="bg-white rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.12)] flex items-center gap-2.5 px-3.5 py-2 min-w-max hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] transition-shadow border border-gray-100/50">
        
        {/* Emerald Icon Circle */}
        <div className="bg-emerald-500 text-white p-1 rounded-full flex items-center justify-center w-6 h-6 shadow-sm">
           <span className="font-bold text-xs">J</span>
        </div>

        {/* Text Content */}
        <div className="flex flex-col items-start leading-none gap-0.5">
          <span className="text-base font-black text-slate-800 tracking-tight">{time}</span>
          <span className="text-[10px] font-semibold text-gray-400 truncate max-w-[80px]">{name}</span>
        </div>
      
      </div>

      {/* Triangle Pointer (The 'Beak') */}
      <div className="w-2.5 h-2.5 bg-white transform rotate-45 -mt-1.5 shadow-[2px_2px_4px_rgba(0,0,0,0.05)] z-0 rounded-[1px]"></div>
    </div>
  </div>
);

/**
 * Factory function to create the Leaflet DivIcon
 */
export const createPillIcon = (masjid) => {
  const nextTime = masjid.shifts[0].time;
  
  const iconHtml = renderToString(
    <MasjidPillMockup time={nextTime} name={masjid.name} />
  );

  return L.divIcon({
    className: 'custom-pill-icon', // Will override in CSS to be transparent
    html: iconHtml,
    iconSize: [0, 0], // Size handles by content
    iconAnchor: [60, 50], // Approximate center
  });
};
