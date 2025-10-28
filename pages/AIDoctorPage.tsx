
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { startLiveConversation, createAudioBlob } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import { MicrophoneIcon } from '../constants';
import type { TranscriptionTurn } from '../types';
import { useAppContext } from '../context/AppContext';
import { LiveServerMessage } from '@google/genai';

const DoctorAvatar: React.FC<{ isSpeaking: boolean }> = ({ isSpeaking }) => (
    <div className={`relative w-32 h-32 rounded-full overflow-hidden transition-all duration-300 ${isSpeaking ? 'ring-4 ring-teal-400 ring-offset-2' : 'ring-2 ring-gray-300'}`}>
        <img src="https://picsum.photos/seed/doctor/200/200" alt="Doctor Avatar" className="w-full h-full object-cover" />
        <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-10 h-2 bg-white rounded-full transition-transform duration-200 ${isSpeaking ? 'scale-y-150' : 'scale-y-50'}`} style={{ transformOrigin: 'center' }}></div>
    </div>
);


const AIDoctorPage: React.FC = () => {
    const { setLastConversation, sessionPromise, setSessionPromise } = useAppContext();
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [status, setStatus] = useState('Disconnected. Press mic to start.');
    const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionTurn[]>([]);
    
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef<number>(0);

    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');

    const stopAudioPlayback = useCallback(() => {
        sourcesRef.current.forEach(source => {
            source.stop();
        });
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;
        setIsSpeaking(false);
    }, []);

    const handleOnMessage = useCallback(async (message: LiveServerMessage) => {
        if (message.serverContent?.outputTranscription) {
            currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
        }
        if (message.serverContent?.inputTranscription) {
            currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
        }

        if (message.serverContent?.turnComplete) {
            const userInput = currentInputTranscriptionRef.current;
            const modelOutput = currentOutputTranscriptionRef.current;
            if (userInput || modelOutput) {
                const newTurn = { userInput, modelOutput, id: Date.now() };
                setTranscriptionHistory(prev => [...prev, newTurn]);
                setLastConversation(newTurn);
            }
            currentInputTranscriptionRef.current = '';
            currentOutputTranscriptionRef.current = '';
        }

        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64Audio) {
            if (!outputAudioContextRef.current) {
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                outputAudioContextRef.current,
                24000,
                1
            );
            
            const source = outputAudioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContextRef.current.destination);
            
            const currentTime = outputAudioContextRef.current.currentTime;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, currentTime);

            setIsSpeaking(true);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            
            source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) {
                    setIsSpeaking(false);
                }
            };
            sourcesRef.current.add(source);
        }

        if (message.serverContent?.interrupted) {
            stopAudioPlayback();
        }
    }, [setLastConversation, stopAudioPlayback]);

    // Fix: Refactor startConversation to align with Gemini API guidelines.
    const startConversation = async () => {
        setIsListening(true);
        setStatus('Connecting...');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
            scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);

            const newSessionPromise = startLiveConversation({
                onOpen: () => {
                    setStatus('Connected. Speak now.');
                    scriptProcessorRef.current!.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createAudioBlob(inputData);
                        // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`, **do not** add other condition checks.
                        newSessionPromise.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    mediaStreamSourceRef.current!.connect(scriptProcessorRef.current!);
                    scriptProcessorRef.current!.connect(inputAudioContextRef.current!.destination);
                },
                onMessage: handleOnMessage,
                onError: (e) => {
                    console.error('Session error:', e);
                    setStatus(`Error: ${e.type}. Please try again.`);
                    stopConversation();
                },
                onClose: () => {
                    setStatus('Disconnected. Press mic to start.');
                }
            });
            setSessionPromise(newSessionPromise);
        } catch (error) {
            console.error('Failed to start microphone:', error);
            setStatus('Could not access microphone.');
            setIsListening(false);
        }
    };
    
    const stopConversation = useCallback(async () => {
        setIsListening(false);
        setStatus('Disconnecting...');
        
        if (sessionPromise) {
            try {
                const session = await sessionPromise;
                session.close();
            } catch (e) {
                console.error("Error closing session", e);
            }
        }
        setSessionPromise(null);

        scriptProcessorRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        inputAudioContextRef.current?.close();

        stopAudioPlayback();
        outputAudioContextRef.current?.close();
        
        scriptProcessorRef.current = null;
        mediaStreamSourceRef.current = null;
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;
        
        setStatus('Disconnected. Press mic to start.');
    }, [sessionPromise, setSessionPromise, stopAudioPlayback]);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            stopConversation();
        };
    }, [stopConversation]);

    return (
        <div className="flex flex-col h-full max-h-[85vh] items-center text-center p-4">
            <DoctorAvatar isSpeaking={isSpeaking} />
            <p className="mt-4 text-gray-600 font-medium">{status}</p>

            <div className="flex-grow w-full max-w-2xl mt-6 overflow-y-auto bg-white rounded-lg shadow p-4 space-y-4">
                {transcriptionHistory.length === 0 && (
                    <p className="text-gray-400 text-center py-10">Conversation will appear here...</p>
                )}
                {transcriptionHistory.map((turn) => (
                    <div key={turn.id}>
                        {turn.userInput && <div className="text-right"><span className="inline-block p-2 bg-blue-100 rounded-lg">{turn.userInput}</span></div>}
                        {turn.modelOutput && <div className="text-left mt-2"><span className="inline-block p-2 bg-gray-100 rounded-lg">{turn.modelOutput}</span></div>}
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <button
                    onClick={isListening ? stopConversation : startConversation}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                        isListening ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300' : 'bg-teal-500 hover:bg-teal-600 focus:ring-teal-300'
                    }`}
                >
                    <MicrophoneIcon className="w-10 h-10 text-white" />
                </button>
            </div>
        </div>
    );
};

export default AIDoctorPage;
