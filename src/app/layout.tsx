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
  title: 'TOF Social · Tenniskamp',
  description:
    'Live scorebord tenniskamp — punten, speler van de dag en groepsranking voor ouders en begeleiders.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  icons: {
    icon: 'https://toftennis.nl/wp-content/uploads/2024/04/TOF-logo.svg',
  },
  openGraph: {
    title: 'TOF Social · Tenniskamp',
    description:
      'Live scorebord tenniskamp — punten, speler van de dag en groepsranking.',
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
