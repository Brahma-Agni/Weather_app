'use client';

import { useState } from 'react';
import { Loader2, Route, Calendar as CalendarIcon } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getJourneyWeatherData, type JourneyResult } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const FormSchema = z.object({
  startLocation: z.string().min(2, {
    message: 'Start location must be at least 2 characters.',
  }),
  endLocation: z.string().min(2, {
    message: 'End location must be at least 2 characters.',
  }),
  dates: z.object({
    from: z.date(),
    to: z.date().optional(),
  }).optional(),
});

export function JourneyWeatherClientPage() {
  const [journeyData, setJourneyData] = useState<JourneyResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      startLocation: '',
      endLocation: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setJourneyData(null);
    try {
      const result = await getJourneyWeatherData({
        ...data,
        startDate: data.dates?.from ? format(data.dates.from, 'yyyy-MM-dd') : undefined,
        endDate: data.dates?.to ? format(data.dates.to, 'yyyy-MM-dd') : undefined,
      });
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      } else {
        setJourneyData(result);
      }
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
          <CardTitle>Plan Your Journey</CardTitle>
          <CardDescription>
            Enter a start and end location, and select your travel dates to get a weather forecast.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starting Point</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., New York, NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Los Angeles, CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                  control={form.control}
                  name="dates"
                  render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Travel Dates</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant={'outline'}
                          className={cn(
                            "justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, "LLL dd, y")} -{" "}
                                {format(field.value.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(field.value.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={field.value?.from}
                          selected={field.value as DateRange | undefined}
                          onSelect={field.onChange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                  )}
                />
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating Route...
                  </>
                ) : (
                  <>
                    <Route className="mr-2 h-4 w-4" />
                    Get Journey Forecast
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="space-y-4">
           <Skeleton className="h-32 w-full" />
           <Skeleton className="h-48 w-full" />
           <Skeleton className="h-48 w-full" />
        </div>
      )}

      {journeyData && !journeyData.error && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Journey Summary</CardTitle>
              <CardDescription>
                An overview of the weather conditions for your trip from {form.getValues().startLocation} to {form.getValues().endLocation}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="bg-primary/5 border-primary/20">
                  <AlertTitle className="font-bold text-primary">Weather Overview</AlertTitle>
                  <AlertDescription>{journeyData.journeySummary}</AlertDescription>
                </Alert>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-headline text-center">Route Forecast</h2>
            <div className="relative pl-8">
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border -translate-x-1/2"></div>
              {journeyData.stops.map((stop, index) => (
                <div key={index} className="relative mb-8">
                   <div className="absolute -left-8 top-1.5 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <Card>
                    <CardHeader>
                       <CardTitle className="flex items-center gap-4">
                        {stop.location}
                        <Badge variant={stop.risk.score > 60 ? 'destructive' : stop.risk.score > 30 ? 'secondary' : 'default'} className="text-base">
                          Risk: {stop.risk.score}/100
                        </Badge>
                      </CardTitle>
                      <CardDescription>{stop.weather}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{stop.risk.explanation}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
