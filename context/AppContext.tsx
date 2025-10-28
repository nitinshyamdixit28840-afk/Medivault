
import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { AppContextType, TranscriptionTurn } from '../types';
import type { LiveSession } from '@google/genai';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [lastConversation, setLastConversation] = useState<TranscriptionTurn | null>(null);
    const [sessionPromise, setSessionPromise] = useState<Promise<LiveSession> | null>(null);

    return (
        <AppContext.Provider value={{ lastConversation, setLastConversation, sessionPromise, setSessionPromise }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppContextProvider');
    }
    return context;
};
