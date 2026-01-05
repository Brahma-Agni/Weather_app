'use client';

import { useState, useEffect } from 'react';
import { Loader2, LocateFixed, Cloud, CloudDrizzle, CloudLightning, CloudRain, CloudSun, Snowflake, Sun, Calendar as CalendarIcon, Wand2 } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getWeatherData, type WeatherResult } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const getWeatherIcon = (description: string) => {
  const desc = description.toLowerCase();
  if (desc.includes('rain') || desc.includes('drizzle')) return <CloudRain className="h-8 w-8 text-primary" />;
  if (desc.includes('thunder')) return <CloudLightning className="h-8 w-8 text-primary" />;
  if (desc.includes('snow')) return <Snowflake className="h-8 w-8 text-primary" />;
  if (desc.includes('sun') && desc.includes('cloud')) return <CloudSun className="h-8 w-8 text-primary" />;
  if (desc.includes('sun') || desc.includes('clear')) return <Sun className="h-8 w-8 text-primary" />;
  if (desc.includes('cloud')) return <Cloud className="h-8 w-8 text-primary" />;
  return <CloudSun className="h-8 w-8 text-primary" />;
};

export function CurrentWeatherClientPage() {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [customQuery, setCustomQuery] = useState('');

  const handleGetLocation = () => {
    setIsLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        setIsLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );
  };

  const handleFetchWeather = async (query?: string) => {
    if (!position) {
      setError('Location not available.');
      return;
    }
    setIsLoading(true);
    try {
      const data = await getWeatherData({ 
        latitude: position.lat, 
        longitude: position.lng,
        date: date ? format(date, 'yyyy-MM-dd') : undefined,
        customQuery: query || customQuery,
      });
      setWeatherData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetLocation();
  }, []);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Your Location & Date</CardTitle>
          <CardDescription>
            Select a date and use your device's location to get a weather forecast.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex flex-col gap-4">
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[240px] justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button onClick={handleGetLocation} disabled={isLoading && !position}>
              <LocateFixed className="mr-2 h-4 w-4" />
              {isLoading && !position ? 'Getting Location...' : 'Refresh Location'}
            </Button>
          </div>
          {position && (
            <div className="text-sm text-muted-foreground pt-2">
              <p>Latitude: {position.lat.toFixed(4)}, Longitude: {position.lng.toFixed(4)}</p>
            </div>
          )}
          {error && <p className="text-sm text-destructive pt-2">{error}</p>}
        </CardContent>
      </Card>
      
      {position && !weatherData && (
        <div className="text-center">
          <Button onClick={() => handleFetchWeather()} disabled={isLoading} size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching Weather...
              </>
            ) : (
              'Get Weather Forecast'
            )}
          </Button>
        </div>
      )}

      {isLoading && !weatherData && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
          <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
        </div>
      )}
      
      {weatherData && (
        <div className="space-y-8">
           <Card>
            <CardHeader>
              <CardTitle>Personalised Forecast</CardTitle>
              <CardDescription>Ask a specific question about the weather conditions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-query">Your Question</Label>
                  <Input 
                    id="custom-query"
                    placeholder='e.g., "Is it a good day for a picnic?" or "How likely is it to be very windy?"'
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                  />
                </div>
                <Button onClick={() => handleFetchWeather(customQuery)} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Get Custom Analysis
                </Button>
              </div>
              {weatherData.customAnalysis && (
                <Alert className="mt-6 bg-accent/50 border-accent/20">
                  <AlertTitle className="font-bold text-accent-foreground">Custom Analysis</AlertTitle>
                  <AlertDescription>{weatherData.customAnalysis}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-4">
                Weather Summary for {weatherData.date ? format(new Date(weatherData.date), 'PPP') : 'Today'}
                <Badge variant={weatherData.risk.score > 60 ? 'destructive' : weatherData.risk.score > 30 ? 'secondary' : 'default'} className="text-base">
                  Risk Score: {weatherData.risk.score}/100
                </Badge>
              </CardTitle>
              <CardDescription>{weatherData.risk.explanation}</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="bg-primary/5 border-primary/20">
                <AlertTitle className="font-bold text-primary">Probabilistic Analysis</AlertTitle>
                <AlertDescription>{weatherData.probabilisticAnalysis}</AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7-Day Forecast</CardTitle>
              <CardDescription>The upcoming weather for the week.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weatherData.daily.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      {getWeatherIcon(day.description)}
                      <div>
                        <p className="font-bold text-lg">{day.day}</p>
                        <p className="text-sm text-muted-foreground">{day.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-lg">{day.temp_high}° / {day.temp_low}°</p>
                       <p className="text-sm text-primary">Precip: {day.precip}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hourly Forecast</CardTitle>
              <CardDescription>Temperature (°C) and Precipitation Chance (%) for the next few hours.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  temp: { label: 'Temp (°C)', color: 'hsl(var(--accent))' },
                  precip: { label: 'Precipitation (%)', color: 'hsl(var(--primary))' },
                }}
                className="h-64 w-full"
              >
                <BarChart data={weatherData.hourly} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--accent))" domain={['dataMin - 5', 'dataMax + 5']} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--primary))" domain={[0, 100]} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="temp" fill="hsl(var(--accent))" yAxisId="left" radius={4} />
                  <Bar dataKey="precip" fill="hsl(var(--primary))" yAxisId="right" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
