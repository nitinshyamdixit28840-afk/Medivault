
import React from 'react';

const MetricCard: React.FC<{ title: string; value: string; unit: string; color: string }> = ({ title, value, unit, color }) => (
    <div className={`bg-white p-6 rounded-xl shadow-lg border-l-4 ${color}`}>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-3xl font-bold text-gray-800">
            {value} <span className="text-lg font-medium text-gray-600">{unit}</span>
        </p>
    </div>
);

const HealthMonitorPage: React.FC = () => {
    // Mock data
    const healthMetrics = [
        { title: 'Heart Rate', value: '72', unit: 'bpm', color: 'border-red-500' },
        { title: 'Blood Pressure', value: '120/80', unit: 'mmHg', color: 'border-blue-500' },
        { title: 'Blood Sugar', value: '95', unit: 'mg/dL', color: 'border-yellow-500' },
        { title: 'Steps Today', value: '8,452', unit: 'steps', color: 'border-green-500' },
    ];

    return (
        <div className="container mx-auto max-w-7xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Health Monitor</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {healthMetrics.map(metric => (
                    <MetricCard key={metric.title} {...metric} />
                ))}
            </div>
            <div className="mt-8 bg-white p-6 rounded-xl shadow-lg text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Coming Soon</h2>
                <p className="text-gray-600">
                    Detailed charts and history will be available here. Connect your fitness devices for automatic tracking!
                </p>
            </div>
        </div>
    );
};

export default HealthMonitorPage;
