import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import masjidsData from '../data/masjids.json';
import { createCustomIcon } from './MarkerComponents';

// Custom Cluster Icon Creator
const createClusterCustomIcon = function (cluster) {
    return L.divIcon({
        html: `<span class="cluster-text">${cluster.getChildCount()}</span>`,
        className: 'custom-cluster-icon',
        iconSize: L.point(40, 40, true),
    });
};

// Component to fly to a position
const FlyToPosition = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, 16, {
                animate: true,
                duration: 0.8
            });
        }
    }, [position, map]);

    return null;
};

// Custom Zoom Controls Component
const ZoomControls = () => {
    const map = useMap();

    const handleZoomIn = () => {
        map.zoomIn();
    };

    const handleZoomOut = () => {
        map.zoomOut();
    };

    return (
        <div className="absolute bottom-24 right-4 z-[999] flex flex-col gap-1">
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
    );
};

const JummahMap = ({ onMarkerClick, flyToMasjid }) => {
    // Bellandur coordinates
    const bellandurCenter = [12.9259, 77.6766];
    const [flyToPosition, setFlyToPosition] = useState(null);

    // Effect to handle flyToMasjid prop from parent
    useEffect(() => {
        if (flyToMasjid) {
            setFlyToPosition([flyToMasjid.lat, flyToMasjid.lng]);
        }
    }, [flyToMasjid]);

    // Handle marker click - center map on the marker
    const handleMarkerClick = (masjid) => {
        setFlyToPosition([masjid.lat, masjid.lng]);
        if (onMarkerClick) onMarkerClick(masjid);
    };

    return (
        <div className="w-full h-full relative">
            <MapContainer
                center={bellandurCenter}
                zoom={13}
                className="w-full h-full"
                zoomControl={false}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                {/* CartoDB Voyager TileLayer - Clean, pale background */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {/* Fly to selected position */}
                {flyToPosition && <FlyToPosition position={flyToPosition} />}

                {/* Custom Zoom Controls */}
                <ZoomControls />

                <MarkerClusterGroup
                    chunkedLoading
                    iconCreateFunction={createClusterCustomIcon}
                    maxClusterRadius={60}
                    spiderfyOnMaxZoom={true}
                >
                    {masjidsData.map((masjid) => (
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
        </div>
    );
};

export default JummahMap;
