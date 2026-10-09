import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Leitner Flow — Spaced Repetition Flashcards',
  description: 'Master any subject using the scientifically proven Leitner 3-Box Spaced Repetition Method. Neo-brutalism design with offline-ready local SQLite database.',
  keywords: ['Leitner method', 'spaced repetition', 'flashcards', 'learning', 'memory retention', 'active recall'],
};

export const viewport: Viewport = {
  themeColor: '#FAF7F2',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
