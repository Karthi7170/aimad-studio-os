import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/', name: 'AI x MAD Studio OS', short_name: 'AI x MAD',
    description: 'Private business operating system for AI x MAD Studio.',
    start_url: '/', scope: '/', display: 'standalone',
    background_color: '#080d19', theme_color: '#080d19',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
    ]
  };
}
