/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iemgpccgdlwpsrsjuumo.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'toftennis.nl',
      },
    ],
  },
  async redirects() {
    const home = '/';
    const legacyToHome = [
      '/kamp',
      '/vereniging',
      '/verenigingen',
      '/profiel',
      '/log',
      '/spelers',
      '/feed',
      '/dashboard',
      '/instellingen',
      '/club',
      '/login',
      '/register',
      '/register/:path*',
      '/register/player',
      '/register/club',
      '/wachten',
    ];
    const staffLegacy = [
      { source: '/trainer', destination: '/tof-kamp/trainer' },
      { source: '/media', destination: '/tof-kamp/media' },
      { source: '/groepen', destination: '/tof-kamp/groepen' },
      { source: '/admin', destination: '/tof-kamp/admin' },
      { source: '/kampfotos', destination: '/tof-kamp/kampfotos' },
    ];
    return [
      ...legacyToHome.map((source) => ({
        source,
        destination: home,
        permanent: false,
      })),
      ...staffLegacy.map(({ source, destination }) => ({
        source,
        destination,
        permanent: false,
      })),
    ];
  },
};

export default nextConfig;
