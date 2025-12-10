import { GoogleGenAI, Type, LiveServerMessage, Modality } from "@google/genai";
import { QuizQuestion } from "../types";
import { bytesToBase64, createPcmBlob, decodeAudioData, base64ToBytes } from "./utils";

// Initialize the client. We assume process.env.API_KEY is available.
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Image Analysis ---
export async function analyzeImage(file: File, prompt: string): Promise<string> {
  const ai = getAiClient();
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve, reject) => {
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const base64Data = await base64Promise;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: file.type,
            data: base64Data
          }
        },
        { text: prompt }
      ]
    }
  });

  return response.text || "Could not analyze the image.";
}

// --- Text Summarization ---
export async function summarizeText(text: string): Promise<string> {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-flash-lite-latest',
    contents: `Please summarize the following text into clear, concise bullet points:\n\n${text}`,
  });
  return response.text || "Could not summarize text.";
}

// --- Quiz Generation ---
export async function generateQuiz(topic: string, count: number = 5): Promise<QuizQuestion[]> {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate a quiz with ${count} multiple-choice questions about "${topic}".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswerIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswerIndex", "explanation"]
        }
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as QuizQuestion[];
  }
  return [];
}

// --- Study Planner ---
export async function generateStudyPlan(subject: string, examDate: string, useSearch: boolean): Promise<string> {
  const ai = getAiClient();
  const tools = useSearch ? [{ googleSearch: {} }] : [];
  
  const response = await ai.models.generateContent({
    model: useSearch ? 'gemini-2.5-flash' : 'gemini-3-pro-preview',
    contents: `Create a detailed day-wise study plan for the subject "${subject}". The exam is on ${examDate}. 
    Today is ${new Date().toLocaleDateString()}.
    Break it down by days, focusing on key topics. If search is enabled, include relevant recent resources or links.`,
    config: {
      tools: tools
    }
  });

  let text = response.text || "Could not generate plan.";
  
  // Append search grounding if available
  if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
    const chunks = response.candidates[0].groundingMetadata.groundingChunks;
    const links = chunks
      .map((chunk: any) => chunk.web?.uri ? `- [${chunk.web.title || 'Source'}](${chunk.web.uri})` : null)
      .filter(Boolean)
      .join('\n');
    
    if (links) {
      text += `\n\n### References\n${links}`;
    }
  }

  return text;
}

// --- Concept Visualization (SVG) ---
export async function generateConceptMap(topic: string): Promise<string> {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Create a simple SVG diagram or mind map explaining the concept: "${topic}". 
    Return ONLY the raw SVG code. No markdown code blocks. 
    The SVG should have a white background, use clear text, and be responsive (viewBox).`,
  });

  let svg = response.text || "";
  // Cleanup if model adds markdown blocks
  svg = svg.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```/g, '').trim();
  return svg;
}

// --- Video Generation ---
export async function generateVideo(prompt: string): Promise<string | null> {
  // Ensure we have a fresh client with the potentially selected key
  const ai = getAiClient();
  
  // We must handle the Veo logic.
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  // Polling loop
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (videoUri) {
     // Append key for fetching
     return `${videoUri}&key=${process.env.API_KEY}`;
  }
  return null;
}

// --- Live Tutor (Real-time) ---
export class LiveTutorClient {
  private session: any = null; // Type 'Session' is internal to genai
  private inputContext: AudioContext | null = null;
  private outputContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private outputNode: GainNode | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  
  constructor(
    private onConnect: () => void,
    private onDisconnect: () => void,
    private onError: (err: any) => void,
    private onVolumeChange: (vol: number) => void // Simple visualizer callback
  ) {}

  async connect() {
    const ai = getAiClient();
    
    this.inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    this.outputNode = this.outputContext!.createGain();
    this.outputNode.connect(this.outputContext!.destination);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          this.onConnect();
          this.setupAudioInput(stream, sessionPromise);
        },
        onmessage: async (message: LiveServerMessage) => {
          this.handleMessage(message);
        },
        onerror: (e: any) => {
          this.onError(e);
        },
        onclose: () => {
          this.onDisconnect();
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        },
        systemInstruction: "You are Smart StudyMate, a helpful, patient, and encouraging AI tutor. Help the student understand concepts step-by-step. Keep answers concise and clear."
      }
    });
    
    // Store session promise wrapper for manual disconnect if needed, 
    // but we primarily rely on the internal session object once resolved.
    this.session = sessionPromise;
  }

  private setupAudioInput(stream: MediaStream, sessionPromise: Promise<any>) {
    if (!this.inputContext) return;
    
    this.inputSource = this.inputContext.createMediaStreamSource(stream);
    this.processor = this.inputContext.createScriptProcessor(4096, 1, 1);
    
    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate volume for visualizer
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      this.onVolumeChange(rms);

      const pcmBlob = createPcmBlob(inputData);
      
      sessionPromise.then(session => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    this.inputSource.connect(this.processor);
    this.processor.connect(this.inputContext.destination);
  }

  private async handleMessage(message: LiveServerMessage) {
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio && this.outputContext && this.outputNode) {
        this.nextStartTime = Math.max(this.nextStartTime, this.outputContext.currentTime);
        
        const audioBuffer = await decodeAudioData(
            base64ToBytes(base64Audio),
            this.outputContext,
            24000
        );
        
        const source = this.outputContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.outputNode);
        
        source.addEventListener('ended', () => {
            this.sources.delete(source);
        });
        
        source.start(this.nextStartTime);
        this.nextStartTime += audioBuffer.duration;
        this.sources.add(source);
    }
    
    if (message.serverContent?.interrupted) {
        this.sources.forEach(s => s.stop());
        this.sources.clear();
        this.nextStartTime = 0;
    }
  }

  async disconnect() {
    if (this.session) {
      // session is a promise, wait for it then close
      this.session.then((s: any) => s.close());
    }
    
    this.processor?.disconnect();
    this.inputSource?.disconnect();
    this.inputContext?.close();
    this.outputContext?.close();
    this.sources.forEach(s => s.stop());
    
    this.session = null;
    this.onDisconnect();
  }
}
