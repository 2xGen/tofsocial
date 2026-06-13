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
};

export default nextConfig;
