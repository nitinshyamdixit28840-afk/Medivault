
import React, { useState } from 'react';
import { generatePrescription } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';

const PrescriptionGeneratorPage: React.FC = () => {
    const [formData, setFormData] = useState({
        age: '',
        gender: 'Prefer not to say',
        symptoms: '',
        severity: 'Mild',
        details: '',
    });
    const [prescription, setPrescription] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.symptoms.trim() || !formData.age.trim()) {
            setError("Please fill in at least your age and symptoms.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setPrescription(null);

        try {
            const result = await generatePrescription(
                formData.age,
                formData.gender,
                formData.symptoms,
                formData.severity,
                formData.details
            );
            setPrescription(result);
        } catch (err) {
            console.error("Prescription generation failed:", err);
            setError("Sorry, we couldn't generate a prescription at this time. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderFormattedPrescription = (text: string) => {
        const parts = text.split(/(### .*?\n)/).filter(Boolean);
        return parts.map((part, index) => {
            if (part.startsWith('### ')) {
                const title = part.replace('### ', '').trim();
                const content = parts[index + 1] || '';
                const isDisclaimer = title.toLowerCase().includes('disclaimer');
                return (
                    <div key={index} className={`mb-4 ${isDisclaimer ? 'p-4 bg-red-100 border-l-4 border-red-500 text-red-800' : ''}`}>
                         <h3 className={`text-lg font-bold mb-2 ${isDisclaimer ? 'text-red-900' : 'text-gray-800'}`}>{title}</h3>
                         <div className="text-gray-600 whitespace-pre-wrap">{content.trim()}</div>
                    </div>
                );
            }
            return null;
        }).filter(Boolean);
    };

    return (
        <div className="container mx-auto max-w-4xl">
             <h1 className="text-3xl font-bold text-gray-800 mb-4">AI Prescription Generator</h1>
             <div className="p-4 mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-r-lg">
                <p className="font-bold">Disclaimer:</p>
                <p>This tool generates a sample prescription for informational purposes only. It is NOT a substitute for professional medical advice. ALWAYS consult a qualified healthcare provider.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Describe Your Condition</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                                <input type="number" name="age" id="age" value={formData.age} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500" required />
                            </div>
                             <div>
                                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                                <select name="gender" id="gender" value={formData.gender} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500">
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                    <option>Prefer not to say</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">Symptoms</label>
                            <textarea name="symptoms" id="symptoms" value={formData.symptoms} onChange={handleInputChange} rows={4} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500" placeholder="e.g., Sore throat, headache, mild fever..." required></textarea>
                        </div>
                         <div>
                            <label htmlFor="severity" className="block text-sm font-medium text-gray-700">Severity</label>
                            <select name="severity" id="severity" value={formData.severity} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500">
                                <option>Mild</option>
                                <option>Moderate</option>
                                <option>Severe</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="details" className="block text-sm font-medium text-gray-700">Other Details</label>
                            <textarea name="details" id="details" value={formData.details} onChange={handleInputChange} rows={2} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500" placeholder="e.g., Symptoms started 2 days ago..."></textarea>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 transition duration-300">
                            {isLoading ? 'Generating...' : 'Generate Prescription'}
                        </button>
                    </form>
                </div>

                {/* Result Section */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Generated Prescription</h2>
                    {isLoading && <LoadingSpinner message="AI is preparing your sample prescription..."/>}
                    {error && <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>}
                    {prescription && (
                        <div className="space-y-4">
                            {renderFormattedPrescription(prescription)}
                        </div>
                    )}
                    {!isLoading && !prescription && !error && (
                        <div className="text-center text-gray-400 h-full flex items-center justify-center">
                            <p>Your sample prescription will appear here.</p>
                        </div>
                    )}
                </div>
             </div>
        </div>
    );
};

export default PrescriptionGeneratorPage;
