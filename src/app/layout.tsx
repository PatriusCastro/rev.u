import type { Metadata, Viewport } from 'next';
import { Figtree } from 'next/font/google';
import 'katex/dist/katex.min.css';
import './globals.css';

const figtree = Figtree({ variable: '--font-figtree', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rev.U',
  description: 'Review for the Civil Engineering licensure exam: lessons, step-by-step solutions and spaced repeats.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#e3f2ec' };

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={figtree.variable}>
      <body>{children}</body>
    </html>
  );
}
