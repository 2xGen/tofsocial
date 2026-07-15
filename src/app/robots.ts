import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: [
        '/tof-kamp',
        '/shot-kamp',
        '/trainer',
        '/groepen',
        '/admin',
        '/media',
        '/kampfotos',
        '/kamp',
      ],
    },
  };
}
