
import type { LiveSession } from '@google/genai';
import type React from 'react';

export enum PageType {
  Clinic = 'clinic',
  Hospital = 'hospital',
  Pharmacy = 'pharmacy',
}

export interface Place {
  title: string;
  uri: string;
  distance?: string; // Assuming Gemini might provide this
  rating?: number;
  phone?: string;
}

export interface HealthRecord {
  id: string;
  name: string;
  type: 'prescription' | 'report' | 'test_result';
  date: string;
  fileUrl: string; // Using object URL for local files
  summary?: string;
}

// Fix: Add missing type definitions.
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface TranscriptionTurn {
  id: number;
  userInput: string;
  modelOutput: string;
}

export interface AppContextType {
  lastConversation: TranscriptionTurn | null;
  setLastConversation: React.Dispatch<React.SetStateAction<TranscriptionTurn | null>>;
  sessionPromise: Promise<LiveSession> | null;
  setSessionPromise: React.Dispatch<React.SetStateAction<Promise<LiveSession> | null>>;
}
