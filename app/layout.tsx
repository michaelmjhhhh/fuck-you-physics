import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IB Physics',
  description: 'IB Physics practice generated from extracted question images.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
