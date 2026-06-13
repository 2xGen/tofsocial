import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'TOF Social – Maak van jeugdleden actieve clubspelers',
  description:
    'TOF Social maakt wedstrijden, speeltijd, uitdagingen en voortgang zichtbaar zodat jeugdspelers vaker de baan op gaan.',
  icons: {
    icon: 'https://toftennis.nl/wp-content/uploads/2024/04/TOF-logo.svg',
  },
  openGraph: {
    title: 'TOF Social – Maak van jeugdleden actieve clubspelers',
    description:
      'TOF Social maakt wedstrijden, speeltijd, uitdagingen en voortgang zichtbaar zodat jeugdspelers vaker de baan op gaan.',
    type: 'website',
    locale: 'nl_NL',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl-NL" className={poppins.variable}>
      <body className="min-h-screen font-poppins">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
