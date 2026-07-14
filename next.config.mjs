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
    const campHome = '/tof-kamp';
    const legacy = [
      '/',
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
    return legacy.map((source) => ({
      source,
      destination: campHome,
      permanent: false,
    }));
  },
};

export default nextConfig;
