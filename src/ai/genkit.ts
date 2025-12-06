import { genkit } from 'genkit';
import { googleAI, gemini } from '@genkit-ai/googleai';

const gemini20Flash = gemini('gemini-2.0-flash');

export const ai = genkit({
  plugins: [googleAI({ models: [gemini20Flash] })],
  model: gemini20Flash,
});
