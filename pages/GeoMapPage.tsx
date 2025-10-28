
import React, { useEffect, useState, useMemo } from 'react';
import useLocation from '../hooks/useLocation';
import { findNearbyPlaces } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Place } from '../types';
import { PageType } from '../types';
import { ClinicIcon, HospitalIcon, PharmacyIcon, PhoneIcon, DirectionsIcon } from '../constants';

type CombinedPlace = Place & {
  type: PageType;
  position: { top: string; left: string; };
};

const getIcon = (type: PageType, className: string) => {
    switch(type) {
        case PageType.Clinic: return <ClinicIcon className={`${className} text-teal-600`} />;
        case PageType.Hospital: return <HospitalIcon className={`${className} text-red-500`} />;
        case PageType.Pharmacy: return <PharmacyIcon className={`${className} text-blue-500`} />;
    }
};

const InfoWindow: React.FC<{ place: CombinedPlace; onClose: () => void }> = ({ place, onClose }) => {
    return (
        <div className="absolute z-20 bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-md bg-white rounded-xl shadow-2xl p-4 animate-fade-in-up">
            <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                    {getIcon(place.type, "w-8 h-8 flex-shrink-0")}
                    <div>
                        <h3 className="font-bold text-gray-800">{place.title}</h3>
                        <p className="text-sm text-gray-500 capitalize">{place.type}</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
                {place.phone && (
                    <a href={`tel:${place.phone}`} className="flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                        <PhoneIcon className="w-3 h-3 mr-1.5" /> Call
                    </a>
                )}
                <a href={place.uri} target="_blank" rel="noopener noreferrer" className="flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <DirectionsIcon className="w-3 h-3 mr-1.5" /> Directions
                </a>
            </div>
        </div>
    );
};

const GeoMapPage: React.FC = () => {
    const location = useLocation();
    const [places, setPlaces] = useState<CombinedPlace[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlace, setSelectedPlace] = useState<CombinedPlace | null>(null);
    
    const stablePositions = useMemo(() => {
        const positions: { top: string; left: string }[] = [];
        for (let i = 0; i < 50; i++) { // Generate more positions than likely needed
            positions.push({
                top: `${Math.random() * 85 + 5}%`,
                left: `${Math.random() * 90 + 5}%`
            });
        }
        return positions;
    }, []);

    useEffect(() => {
        const fetchAllPlaces = async (latitude: number, longitude: number) => {
            try {
                setLoading(true);
                setError(null);
                const placeTypes: PageType[] = [PageType.Clinic, PageType.Hospital, PageType.Pharmacy];
                const responses = await Promise.all(
                    placeTypes.map(type => findNearbyPlaces(type, latitude, longitude))
                );

                let allPlaces: CombinedPlace[] = [];
                let posIndex = 0;

                responses.forEach((response, index) => {
                    const type = placeTypes[index];
                    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
                    if (chunks && Array.isArray(chunks)) {
                        const extracted = chunks
                            .filter(chunk => chunk.maps)
                            .map(chunk => {
                                const place: CombinedPlace = {
                                    title: chunk.maps.title || 'Unknown Place',
                                    uri: chunk.maps.uri || '',
                                    type: type,
                                    position: stablePositions[posIndex % stablePositions.length]
                                };
                                posIndex++;
                                return place;
                            });
                        allPlaces = [...allPlaces, ...extracted];
                    }
                });

                if (allPlaces.length === 0) {
                     setError("Could not find any healthcare facilities nearby.");
                }

                setPlaces(allPlaces);

            } catch (err) {
                console.error("Failed to fetch places for map:", err);
                setError("Failed to load map data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (location.latitude && location.longitude) {
            fetchAllPlaces(location.latitude, location.longitude);
        } else if (location.error) {
            setError(location.error);
            setLoading(false);
        }
    }, [location, stablePositions]);


    return (
        <div className="container mx-auto max-w-7xl h-full flex flex-col">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 flex-shrink-0">Geo-Health Map</h1>
            
            <div className="flex-grow bg-teal-50 rounded-xl shadow-inner relative overflow-hidden">
                {loading || location.loading ? <LoadingSpinner message="Loading map data..."/> :
                 error ? <div className="flex items-center justify-center h-full text-red-500">{error}</div> :
                 (
                    <>
                        {places.map((place, index) => (
                            <button
                                key={`${place.uri}-${index}`}
                                className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 focus:outline-none"
                                style={{ top: place.position.top, left: place.position.left }}
                                onClick={() => setSelectedPlace(place)}
                                aria-label={`View details for ${place.title}`}
                            >
                               {getIcon(place.type, "w-8 h-8 drop-shadow-lg")}
                            </button>
                        ))}
                        {selectedPlace && <InfoWindow place={selectedPlace} onClose={() => setSelectedPlace(null)} />}
                    </>
                 )
                }
            </div>
             <div className="flex-shrink-0 flex items-center justify-center space-x-6 py-4">
                <div className="flex items-center space-x-2"><ClinicIcon className="w-5 h-5 text-teal-500" /> <span className="text-sm">Clinic</span></div>
                <div className="flex items-center space-x-2"><HospitalIcon className="w-5 h-5 text-red-500" /> <span className="text-sm">Hospital</span></div>
                <div className="flex items-center space-x-2"><PharmacyIcon className="w-5 h-5 text-blue-500" /> <span className="text-sm">Pharmacy</span></div>
            </div>
        </div>
    );
};

export default GeoMapPage;