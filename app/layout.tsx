import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ClientLayout from '@/app/ClientLayout';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Trust Pilot - Service Reviews',
  description: 'Find and review services with Trust Pilot',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
