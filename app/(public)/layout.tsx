import React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Konfigurasi favicon global untuk semua halaman di bawah layout ini
export const metadata: Metadata = {
  icons: {
    icon: 'https://yt3.ggpht.com/W0ierVyvU8wA1VSVEyHeWQo-cbzMNmW3nGbZPGV670hPZNw9BB91Q7jaXSZQIg7JEy3_1Fwhag=s88-c-k-c0x00ffffff-no-rj',
  },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col text-transparent bg-transparent">
      
      {/* Komponen Navbar dari folder components/layout/ */}
      <Navbar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full max-w-[1140px] mx-auto pt-6 px-4">
        {children}
      </main>

      {/* Komponen Footer dari folder components/layout/ */}
      <Footer />
      
    </div>
  );
}