
import React, { useState, useRef, useEffect } from 'react';
import { startChat } from '../services/geminiService';
import type { Chat } from '@google/genai';
import type { ChatMessage } from '../types';

const DoctorAvatar: React.FC = () => (
    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
        <img src="https://picsum.photos/seed/doctor/100/100" alt="Doctor Avatar" className="w-full h-full object-cover" />
    </div>
);

const ChatbotPage: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatRef.current = startChat();
        setMessages([{ role: 'model', text: 'Hello! I am your AI Doctor. How can I help you today? Please remember, I am an AI assistant and not a substitute for professional medical advice.' }]);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            if (chatRef.current) {
                const response = await chatRef.current.sendMessage({ message: input });
                const modelMessage: ChatMessage = { role: 'model', text: response.text };
                setMessages(prev => [...prev, modelMessage]);
            }
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[85vh] bg-white rounded-xl shadow-lg">
            <header className="p-4 border-b">
                <h1 className="text-xl font-bold text-gray-800 text-center">AI Doctor Chatbot</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <DoctorAvatar />}
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-teal-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-end gap-3 justify-start">
                        <DoctorAvatar />
                        <div className="px-4 py-2 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none">
                            <div className="flex items-center space-x-1">
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <footer className="p-4 border-t bg-white rounded-b-xl">
                <form onSubmit={handleSend} className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-teal-500 focus:border-teal-500 transition"
                        disabled={isLoading}
                        aria-label="Chat input"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-full disabled:bg-gray-400 hover:bg-teal-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        aria-label="Send message"
                    >
                       Send
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatbotPage;
