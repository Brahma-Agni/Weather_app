import { JourneyWeatherClientPage } from './client-page';

export default function JourneyWeatherPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-8 text-center">
          <h1 className="font-headline text-3xl md:text-4xl font-bold">Journey Weather</h1>
          <p className="text-muted-foreground">
            Plan your route with weather forecasts for every step of your journey.
          </p>
        </div>
        <JourneyWeatherClientPage />
      </div>
    </div>
  );
}
