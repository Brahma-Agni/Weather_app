import { CustomWeatherClientPage } from './client-page';

export default function CustomWeatherPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-8 text-center">
          <h1 className="font-headline text-3xl md:text-4xl font-bold">
            Custom Location Weather
          </h1>
          <p className="text-muted-foreground">
            Get a detailed forecast for any location.
          </p>
        </div>
        <CustomWeatherClientPage />
      </div>
    </div>
  );
}
