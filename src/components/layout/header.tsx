import { CloudSun } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-transparent sticky top-0 z-40 border-b border-white/20">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <CloudSun className="h-6 w-6 text-white" />
          <span className="font-headline text-xl font-bold text-white">
            Weather Parader
          </span>
        </Link>
      </div>
    </header>
  );
}
