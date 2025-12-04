
'use server';

/**
 * @fileOverview This file defines a Genkit flow to simulate responses from multiple model personas
 * and then analyze and rank those responses using the Gemini API, considering user's input language
 * and optional image.
 *
 * - analyzeRankModelResponses - A function that takes user prompt (text and optional image), conversation history,
 *   model personas, and input language, simulates responses for each, and ranks them by accuracy.
 * - AnalyzeRankModelResponsesInput - The input type for the analyzeRankModelResponses function.
 * - AnalyzeRankModelResponsesOutput - The return type for the analyzeRankModelResponses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeRankModelResponsesInputSchema = z.object({
  userPromptText: z.string().describe("The user's current textual query."),
  userPromptImageDataUri: z.string().optional().describe("An optional image provided by the user, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  conversationHistory: z
    .string()
    .optional()
    .describe(
      'A summary of the recent conversation history for context. Should be a string with alternating User: and Assistant: lines.'
    ),
  modelPersonas: z
    .array(z.object({modelDisplayName: z.string()}))
    .describe('An array of model personas to simulate and rank.'),
  inputLanguage: z.string().optional().describe('The preferred language for the user query and AI response (e.g., "en-US", "hi-IN").'),
});
export type AnalyzeRankModelResponsesInput = z.infer<
  typeof AnalyzeRankModelResponsesInputSchema
>;

const AnalyzeRankModelResponsesOutputSchema = z.array(
  z.object({
    modelName: z.string().describe('The display name of the model persona.'),
    responseText: z
      .string()
      .describe('The simulated response text from the model persona.'),
    accuracy: z
      .number()
      .describe(
        'The accuracy score of the response (a number between 0.0 and 1.0).'
      ),
  })
);
export type AnalyzeRankModelResponsesOutput = z.infer<
  typeof AnalyzeRankModelResponsesOutputSchema
>;

export async function analyzeRankModelResponses(
  input: AnalyzeRankModelResponsesInput
): Promise<AnalyzeRankModelResponsesOutput> {
  return analyzeRankModelResponsesFlow(input);
}

const analyzeRankModelResponsesPrompt = ai.definePrompt({
  name: 'analyzeRankModelResponsesPrompt',
  input: {schema: AnalyzeRankModelResponsesInputSchema},
  output: {schema: AnalyzeRankModelResponsesOutputSchema},
  prompt: `You are an AI assistant. Your primary task is to respond to a user's query by first simulating how several different AI model personas would answer, ensuring these simulations are contextually relevant to the provided conversation history, and then analyzing and ranking these simulated responses.

User's Current Text Query: "{{userPromptText}}"
{{#if userPromptImageDataUri}}
The user has also provided the following image:
{{media url=userPromptImageDataUri}}
{{/if}}

{{#if conversationHistory}}
Conversation History (for context, use this to understand follow-up questions and maintain relevance):
{{{conversationHistory}}}
{{else}}
This is the beginning of the conversation.
{{/if}}

{{#if inputLanguage}}
The user has indicated their query is primarily in language code: {{inputLanguage}}. When simulating responses, please try to provide responses in this language if the model persona would naturally do so and is proficient. If not, or if the language code indicates English (e.g., "en-US", "en-GB"), respond in English.
{{else}}
The user's query is in English. Please provide simulated responses in English.
{{/if}}

Important Note: You do not have access to real-time information like the current date or time. If the user asks for such information, please state that you cannot provide it.

You need to simulate responses for the following model personas:
{{#each modelPersonas}}
- Model Persona: {{this.modelDisplayName}}
{{/each}}

Instructions:
1.  **Simulate Responses**: For each model persona listed above, generate a concise, helpful, and distinct response to the user's query. Each simulated response MUST take into account the \`conversationHistory\` (if provided) to ensure it is a logical continuation of the dialogue, as well as considering the current \`userPromptText\` and any \`userPromptImageDataUri\`.
    *   When generating the \`responseText\` for each persona, the persona should generally avoid self-referential statements about its own name (e.g., 'As Deepseek, I find...'), unless it's natural for the context of the query and the provided \`conversationHistory\`.
    *   {{#if inputLanguage}}Craft responses in the language indicated by '{{inputLanguage}}' if appropriate for the model persona and query context. Otherwise, use English.{{else}}Craft responses in English.{{/if}}
    *   If the user asks for the current date or time, the \`responseText\` for each persona should clearly state that this information is not available.
2.  **Analyze and Rank**: After generating all simulated responses, critically evaluate each one. Assign an accuracy score (a number between 0.0 and 1.0, where 1.0 is most accurate/relevant) to each simulated response based on its quality, relevance to the user's query (including any image and the full conversation history), and helpfulness.
3.  **Format Output**: Your complete output MUST be a single JSON array. Each object in the array must represent one of the simulated models and include:
    *   \`modelName\`: The display name of the model persona (e.g., "{{modelPersonas.[0].modelDisplayName}}").
    *   \`responseText\`: The text of the response you generated for this model persona (in the appropriate language as per above).
    *   \`accuracy\`: The numerical accuracy score (0.0-1.0) you assigned.

Example of a single object in the output array:
{
  "modelName": "ExampleModelY",
  "responseText": "This is a simulated response from ExampleModelY, continuing the previous conversation if relevant.",
  "accuracy": 0.90
}

Generate the JSON array. This array MUST contain one entry for EACH of the model personas specified in the input ({{#each modelPersonas}}"{{this.modelDisplayName}}"{{#unless @last}}, {{/unless}}{{/each}}). Ensure the accuracy score is a number between 0.0 and 1.0.
  `,
});

const analyzeRankModelResponsesFlow = ai.defineFlow(
  {
    name: 'analyzeRankModelResponsesFlow',
    inputSchema: AnalyzeRankModelResponsesInputSchema,
    outputSchema: AnalyzeRankModelResponsesOutputSchema,
  },
  async input => {
    const {output} = await analyzeRankModelResponsesPrompt(input);
    if (output && !Array.isArray(output)) {
        // Attempt to gracefully handle if the LLM returns a single object instead of an array
        if (typeof output === 'object' && output !== null && 'modelName' in output && 'responseText' in output && 'accuracy' in output) {
            console.warn("analyzeRankModelResponsesPrompt returned a single object, wrapping in array. Consider revising prompt for consistent array output.", output);
            return [output as any]; // Cast to 'any' as it matches the structure of an array element
        }
        // If it's not an array and not the expected single object, it's an unexpected format.
        console.warn("analyzeRankModelResponsesPrompt returned non-array and non-object, returning empty array. Prompt output:", output);
        return [];
    }
    if (!output) {
      console.warn("analyzeRankModelResponsesPrompt returned null or undefined, returning empty array.");
      return [];
    }
    // Ensure all persona responses are present, even if the AI forgets some.
    // This part is tricky as the AI generates the content. The prompt now strongly encourages one entry per persona.
    // A more robust solution might involve post-processing or multiple calls if the AI misses personas.
    return output;
  }
);

