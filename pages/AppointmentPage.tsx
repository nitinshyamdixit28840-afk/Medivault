
import React, { useState } from 'react';
import useLocation from '../hooks/useLocation';
import { findNearbyPlaces } from '../services/geminiService';
import PlaceCard from '../components/PlaceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Place } from '../types';
import { PageType } from '../types';

const AppointmentPage: React.FC = () => {
    const location = useLocation();
    const [specialty, setSpecialty] = useState('');
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);
    const [bookingConfirmation, setBookingConfirmation] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!specialty.trim()) {
            setError("Please enter a specialty.");
            return;
        }
        if (location.error) {
            setError(location.error);
            return;
        }
        if (!location.latitude || !location.longitude) {
            setError("Could not determine your location.");
            return;
        }

        setLoading(true);
        setSearched(true);
        setPlaces([]);
        setError(null);
        setBookingConfirmation(null);

        try {
            const [clinicsResponse, hospitalsResponse] = await Promise.all([
                findNearbyPlaces('clinic', location.latitude, location.longitude, specialty),
                findNearbyPlaces('hospital', location.latitude, location.longitude, specialty)
            ]);

            const clinicChunks = clinicsResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            const hospitalChunks = hospitalsResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            
            const allChunks = [...clinicChunks, ...hospitalChunks];

            if (allChunks.length > 0) {
                const extractedPlaces: Place[] = allChunks
                    .filter(chunk => chunk.maps)
                    .map(chunk => ({
                        title: chunk.maps.title || 'Unknown Place',
                        uri: chunk.maps.uri || '',
                    }));
                setPlaces(extractedPlaces);
            } else {
                setError(`Could not find any facilities with a ${specialty}. Please try a different search term.`);
            }

        } catch (err) {
            console.error('Failed to fetch specialists:', err);
            setError(`Failed to find specialists. Please check your connection and try again.`);
        } finally {
            setLoading(false);
        }
    };
    
    const handleBooking = (place: Place) => {
        setBookingConfirmation(`Your appointment request for ${place.title} has been sent! They will contact you shortly to confirm.`);
        window.scrollTo(0, 0);
    };

    return (
        <div className="container mx-auto max-w-7xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Book an Appointment</h1>
            
            {bookingConfirmation && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
                    <p className="font-bold">Success</p>
                    <p>{bookingConfirmation}</p>
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <form onSubmit={handleSearch}>
                    <label htmlFor="specialty-search" className="block text-lg font-medium text-gray-700 mb-2">
                        Find a Specialist (e.g., Cardiologist, Dermatologist)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            id="specialty-search"
                            value={specialty}
                            onChange={(e) => setSpecialty(e.target.value)}
                            placeholder="Enter medical specialty..."
                            className="flex-grow w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
                        <button
                            type="submit"
                            disabled={loading || location.loading}
                            className="bg-teal-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-600 disabled:bg-gray-400 transition duration-300"
                        >
                            {loading || location.loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>
            </div>
            
            {loading && <LoadingSpinner message="Finding specialists near you..." />}
            {error && <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>}
            
            {!loading && searched && places.length === 0 && !error && (
                <div className="text-center text-gray-500">No facilities found for "{specialty}".</div>
            )}
            
            {places.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {places.map((place, index) => (
                        <PlaceCard key={`${place.uri}-${index}`} place={place} type={PageType.Clinic} onBook={handleBooking} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AppointmentPage;