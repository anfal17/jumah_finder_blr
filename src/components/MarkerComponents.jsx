import React from 'react';
import { renderToString } from 'react-dom/server';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/**
 * CLEAN MARKER DESIGN
 * Single Jamat: Just time
 * Multiple Jamats: "1st" badge + time
 */
export const FloatingPillMarker = ({ jamaatCount, nextTime }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15))'
    }}>
        {/* Main Card */}
        <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '14px',
            border: '1.5px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: jamaatCount > 1 ? '10px' : '0',
            padding: '10px 16px',
            cursor: 'pointer',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
        }}>
            {/* "1st" Badge - Only show if multiple Jamats */}
            {jamaatCount > 1 && (
                <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '800',
                    color: 'white',
                    boxShadow: '0 3px 8px rgba(16, 185, 129, 0.3)'
                }}>1st</div>
            )}

            {/* Main Time - Bold and Clear */}
            <span style={{
                fontWeight: '800',
                fontSize: '16px',
                color: '#0f172a',
                letterSpacing: '-0.03em',
                lineHeight: '1'
            }}>{nextTime}</span>
        </div>

        {/* Pointer Triangle */}
        <div style={{
            width: '0',
            height: '0',
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '12px solid #f8fafc',
            marginTop: '-1px'
        }}></div>
    </div>
);

/**
 * Factory function to create the Leaflet DivIcon
 */
export const createCustomIcon = (masjid) => {
    const jamaatCount = masjid.shifts.length;
    const nextTime = masjid.shifts[0].time;

    const iconHtml = renderToString(
        <FloatingPillMarker jamaatCount={jamaatCount} nextTime={nextTime} />
    );

    return L.divIcon({
        className: 'floating-pill-icon',
        html: iconHtml,
        iconSize: [0, 0],
        iconAnchor: [55, 55],
    });
};
