import api from './api';

export const extractCoordinatesFromUrl = async (url) => {
    if (!url) return null;

    // 1. Try Client-side Extraction (Fast, no API call needed)
    try {
        // pattern 1: @lat,lng
        const atRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
        const atMatch = url.match(atRegex);
        if (atMatch) {
            return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
        }

        // pattern 2: search query q=lat,lng
        const qRegex = /q=(-?\d+\.\d+),(-?\d+\.\d+)/;
        const qMatch = url.match(qRegex);
        if (qMatch) {
            return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
        }

        // pattern 3: !3dlat!4dlng (embeds/data params)
        const dataRegex = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
        const dataMatch = url.match(dataRegex);
        if (dataMatch) {
            return { lat: parseFloat(dataMatch[1]), lng: parseFloat(dataMatch[2]) };
        }

        // pattern 4: destination daddr=lat,lng
        const daddrRegex = /daddr=(-?\d+\.\d+),(-?\d+\.\d+)/;
        const daddrMatch = url.match(daddrRegex);
        if (daddrMatch) {
            return { lat: parseFloat(daddrMatch[1]), lng: parseFloat(daddrMatch[2]) };
        }

    } catch (e) {
        console.error("Client-side parsing failed", e);
    }

    // 2. Server-side Extraction (Handles short URLs like maps.app.goo.gl)
    try {
        console.log('Fetching coordinates from server for:', url);
        const { data } = await api.post('/maps/extract', { url });
        return data;
    } catch (error) {
        console.error('Server-side extraction failed:', error);
        return null;
    }
};
