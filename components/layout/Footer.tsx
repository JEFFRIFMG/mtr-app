import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#0A1220] border-t border-[#1A2E45] py-8 mt-12 text-center text-[#7A8FA6] text-sm font-['Gantari']">
      <div className="max-w-[1140px] mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} MyTradingReviews. All rights reserved. Independent rankings of 590+ regulated brokers worldwide.</p>
      </div>
    </footer>
  );
}