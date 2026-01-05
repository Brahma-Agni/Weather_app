'use server';

/**
 * @fileOverview Calculates a weather risk score and explanation for a given weather forecast.
 *
 * - getWeatherRiskScore - A function that calculates the weather risk score.
 * - WeatherRiskScoreInput - The input type for the getWeatherRiskScore function.
 * - WeatherRiskScoreOutput - The return type for the getWeatherRiskScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WeatherRiskScoreInputSchema = z.object({
  temperature: z.number().describe('The temperature in Celsius.'),
  precipitationProbability: z.number().describe('The probability of precipitation (0-1).'),
  windSpeed: z.number().describe('The wind speed in km/h.'),
  description: z.string().describe('A description of the overall weather conditions.'),
});
export type WeatherRiskScoreInput = z.infer<typeof WeatherRiskScoreInputSchema>;

const WeatherRiskScoreOutputSchema = z.object({
  score: z.number().describe('The weather risk score (0-100).'),
  explanation: z.string().describe('An explanation of the weather risk score.'),
});
export type WeatherRiskScoreOutput = z.infer<typeof WeatherRiskScoreOutputSchema>;

export async function getWeatherRiskScore(input: WeatherRiskScoreInput): Promise<WeatherRiskScoreOutput> {
  return weatherRiskScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'weatherRiskScorePrompt',
  input: {schema: WeatherRiskScoreInputSchema},
  output: {schema: WeatherRiskScoreOutputSchema},
  prompt: `You are an expert weather risk assessor.  Given the following weather conditions, calculate a risk score between 0 and 100, and provide a concise explanation for the score.

Weather Conditions:
Temperature: {{temperature}} °C
Precipitation Probability: {{precipitationProbability}}
Wind Speed: {{windSpeed}} km/h
Description: {{description}}

Considerations:
*   Higher temperatures, low wind speeds and little to no precipitation are low risk and should be near 0.
*   Lower temperatures, high wind speeds, and high precipitation probability are high risk and should be closer to 100.
*   The description should be used to contextualize and give specific advice or warnings, such as whether there is a risk of flooding, icy conditions, or heatstroke.
*   The explanation should reference the provided weather conditions.

Output:
{
  "score": number,
  "explanation": string
}
`,
});

const weatherRiskScoreFlow = ai.defineFlow(
  {
    name: 'weatherRiskScoreFlow',
    inputSchema: WeatherRiskScoreInputSchema,
    outputSchema: WeatherRiskScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
