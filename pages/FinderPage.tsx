
import React, { useEffect, useState } from 'react';
import useLocation from '../hooks/useLocation';
import { findNearbyPlaces } from '../services/geminiService';
import PlaceCard from '../components/PlaceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Place, PageType } from '../types';

interface FinderPageProps {
  pageType: 'clinic' | 'hospital' | 'pharmacy';
}

const FinderPage: React.FC<FinderPageProps> = ({ pageType }) => {
  const location = useLocation();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageTitles = {
    clinic: 'Nearby Clinics',
    hospital: 'Nearby Hospitals',
    pharmacy: 'Nearby Pharmacies'
  };

  useEffect(() => {
    const fetchPlaces = async (latitude: number, longitude: number) => {
      try {
        setLoading(true);
        setError(null);
        const response = await findNearbyPlaces(pageType, latitude, longitude);
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        if (groundingChunks && Array.isArray(groundingChunks)) {
            const extractedPlaces: Place[] = groundingChunks
                .filter(chunk => chunk.maps)
                .map(chunk => ({
                    title: chunk.maps.title || 'Unknown Place',
                    uri: chunk.maps.uri || '',
                }));
            setPlaces(extractedPlaces);
        } else {
            setError("Could not find any places. The AI might not have information for your area.");
        }

      } catch (err) {
        console.error(`Failed to fetch ${pageType}s:`, err);
        setError(`Failed to find nearby ${pageType}s. Please check your connection and try again.`);
      } finally {
        setLoading(false);
      }
    };

    if (location.latitude && location.longitude) {
      fetchPlaces(location.latitude, location.longitude);
    } else if (location.error) {
      setError(location.error);
      setLoading(false);
    }
  }, [location, pageType]);
  
  const renderContent = () => {
    if (loading || location.loading) {
      return <LoadingSpinner message={`Finding ${pageType}s near you...`} />;
    }
    if (error) {
      return <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>;
    }
    if (places.length === 0) {
      return <div className="text-center text-gray-500">No {pageType}s found nearby.</div>;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((place, index) => (
          <PlaceCard key={index} place={place} type={pageType as PageType} />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-7xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{pageTitles[pageType]}</h1>
      {renderContent()}
    </div>
  );
};

export default FinderPage;
