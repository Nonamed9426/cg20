import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CG20 Steam Insight',
  description: 'CG20 Steam game insight front-end prototype',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
