import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '🪔 Diwali House Party 2024 | You\'re Invited!',
  description: 'Join us for an epic Diwali House Party! Lights, food, games, and pure chaos. Register now and pick your party role.',
  keywords: ['Diwali', 'party', 'invitation', 'house party', '2024'],
  openGraph: {
    title: '🪔 Diwali House Party — You\'re Invited!',
    description: '"Lights. Food. Games. Chaos. Repeat." — 9th November, 7 PM Onwards',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-inter antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(12px)',
              color: '#FCD34D',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#FFD700', secondary: '#000' },
            },
            error: {
              iconTheme: { primary: '#FF6B35', secondary: '#000' },
            },
          }}
        />
      </body>
    </html>
  );
}
