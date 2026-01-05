'use server';

import { getJourneyWeatherForecast } from '@/ai/flows/journey-weather-forecast';
import { z } from 'zod';

const JourneyDataSchema = z.object({
  startLocation: z.string(),
  endLocation: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function getJourneyWeatherData(data: z.infer<typeof JourneyDataSchema>) {
  try {
    const journeyForecast = await getJourneyWeatherForecast({
      startLocation: data.startLocation,
      endLocation: data.endLocation,
      startDate: data.startDate,
      endDate: data.endDate,
    });
    return journeyForecast;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unknown error occurred while fetching the journey forecast.' };
  }
}

export type JourneyResult = Awaited<ReturnType<typeof getJourneyWeatherData>>;
