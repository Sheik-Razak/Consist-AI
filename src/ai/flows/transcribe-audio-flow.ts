
'use server';
/**
 * @fileOverview A Genkit flow to transcribe audio using a multimodal model.
 *
 * - transcribeAudio - A function that handles the audio transcription.
 * - TranscribeAudioInput - The input type for the transcribeAudio function.
 * - TranscribeAudioOutput - The return type for the transcribeAudio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "Audio data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

// Output schema expects just the transcribed text.
const TranscribeAudioOutputSchema = z.object({
  transcribedText: z.string().describe('The transcribed text from the audio.'),
});
// We will not export this type as the wrapper function `transcribeAudio` will return a string.

export async function transcribeAudio(input: TranscribeAudioInput): Promise<string> {
  const result = await transcribeAudioFlow(input);
  if (!result || !result.transcribedText) {
    console.warn("Transcription flow returned an empty or invalid result.");
    // Consider throwing an error here or returning a specific string indicating failure
    // For now, returning an empty string if transcription is not successful.
    return ""; 
  }
  return result.transcribedText;
}

const transcribeAudioPrompt = ai.definePrompt({
  name: 'transcribeAudioPrompt',
  input: {schema: TranscribeAudioInputSchema},
  output: {schema: TranscribeAudioOutputSchema},
  // Prompt asking the model to transcribe the audio.
  // It's crucial to guide the model to return *only* the text.
  prompt: `You are an audio transcription service. Your task is to transcribe the provided audio accurately.
Return ONLY the transcribed text. Do not add any conversational phrases, greetings, or explanations.

Audio for transcription:
{{media url=audioDataUri}}

Provide the transcription below:`,
});

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema, // Output from the flow is the full object
  },
  async (input: TranscribeAudioInput) => {
    // Using a model that supports multimodal input (audio).
    // Gemini models are suitable for this.
    const {output} = await transcribeAudioPrompt(input);

    if (!output || typeof output.transcribedText !== 'string') {
      console.error('Transcription prompt did not return the expected output format.', output);
      // This case should ideally be handled by a more robust error strategy,
      // perhaps by throwing an error that the calling action can catch.
      // For now, returning an empty transcribedText.
      return { transcribedText: "" };
    }
    return output; // Returns the object { transcribedText: "..." }
  }
);
