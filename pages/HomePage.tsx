
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { NAV_LINKS } from '../constants';

const HomePage: React.FC = () => {

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    const greeting = useMemo(getGreeting, []);

    const features = NAV_LINKS.filter(link => link.path !== '/');

    return (
        <div className="container mx-auto max-w-7xl">
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <h1 className="text-3xl font-bold text-gray-800">{greeting}!</h1>
                <p className="mt-2 text-gray-600">How are you feeling today? Welcome to your personal health assistant.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {features.map((feature) => (
                    <Link
                        key={feature.name}
                        to={feature.path}
                        className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl hover:bg-teal-50 transition-all duration-300"
                    >
                        <feature.icon className="w-12 h-12 text-teal-500 mb-4" />
                        <span className="text-lg font-semibold text-gray-700 text-center">{feature.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default HomePage;