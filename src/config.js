// Centralized configuration for API and constants
// Change these values when deploying to production

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Default values
export const DEFAULTS = {
    CITY: 'Bengaluru',
    SHIFT_TIME: '1:30 PM',
    SHIFT_LANG: 'Urdu',
};

// Google Maps
export const GOOGLE_MAPS = {
    DIRECTIONS_URL: 'https://www.google.com/maps/dir/?api=1',
};
