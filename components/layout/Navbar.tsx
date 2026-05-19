'use client'; // Harus client component karena ada state toggle & scroll

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-[32px] z-50 w-full transition-all duration-300 mt-[32px]">
      <div className="max-w-[1140px] mx-auto px-4">
        <div className={`
          flex items-center justify-between px-[16px] py-[24px] rounded-[20px]
          transition-all duration-300 backdrop-blur-md
          ${isScrolled 
            ? 'bg-[#FFFFFF1A] shadow-lg border border-white/20' 
            : 'bg-[#FFFFFF1A] border border-transparent'}
        `}>
          
          {/* Kiri: Logo */}
          <Link href="/" className="flex-shrink-0">
            <img 
              src="https://mytradingreviews.com/wp-content/uploads/2026/03/Logo-My-Trading-Reviews.svg" 
              alt="My Trading Reviews Logo" 
              className="h-[20px] w-auto"
            />
          </Link>

          {/* Tengah: Nav Menu (Desktop) */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              ['Ranking', '/ranking'],
              ['Comparison', '/comparison'],
              ['Awards', '/awards'],
              ['IB/Affiliate', '/ib-affiliate'],
              ['Blogs', '/blog'],
              ['About Us', '/about-us']
            ].map(([title, url]) => (
              <Link 
                key={title} 
                href={url} 
                className="text-[16px] font-semibold text-[#E8EDF4] hover:text-[#00A86B] transition-colors font-['Gantari'] tracking-wide"
              >
                {title}
              </Link>
            ))}
          </nav>

          {/* Kanan: Button Get Listed (Desktop) */}
          <div className="hidden md:block">
            <Link 
              href="/get-listed"
              className="inline-flex items-center justify-center px-7 py-3 bg-[#00A86B] hover:bg-[#008A57] text-white text-[15px] font-bold rounded-[8px] transition-colors font-['Gantari']"
            >
              Get Listed
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-4 right-4 mt-2 bg-[#0A1220] border border-[#1A2E45] rounded-xl shadow-xl overflow-hidden backdrop-blur-lg">
            <nav className="flex flex-col py-2">
              {[
                ['Ranking', '/ranking'],
                ['Comparison', '/comparison'],
                ['Awards', '/awards'],
                ['IB/Affiliate', '/ib-affiliate'],
                ['Blogs', '/blog'],
                ['About Us', '/about-us'],
                ['Get Listed', '/get-listed']
              ].map(([title, url]) => (
                <Link 
                  key={title} 
                  href={url} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-6 py-3 text-[14px] font-medium text-[#E8EDF4] hover:bg-[#1A2E45]/50 hover:text-[#00A86B] transition-colors border-b border-[#1A2E45]/30 last:border-0 font-['Gantari']"
                >
                  {title}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}