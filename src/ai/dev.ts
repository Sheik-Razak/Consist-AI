
import { config } from 'dotenv';
config();

import '@/ai/flows/select-relevant-model.ts';
import '@/ai/flows/analyze-rank-model-responses.ts';
import '@/ai/flows/transcribe-audio-flow.ts';
// import '@/ai/tools/current-date-time-tool.ts'; // Removed date access tool
