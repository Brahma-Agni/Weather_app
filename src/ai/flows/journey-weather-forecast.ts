'use server';

/**
 * @fileOverview Provides a weather forecast for a journey between two locations.
 *
 * - getJourneyWeatherForecast - A function that takes a start and end location and returns a weather forecast for the journey.
 * - JourneyWeatherForecastInput - The input type for the getJourneyWeatherForecast function.
 * - JourneyWeatherForecastOutput - The return type for the getJourneyWeatherForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const JourneyWeatherForecastInputSchema = z.object({
  startLocation: z.string().describe('The starting location of the journey.'),
  endLocation: z.string().describe('The ending location of the journey.'),
  startDate: z.string().optional().describe('The start date of the journey (e.g., "YYYY-MM-DD").'),
  endDate: z.string().optional().describe('The end date of the journey (e.g., "YYYY-MM-DD").'),
});
export type JourneyWeatherForecastInput = z.infer<typeof JourneyWeatherForecastInputSchema>;

const JourneyWeatherForecastOutputSchema = z.object({
  journeySummary: z.string().describe('A summary of the weather forecast for the entire journey.'),
  stops: z.array(z.object({
    location: z.string().describe('The name of the location for this stop.'),
    weather: z.string().describe('A brief description of the weather at this stop.'),
    risk: z.object({
      score: z.number().describe('The weather risk score (0-100) for this stop.'),
      explanation: z.string().describe('An explanation of the weather risk score for this stop.'),
    }),
  })).describe('A list of stops along the journey with weather information.'),
});
export type JourneyWeatherForecastOutput = z.infer<typeof JourneyWeatherForecastOutputSchema>;

export async function getJourneyWeatherForecast(input: JourneyWeatherForecastInput): Promise<JourneyWeatherForecastOutput> {
  return journeyWeatherForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'journeyWeatherForecastPrompt',
  input: {schema: JourneyWeatherForecastInputSchema},
  output: {schema: JourneyWeatherForecastOutputSchema},
  prompt: `You are a journey weather planning expert. Given a start and end location, create a plausible route with 3 to 5 intermediate stops.
  
  {{#if startDate}}
  The journey is planned from {{startDate}}{{#if endDate}} to {{endDate}}{{/if}}. The weather forecast should be appropriate for this time period.
  {{else}}
  The journey is happening now, so provide the current weather forecast.
  {{/if}}

  For each stop, including the start and end locations, provide a realistic weather forecast, a risk score (0-100), and an explanation for that score. The risk score should reflect potential travel disruptions based on the weather. Also, provide an overall summary for the journey's weather.

  Journey from: {{startLocation}}
  To: {{endLocation}}

  Example Output Structure:
  {
    "journeySummary": "The trip from City A to City D will see improving weather conditions...",
    "stops": [
      {
        "location": "City A",
        "weather": "Cloudy with a chance of light rain. Temp: 12°C.",
        "risk": { "score": 45, "explanation": "Moderate risk due to potential for slippery roads from rain." }
      },
      {
        "location": "Town B",
        "weather": "Partly cloudy. Temp: 15°C.",
        "risk": { "score": 20, "explanation": "Low risk with good driving conditions." }
      },
      {
        "location": "Village C",
        "weather": "Sunny. Temp: 18°C.",
        "risk": { "score": 5, "explanation": "Very low risk. Ideal travel weather." }
      },
      {
        "location": "City D",
        "weather": "Clear skies. Temp: 20°C.",
        "risk": { "score": 0, "explanation": "No weather-related risks." }
      }
    ]
  }

  Generate the response for the requested journey.`,
});

const journeyWeatherForecastFlow = ai.defineFlow(
  {
    name: 'journeyWeatherForecastFlow',
    inputSchema: JourneyWeatherForecastInputSchema,
    outputSchema: JourneyWeatherForecastOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
