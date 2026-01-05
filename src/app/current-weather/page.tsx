import { CurrentWeatherClientPage } from './client-page';

export default function CurrentWeatherPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-8 text-center">
          <h1 className="font-headline text-3xl md:text-4xl font-bold">Current Weather</h1>
          <p className="text-muted-foreground">
            Get an instant, detailed forecast for where you are right now.
          </p>
        </div>
        <CurrentWeatherClientPage />
      </div>
    </div>
  );
}
