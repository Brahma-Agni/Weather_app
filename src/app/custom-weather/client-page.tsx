'use client';

import { useState } from 'react';
import { Cloud, CloudDrizzle, CloudLightning, CloudRain, CloudSun, Loader2, Search, Snowflake, Sun, Calendar as CalendarIcon, Wand2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCustomWeatherData, type WeatherResult } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

const FormSchema = z.object({
  location: z.string().min(2, {
    message: 'Location must be at least 2 characters.',
  }),
  date: z.date().optional(),
  customQuery: z.string().optional(),
});

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

export function CustomWeatherClientPage() {
  const [weatherData, setWeatherData] = useState<WeatherResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      location: '',
      date: new Date(),
      customQuery: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setWeatherData(null);
    try {
      const result = await getCustomWeatherData({ 
        location: data.location,
        date: data.date ? format(data.date, 'yyyy-MM-dd') : undefined,
        customQuery: data.customQuery,
      });
      setWeatherData(result);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: e instanceof Error ? e.message : 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Enter a Location & Date</CardTitle>
          <CardDescription>
            Type in a city or address and select a date to get the weather forecast.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <div className="flex flex-col sm:flex-row gap-4 items-start">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., San Francisco, CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-[240px] pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="customQuery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personalised Query (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g., "Will it be very windy?"' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
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
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
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
           {weatherData.customAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>Personalised Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="bg-accent/50 border-accent/20">
                  <AlertTitle className="font-bold text-accent-foreground">
                    <Wand2 className="inline-block mr-2" />
                    Your Custom Forecast
                  </AlertTitle>
                  <AlertDescription>{weatherData.customAnalysis}</AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-4">
                Weather for {weatherData.locationName} on {weatherData.date ? format(new Date(weatherData.date), 'PPP') : 'Today'}
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
