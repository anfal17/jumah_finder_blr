import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Circle } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import masjidsData from '../data/masjids.json';
import config from '../data/config.json';
import { createCustomIcon } from './MarkerComponents';
import { calculateDistance, getUserLocation } from '../utils/location';

// Custom Cluster Icon Creator
const createClusterCustomIcon = function (cluster) {
    return L.divIcon({
        html: `<span class="cluster-text">${cluster.getChildCount()}</span>`,
        className: 'custom-cluster-icon',
        iconSize: L.point(40, 40, true),
    });
};

// User location marker icon
const userLocationIcon = L.divIcon({
    className: 'user-location-icon',
    html: `
        <div style="
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
            position: relative;
        ">
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
            "></div>
        </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

// Component to fly to a position
const FlyToPosition = ({ position, zoom = 16 }) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, zoom, {
                animate: true,
                duration: 0.8
            });
        }
    }, [position, zoom, map]);

    return null;
};

// Component to persist map position to localStorage
const MapPersistence = () => {
    const map = useMap();

    useEffect(() => {
        const savePosition = () => {
            const center = map.getCenter();
            const zoom = map.getZoom();
            try {
                localStorage.setItem(config.map.localStorageKey, JSON.stringify({
                    center: [center.lat, center.lng],
                    zoom: zoom
                }));
            } catch (e) {
                // Ignore storage errors
            }
        };

        map.on('moveend', savePosition);
        map.on('zoomend', savePosition);

        return () => {
            map.off('moveend', savePosition);
            map.off('zoomend', savePosition);
        };
    }, [map]);

    return null;
};

// Map Controls Component (Zoom + Location)
const MapControls = ({ userLocation, onLocationToggle, locationLoading }) => {
    const map = useMap();

    const handleZoomIn = () => map.zoomIn();
    const handleZoomOut = () => map.zoomOut();

    return (
        <div className="absolute bottom-24 right-4 z-[999] flex flex-col gap-2">
            {/* Location Button */}
            <button
                onClick={onLocationToggle}
                disabled={locationLoading}
                className={`w-11 h-11 rounded-xl shadow-lg flex items-center justify-center transition-colors border text-xl ${userLocation
                    ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                    : 'bg-white text-blue-500 border-slate-200 hover:bg-blue-50'
                    } ${locationLoading ? 'opacity-70 cursor-wait' : ''}`}
                aria-label="Toggle location"
            >
                {locationLoading ? '⏳' : '📍'}
            </button>

            {/* Zoom Controls */}
            <div className="flex flex-col">
                <button
                    onClick={handleZoomIn}
                    className="w-11 h-11 bg-white rounded-t-xl shadow-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors border border-slate-200 text-2xl font-bold"
                    aria-label="Zoom in"
                >
                    +
                </button>
                <button
                    onClick={handleZoomOut}
                    className="w-11 h-11 bg-white rounded-b-xl shadow-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors border border-slate-200 border-t-0 text-2xl font-bold"
                    aria-label="Zoom out"
                >
                    −
                </button>
            </div>
        </div>
    );
};

const JummahMap = ({ onMarkerClick, flyToMasjid, userLocation, setUserLocation, nearbyRadius = config.map.nearbyRadius }) => {
    // Load saved position from localStorage
    const getSavedPosition = () => {
        try {
            const saved = localStorage.getItem(config.map.localStorageKey);
            if (saved) {
                const { center, zoom } = JSON.parse(saved);
                if (center && zoom) {
                    return { center, zoom };
                }
            }
        } catch (e) {
            console.log('Could not load saved position');
        }
        return { center: config.map.defaultCenter, zoom: config.map.defaultZoom };
    };

    const savedPosition = getSavedPosition();
    const [flyToPosition, setFlyToPosition] = useState(null);
    const [flyZoom, setFlyZoom] = useState(config.map.flyToZoom);
    const [locationLoading, setLocationLoading] = useState(false);

    // Effect to handle flyToMasjid prop from parent
    useEffect(() => {
        if (flyToMasjid) {
            setFlyToPosition([flyToMasjid.lat, flyToMasjid.lng]);
            setFlyZoom(config.map.flyToZoom);
        }
    }, [flyToMasjid]);

    // Effect to fly to user location when it changes
    useEffect(() => {
        if (userLocation) {
            setFlyToPosition([userLocation.lat, userLocation.lng]);
            setFlyZoom(config.map.userLocationZoom);
        }
    }, [userLocation]);

    // Handle location toggle
    const handleLocationToggle = async () => {
        if (userLocation) {
            setUserLocation(null);
        } else {
            setLocationLoading(true);
            try {
                const location = await getUserLocation();
                setUserLocation(location);
            } catch (error) {
                alert(error.message);
            } finally {
                setLocationLoading(false);
            }
        }
    };

    // Filter masjids based on user location and radius
    const visibleMasjids = userLocation
        ? masjidsData.filter(masjid => {
            const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                masjid.lat,
                masjid.lng
            );
            return distance <= nearbyRadius;
        }).map(masjid => ({
            ...masjid,
            distance: calculateDistance(
                userLocation.lat,
                userLocation.lng,
                masjid.lat,
                masjid.lng
            )
        })).sort((a, b) => a.distance - b.distance)
        : masjidsData;

    // Handle marker click
    const handleMarkerClick = (masjid) => {
        setFlyToPosition([masjid.lat, masjid.lng]);
        setFlyZoom(16);
        if (onMarkerClick) onMarkerClick(masjid);
    };

    return (
        <div className="w-full h-full relative">
            <MapContainer
                center={savedPosition.center}
                zoom={savedPosition.zoom}
                className="w-full h-full"
                zoomControl={false}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url={config.map.tileUrl}
                />

                {/* Persist map position to localStorage */}
                <MapPersistence />

                {flyToPosition && <FlyToPosition position={flyToPosition} zoom={flyZoom} />}

                {/* User location marker and radius circle */}
                {userLocation && (
                    <>
                        <Marker
                            position={[userLocation.lat, userLocation.lng]}
                            icon={userLocationIcon}
                        />
                        <Circle
                            center={[userLocation.lat, userLocation.lng]}
                            radius={nearbyRadius * 1000}
                            pathOptions={{
                                color: '#3b82f6',
                                fillColor: '#3b82f6',
                                fillOpacity: 0.1,
                                weight: 2,
                                dashArray: '5, 5'
                            }}
                        />
                    </>
                )}

                {/* Map Controls */}
                <MapControls
                    userLocation={userLocation}
                    onLocationToggle={handleLocationToggle}
                    locationLoading={locationLoading}
                />

                <MarkerClusterGroup
                    chunkedLoading
                    iconCreateFunction={createClusterCustomIcon}
                    maxClusterRadius={60}
                    spiderfyOnMaxZoom={true}
                >
                    {visibleMasjids.map((masjid) => (
                        <Marker
                            key={masjid.id}
                            position={[masjid.lat, masjid.lng]}
                            icon={createCustomIcon(masjid)}
                            eventHandlers={{
                                click: () => handleMarkerClick(masjid)
                            }}
                        />
                    ))}
                </MarkerClusterGroup>
            </MapContainer>

            {/* Nearby indicator */}
            {userLocation && (
                <div className="absolute top-4 left-4 z-[999] bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold flex items-center gap-2">
                    <span>📍</span>
                    {visibleMasjids.length} masjid{visibleMasjids.length !== 1 ? 's' : ''} within {nearbyRadius}km
                </div>
            )}
        </div>
    );
};

export default JummahMap;
