import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

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