'use server';
/**
 * @fileOverview Selects the most relevant NVIDIA model for a given user prompt.
 *
 * - selectRelevantModel - A function that takes a user prompt and returns the name of the most relevant NVIDIA model.
 * - SelectRelevantModelInput - The input type for the selectRelevantModel function.
 * - SelectRelevantModelOutput - The return type for the selectRelevantModel function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SelectRelevantModelInputSchema = z.object({
  prompt: z.string().describe('The user prompt to find the most relevant NVIDIA model for.'),
  nvidiaApiKey: z.string().describe('The NVIDIA API key to use for model selection.'),
});
export type SelectRelevantModelInput = z.infer<typeof SelectRelevantModelInputSchema>;

const SelectRelevantModelOutputSchema = z.object({
  modelName: z.string().describe('The name of the most relevant NVIDIA model.'),
  reason: z.string().describe('Explanation of why the model was selected.'),
});
export type SelectRelevantModelOutput = z.infer<typeof SelectRelevantModelOutputSchema>;

export async function selectRelevantModel(input: SelectRelevantModelInput): Promise<SelectRelevantModelOutput> {
  return selectRelevantModelFlow(input);
}

const modelSelectionPrompt = ai.definePrompt({
  name: 'modelSelectionPrompt',
  input: {schema: SelectRelevantModelInputSchema},
  output: {schema: SelectRelevantModelOutputSchema},
  prompt: `You are an AI model selector assistant. Given a user prompt, you will select the most relevant NVIDIA model to use.

  NVIDIA API Key: {{{nvidiaApiKey}}}

  User Prompt: {{{prompt}}}

  Consider these models:
  - image-model-1
  - text-model-2
  - audio-model-3

  Return the model name and your reasoning for the selection.
  DO NOT call any external tools or APIs other than retrieving the model name.
`,
});

const selectRelevantModelFlow = ai.defineFlow(
  {
    name: 'selectRelevantModelFlow',
    inputSchema: SelectRelevantModelInputSchema,
    outputSchema: SelectRelevantModelOutputSchema,
  },
  async input => {
    const {output} = await modelSelectionPrompt(input);
    return output!;
  }
);
