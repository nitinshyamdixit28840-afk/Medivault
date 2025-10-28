import React, { useState, useRef, ChangeEvent } from 'react';
import type { HealthRecord } from '../types';
import { summarizeHealthRecord } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';

const HealthRecordPage: React.FC = () => {
    const [records, setRecords] = useState<HealthRecord[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
    const [summarizing, setSummarizing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const newRecord: HealthRecord = {
                id: `record-${Date.now()}`,
                name: file.name,
                type: 'report',
                date: new Date().toLocaleDateString(),
                fileUrl: URL.createObjectURL(file),
            };
            setRecords(prev => [...prev, newRecord]);
        }
    };
    
    const handleSummarize = async (record: HealthRecord) => {
        if (!record.fileUrl.startsWith('blob:')) return;
        
        setSelectedRecord(record);
        setSummarizing(true);
        
        try {
            const response = await fetch(record.fileUrl);
            const blob = await response.blob();
            
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64data = (reader.result as string).split(',')[1];
                const summary = await summarizeHealthRecord(base64data, blob.type);
                
                setRecords(prev => prev.map(r => r.id === record.id ? { ...r, summary } : r));
                setSelectedRecord(rec => rec && rec.id === record.id ? { ...rec, summary } : rec);
                setSummarizing(false);
            };
        } catch (error) {
            console.error('Summarization failed:', error);
            const updatedRecord = { ...record, summary: 'Could not summarize this record.' };
            setRecords(prev => prev.map(r => r.id === record.id ? updatedRecord : r));
            setSelectedRecord(updatedRecord);
            setSummarizing(false);
        }
    };

    return (
        <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Health Records</h1>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition duration-300 mb-4"
                >
                    Upload New Record
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <div className="space-y-3">
                    {records.map(record => (
                        <div key={record.id} onClick={() => setSelectedRecord(record)} className={`p-4 rounded-lg cursor-pointer transition ${selectedRecord?.id === record.id ? 'bg-teal-100 ring-2 ring-teal-500' : 'bg-white shadow-sm hover:bg-gray-50'}`}>
                            <p className="font-semibold text-gray-800">{record.name}</p>
                            <p className="text-sm text-gray-500">{record.date} - {record.type}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                {selectedRecord ? (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedRecord.name}</h2>
                        <iframe src={selectedRecord.fileUrl} className="w-full h-96 rounded-lg border mb-4" title={selectedRecord.name}></iframe>
                        <button 
                            onClick={() => handleSummarize(selectedRecord)}
                            disabled={summarizing || !!selectedRecord.summary}
                            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition duration-300"
                        >
                           {selectedRecord.summary ? 'Summarized' : (summarizing ? 'Summarizing...' : 'AI Summary')}
                        </button>

                        <div className="mt-4">
                            {summarizing && <LoadingSpinner message="AI is analyzing your report..." />}
                            {selectedRecord.summary && (
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">AI Summary</h3>
                                    <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-gray-600">
                                        {selectedRecord.summary}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <p>Select a record to view or upload a new one.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HealthRecordPage;