import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'AI x MAD Studio OS',
  description: 'Private AI x MAD Studio business dashboard for client acquisition, CRM, quotations, projects and delivery.',
  applicationName: 'AI x MAD Studio OS',
  manifest: '/manifest.webmanifest',
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'AI x MAD' },
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' }
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#080d19' };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
