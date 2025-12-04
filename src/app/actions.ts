// src/app/actions.ts
'use server';

import { ai } from '@/ai/genkit';
import { analyzeRankModelResponses, type AnalyzeRankModelResponsesInput, type AnalyzeRankModelResponsesOutput } from '@/ai/flows/analyze-rank-model-responses';
import { transcribeAudio, type TranscribeAudioInput } from '@/ai/flows/transcribe-audio-flow';
import type { Message, RankedResponseItem, UserMessagePayload } from '@/lib/types';

const MODEL_CONFIG = [
  { id: "deepseek-r1", displayName: "Deepseek" },
  { id: "qwq-32b", displayName: "Qwen" },
  { id: "gemma-2-9b-cpt-sahabatai-instruct", displayName: "Gemma" },
  { id: "llama-3.3-nemotron-super-49b-v1", displayName: "Llama" },
];

export async function getRankedResponsesAction(
  userInput: string | UserMessagePayload, 
  conversationHistory: Message[], 
  inputLanguage: string
): Promise<RankedResponseItem | null> {
  if (!process.env.GOOGLE_API_KEY) {
    console.error("GOOGLE_API_KEY is not set.");
    throw new Error("Server configuration error: Missing API key.");
  }
  
  try {
    let historyContext = "This is the beginning of the conversation.";
    if (conversationHistory.length > 0) {
      historyContext = conversationHistory
        .slice(-4) 
        .map(msg => {
          if (msg.role === 'user') {
            if (typeof msg.content === 'string') {
              return `User: ${msg.content}`;
            } else if (typeof msg.content === 'object' && msg.content && 'text' in msg.content) {
              // UserMessagePayload
              const userPayload = msg.content as UserMessagePayload;
              let historyLine = `User: ${userPayload.text}`;
              if (userPayload.imageDataUri) {
                historyLine += " [Image Attached]";
              }
              return historyLine;
            }
            return "User: [Unsupported message format]";
          } else if (msg.role === 'assistant') {
            switch (msg.type) {
              case 'text':
                return `Assistant: ${msg.content as string}`;
              case 'single_model_response':
                const rankedContent = msg.content as RankedResponseItem;
                return `Assistant (recommended ${rankedContent.modelName}): ${rankedContent.responseText}`;
              case 'error':
                return `Assistant: (System note: I previously encountered an error: "${msg.content as string}")`;
              default:
                return `Assistant: (Received a message with an unknown type)`;
            }
          }
          return null; 
        })
        .filter(line => line !== null) 
        .join('\n');
      
      if (!historyContext.trim() && conversationHistory.length > 0) {
          historyContext = "No suitable conversation history context to display.";
      } else if (conversationHistory.length === 0) {
          historyContext = "This is the beginning of the conversation.";
      }
    }

    const modelPersonas = MODEL_CONFIG.map(model => ({ modelDisplayName: model.displayName }));

    let userPromptText: string;
    let userPromptImageDataUri: string | undefined;

    if (typeof userInput === 'string') {
      userPromptText = userInput;
    } else {
      userPromptText = userInput.text;
      userPromptImageDataUri = userInput.imageDataUri;
    }

    const flowInput: AnalyzeRankModelResponsesInput = {
      userPromptText,
      userPromptImageDataUri,
      conversationHistory: historyContext,
      modelPersonas,
      inputLanguage,
    };
    
    const rankedResponsesOutput: AnalyzeRankModelResponsesOutput = await analyzeRankModelResponses(flowInput);

    if (!rankedResponsesOutput || rankedResponsesOutput.length === 0) {
      console.warn("No ranked responses received from analyzeRankModelResponses flow.");
      return null;
    }

    const sortedRankedResponses = rankedResponsesOutput.sort((a, b) => b.accuracy - a.accuracy);
    
    const topResponse = sortedRankedResponses[0];
    
    if (!topResponse) {
        console.warn("Top response is undefined after sorting.");
        return null;
    }
    
    return {
        modelName: topResponse.modelName,
        responseText: topResponse.responseText,
        accuracy: topResponse.accuracy,
    };

  } catch (error) {
    console.error("Error in getRankedResponsesAction:", error);
    if (error instanceof Error) {
      throw new Error(`AI interaction failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching AI responses.");
  }
}

export async function transcribeAudioAction(audioDataUri: string): Promise<string | null> {
  if (!process.env.GOOGLE_API_KEY) {
    console.error("GOOGLE_API_KEY is not set for transcription.");
    return null; 
  }

  try {
    const input: TranscribeAudioInput = { audioDataUri };
    const transcribedText = await transcribeAudio(input);
    return transcribedText;
  } catch (error) {
    console.error("Error in transcribeAudioAction:", error);
    return null; 
  }
}
