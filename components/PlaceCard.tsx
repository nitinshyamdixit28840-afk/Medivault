
import React from 'react';
import type { Place } from '../types';
import { PhoneIcon, DirectionsIcon, ClinicIcon, HospitalIcon, PharmacyIcon, CalendarIcon } from '../constants';
import { PageType } from '../types';

interface PlaceCardProps {
  place: Place;
  type: PageType;
  onBook?: (place: Place) => void;
}

const getIcon = (type: PageType) => {
    switch (type) {
        case PageType.Clinic:
            return <ClinicIcon className="w-8 h-8 text-teal-500" />;
        case PageType.Hospital:
            return <HospitalIcon className="w-8 h-8 text-red-500" />;
        case PageType.Pharmacy:
            return <PharmacyIcon className="w-8 h-8 text-blue-500" />;
    }
}


const PlaceCard: React.FC<PlaceCardProps> = ({ place, type, onBook }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105 duration-300 flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
                {getIcon(type)}
            </div>
            <div className="flex-1">
                <div className="uppercase tracking-wide text-sm text-teal-600 font-bold">{place.title}</div>
                {place.distance && <p className="mt-1 text-gray-500">{place.distance}</p>}
                {place.rating && <p className="mt-1 text-gray-500">Rating: {place.rating} / 5</p>}
            </div>
        </div>
      </div>
      <div className="p-6 bg-gray-50 flex justify-end items-center space-x-3">
          {onBook && (
             <button onClick={() => onBook(place)} className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Book
            </button>
          )}
          {place.phone && (
            <a href={`tel:${place.phone}`} className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              <PhoneIcon className="w-4 h-4 mr-2" />
              Call
            </a>
          )}
          <a href={place.uri} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
            <DirectionsIcon className="w-4 h-4 mr-2" />
            Directions
          </a>
        </div>
    </div>
  );
};

export default PlaceCard;