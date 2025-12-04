// src/lib/types.ts
export interface RankedResponseItem {
  modelName: string;
  responseText: string;
  accuracy: number;
  reason?: string;
}

export interface UserMessagePayload {
  text: string;
  imageDataUri?: string;
}

export type MessageContent = string | RankedResponseItem | UserMessagePayload;

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  type: 'text' | 'single_model_response' | 'error';
  content: MessageContent;
  timestamp: Date;
}
