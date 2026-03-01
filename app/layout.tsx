import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'AirRoute — Breathe Better, Route Smarter',
  description: 'Find the lowest-pollution corridor between any two points. AQI-aware routing that blends travel time with real-world air quality data.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only z-[2000] rounded-lg bg-cyan px-4 py-2 text-sm font-medium text-black focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to main content
        </a>
        <main id="main-content" className="app-shell">
          {children}
        </main>
      </body>
    </html>
  );
}
