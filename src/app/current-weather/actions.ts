'use server';

import { analyzeForecastProbabilities } from '@/ai/flows/probabilistic-forecast-analysis';
import { getWeatherRiskScore } from '@/ai/flows/weather-risk-score';
import { analyzeCustomQuery } from '@/ai/flows/custom-query-analysis';
import { z } from 'zod';

const WeatherDataSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  date: z.string().optional(),
  customQuery: z.string().optional(),
});

// Mock weather data structure
const hourlyForecast = [
  { time: '10:00', temp: 15, precip: 10, wind: 5 },
  { time: '11:00', temp: 16, precip: 20, wind: 7 },
  { time: '12:00', temp: 18, precip: 60, wind: 10 },
  { time: '13:00', temp: 17, precip: 75, wind: 12 },
  { time: '14:00', temp: 16, precip: 50, wind: 15 },
  { time: '15:00', temp: 15, precip: 30, wind: 11 },
  { time: '16:00', temp: 14, precip: 15, wind: 8 },
];

const dailyForecast = [
    { day: 'Mon', temp_high: 18, temp_low: 10, precip: 20, description: 'Partly cloudy' },
    { day: 'Tue', temp_high: 20, temp_low: 12, precip: 10, description: 'Sunny' },
    { day: 'Wed', temp_high: 19, temp_low: 11, precip: 80, description: 'Heavy rain' },
    { day: 'Thu', temp_high: 17, temp_low: 9, precip: 60, description: 'Showers' },
    { day: 'Fri', temp_high: 21, temp_low: 13, precip: 5, description: 'Clear skies' },
    { day: 'Sat', temp_high: 22, temp_low: 14, precip: 15, description: 'Sunny intervals' },
    { day: 'Sun', temp_high: 20, temp_low: 12, precip: 30, description: 'Light rain' },
];

export async function getWeatherData(data: z.infer<typeof WeatherDataSchema>) {
  // In a real app, you would fetch this from a weather API
  // and the date would be used to get the forecast for that specific day.
  const weatherApiResponse = {
    current: {
      temperature: 15,
      precipitationProbability: 0.1,
      windSpeed: 5,
      description: 'Partly cloudy with a chance of afternoon showers.',
    },
    hourly: hourlyForecast,
    daily: dailyForecast,
  };

  const analysisPromises = [
    analyzeForecastProbabilities({
      weatherData: JSON.stringify(weatherApiResponse),
      userPlans: 'Having a parade.',
      date: data.date
    }),
    getWeatherRiskScore({
      temperature: weatherApiResponse.current.temperature,
      precipitationProbability: weatherApiResponse.current.precipitationProbability,
      windSpeed: weatherApiResponse.current.windSpeed,
      description: weatherApiResponse.current.description,
    }),
  ];

  if (data.customQuery) {
    analysisPromises.push(analyzeCustomQuery({
      weatherData: JSON.stringify(weatherApiResponse),
      query: data.customQuery,
      location: 'your current location',
      date: data.date,
    }));
  }

  const [probabilisticAnalysis, riskScore, customAnalysis] = await Promise.all(analysisPromises);

  return {
    ...weatherApiResponse,
    probabilisticAnalysis: probabilisticAnalysis.analysis,
    risk: riskScore,
    customAnalysis: customAnalysis ? customAnalysis.analysis : null,
    date: data.date,
  };
}

export type WeatherResult = Awaited<ReturnType<typeof getWeatherData>>;
