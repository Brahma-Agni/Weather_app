import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, Sun, Route } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    title: 'Current Weather',
    description: 'Get the latest forecast for your current location instantly.',
    href: '/current-weather',
    icon: <Map className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Custom Location',
    description: 'Check the weather for any specific place and time.',
    href: '/custom-weather',
    icon: <Sun className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Journey Weather',
    description: 'Plan your trip with weather predictions along your route.',
    href: '/journey-weather',
    icon: <Route className="h-8 w-8 text-primary" />,
  },
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16 lg:py-24">
      <div className="text-center space-y-4 mb-12">
        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
          Will it Rain on Your Parade?
        </h1>
        <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl">
          Get accurate, probabilistic rain forecasts to plan your day, your trip, and your parade with confidence.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link href={feature.href} key={feature.title} className="group">
            <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center gap-4">
                {feature.icon}
                <CardTitle className="font-headline text-2xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
