'use server';

/**
 * @fileOverview Provides a probabilistic analysis of weather forecasts using generative AI.
 *
 * - analyzeForecastProbabilities - A function that takes weather data and returns a probabilistic analysis.
 * - AnalyzeForecastProbabilitiesInput - The input type for the analyzeForecastProbabilities function.
 * - AnalyzeForecastProbabilitiesOutput - The return type for the analyzeForecastProbabilities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeForecastProbabilitiesInputSchema = z.object({
  weatherData: z.string().describe('The weather forecast data in JSON format, which can include current, hourly, and daily forecasts.'),
  userPlans: z.string().optional().describe('The user plans for the day, if available.'),
  date: z.string().optional().describe('The specific date for the forecast analysis (e.g., "YYYY-MM-DD").'),
});
export type AnalyzeForecastProbabilitiesInput = z.infer<typeof AnalyzeForecastProbabilitiesInputSchema>;

const AnalyzeForecastProbabilitiesOutputSchema = z.object({
  analysis: z.string().describe('A probabilistic analysis of the weather forecast.'),
});
export type AnalyzeForecastProbabilitiesOutput = z.infer<typeof AnalyzeForecastProbabilitiesOutputSchema>;

export async function analyzeForecastProbabilities(input: AnalyzeForecastProbabilitiesInput): Promise<AnalyzeForecastProbabilitiesOutput> {
  return analyzeForecastProbabilitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeForecastProbabilitiesPrompt',
  input: {schema: AnalyzeForecastProbabilitiesInputSchema},
  output: {schema: AnalyzeForecastProbabilitiesOutputSchema},
  prompt: `You are a weather probability analysis expert. Your goal is to provide a single, concise, and impactful sentence.

  Based on the provided weather data, identify the single most important weather event and provide a percentage for its likelihood.
  
  Your response MUST be a single sentence.
  
  Example: "There is a 75% chance of heavy rain in the afternoon, which may impact outdoor activities."
  
  Do NOT use lengthy text or multiple sentences. Be direct and focus on the percentage.

  {{#if date}}
  Focus your analysis on the selected date: {{date}}.
  {{else}}
  Focus your analysis on the current day's weather.
  {{/if}}
  
  Weather Data:
  {{weatherData}}

  {{#if userPlans}}
  User's plans (for context): {{userPlans}}
  {{/if}}
  `,
});

const analyzeForecastProbabilitiesFlow = ai.defineFlow(
  {
    name: 'analyzeForecastProbabilitiesFlow',
    inputSchema: AnalyzeForecastProbabilitiesInputSchema,
    outputSchema: AnalyzeForecastProbabilitiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
