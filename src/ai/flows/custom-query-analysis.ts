'use server';

/**
 * @fileOverview Provides a personalized analysis of weather conditions based on a user's query.
 *
 * - analyzeCustomQuery - A function that takes weather data and a user query to return a custom analysis.
 * - CustomQueryAnalysisInput - The input type for the analyzeCustomQuery function.
 * - CustomQueryAnalysisOutput - The return type for the analyzeCustomQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomQueryAnalysisInputSchema = z.object({
  weatherData: z.string().describe('The weather forecast data in JSON format.'),
  query: z.string().describe('The user\'s specific question about the weather conditions (e.g., "likelihood of very hot conditions").'),
  location: z.string().describe('The name of the location for the forecast.'),
  date: z.string().optional().describe('The specific date for the forecast analysis (e.g., "YYYY-MM-DD").'),
});
export type CustomQueryAnalysisInput = z.infer<typeof CustomQueryAnalysisInputSchema>;

const CustomQueryAnalysisOutputSchema = z.object({
  analysis: z.string().describe('A detailed analysis answering the user\'s custom weather query.'),
});
export type CustomQueryAnalysisOutput = z.infer<typeof CustomQueryAnalysisOutputSchema>;

export async function analyzeCustomQuery(input: CustomQueryAnalysisInput): Promise<CustomQueryAnalysisOutput> {
  return customQueryAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customQueryAnalysisPrompt',
  input: {schema: CustomQueryAnalysisInputSchema},
  output: {schema: CustomQueryAnalysisOutputSchema},
  prompt: `You are a weather analysis expert. A user has a specific question about the weather conditions in {{location}}.

  Your task is to analyze the provided weather data and answer the user's query in a clear and concise way.
  
  The query is: "{{query}}"

  Interpret subjective terms like "very hot", "very cold", "very windy", "very wet", or "very uncomfortable" based on the provided data (e.g., temperature, wind speed, precipitation).

  Focus your analysis on the provided date: {{#if date}}{{date}}{{else}}today{{/if}}.
  
  Weather Data:
  {{weatherData}}

  Provide a direct answer to the user's question, explaining your reasoning based on the data.`,
});

const customQueryAnalysisFlow = ai.defineFlow(
  {
    name: 'customQueryAnalysisFlow',
    inputSchema: CustomQueryAnalysisInputSchema,
    outputSchema: CustomQueryAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
