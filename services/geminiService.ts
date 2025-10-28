import { GoogleGenAI, GenerateContentResponse, Chat, LiveSession, LiveServerMessage, Modality, Blob } from "@google/genai";
import { encode } from '../utils/audioUtils';

// This function should be called ONLY when you are ready to make an API call.
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });


export async function findNearbyPlaces(
  placeType: 'clinic' | 'hospital' | 'pharmacy',
  latitude: number,
  longitude: number,
  specialty?: string,
): Promise<GenerateContentResponse> {
  const ai = getAiClient();
  const prompt = specialty
    ? `Find nearby ${placeType}s with a ${specialty}.`
    : `Find nearby ${placeType}s.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude,
            longitude,
          },
        },
      },
    },
  });

  return response;
}

export async function summarizeHealthRecord(base64Image: string, mimeType: string): Promise<string> {
    const ai = getAiClient();
    const imagePart = {
        inlineData: {
            mimeType: mimeType,
            data: base64Image,
        },
    };
    const textPart = {
        text: 'Please summarize this medical report in simple, easy-to-understand language for a patient. Explain what the key findings mean.'
    };
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [imagePart, textPart] },
    });

    return response.text;
}

export async function generatePrescription(
    age: string,
    gender: string,
    symptoms: string,
    severity: string,
    details: string,
): Promise<string> {
    const ai = getAiClient();
    const prompt = `
        You are an expert medical AI. Your task is to generate a *sample* medical prescription based on the user's provided symptoms.
        This is for informational purposes ONLY and is NOT a real medical prescription.

        User's Information:
        - Age: ${age}
        - Gender: ${gender}
        - Symptoms: ${symptoms}
        - Severity: ${severity}
        - Other Details: ${details}

        Please generate a response formatted like a standard prescription. Use Markdown for formatting. Include the following sections with these exact headings:
        ### Preliminary Diagnosis
        ### Medication
        ### Dosage and Instructions
        ### General Advice
        ### **IMPORTANT DISCLAIMER**
        
        The disclaimer MUST state clearly: "This is an AI-generated prescription suggestion and is not a substitute for professional medical advice. Consult a qualified healthcare provider before taking any medication or making any health decisions."
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    
    return response.text;
}

// Fix: Add missing function to start a chat session.
export function startChat(): Chat {
  const ai = getAiClient();
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
        systemInstruction: `You are Medivault, an AI Medical Information Assistant. Your role is to provide helpful information about medical conditions, symptoms, and potential medications for informational purposes. When a user asks for advice about a non-emergency condition, you can suggest potential remedies or over-the-counter medications. However, you must ALWAYS include the following disclaimer in your response: '**Disclaimer: I am an AI assistant and not a medical professional. The information I provide is for educational purposes only and should not be considered medical advice. Please consult with a qualified healthcare provider for any health concerns or before starting any new treatment.**' You should avoid simply telling the user to see a doctor as your primary response, instead providing the requested information followed by the mandatory disclaimer.`
    }
  });
  return chat;
}

// Fix: Add missing functions for live conversation.
interface LiveConversationCallbacks {
  onOpen: () => void;
  onMessage: (message: LiveServerMessage) => void;
  onError: (error: ErrorEvent) => void;
  onClose: (event: CloseEvent) => void;
}

export function startLiveConversation(callbacks: LiveConversationCallbacks): Promise<LiveSession> {
  const ai = getAiClient();
  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks: {
      onopen: callbacks.onOpen,
      onmessage: callbacks.onMessage,
      onerror: callbacks.onError,
      onclose: callbacks.onClose,
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      systemInstruction: 'You are a friendly and helpful AI doctor. Provide supportive and informative responses, but always remind the user to consult a real healthcare professional for medical advice.',
    },
  });
  return sessionPromise;
}

export function createAudioBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}