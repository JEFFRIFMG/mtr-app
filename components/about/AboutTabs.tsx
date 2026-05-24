'use client';

import { useState } from 'react';

export default function AboutTabs() {
  const [activeTab, setActiveTab] = useState<'story' | 'funded' | 'trust'>('story');

  const tabs = [
    { id: 'story', label: 'Our Story' },
    { id: 'funded', label: "How We're Funded" },
    { id: 'trust', label: 'Why Trader Trust Us' },
  ] as const;

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#0F1825] border border-white/10 rounded-[20px] pt-6 pb-8 px-6 lg:pt-8 lg:pb-10 lg:px-10 flex flex-col items-center shadow-xl">
      
      {/* Tab Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-6 w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-semibold border rounded-lg transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-white/20 text-[#00A86B] bg-white/5'
                : 'border-white/10 text-[#7A8FA6] hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Area Konten Panel */}
      <div className="w-full">
        
        {activeTab === 'story' && (
          <div className="animate-fadeIn flex flex-col items-center">
            <span className="text-[11px] font-semibold text-[#7A8FA6] uppercase tracking-widest mb-2 text-center">
              Our Story
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-white mb-6 max-w-2xl leading-snug text-center">
              Founded in 2022, MyTradingReviews was created to bring clarity to the online broker industry.
            </h2>
            {/* KUNCI: pake 'text-justify' dan hapus max-w biar teks padat rata kanan-kiri */}
            <p className="text-[#DEEBFF] leading-relaxed text-[14px] md:text-[15px] text-justify opacity-90 w-full">
              Choosing a broker is not a small decision. Regulation, spreads, leverage, withdrawal policies, and platform 
              stability all matter. Yet this information is often scattered, simplified, or buried in fine print. We built 
              this platform to organize everything in one place. Every broker review follows a consistent framework. We evaluate 
              regulation, fund safety, trading costs, account types, platforms, deposits and withdrawals, and overall suitability. 
              Alongside detailed reviews, we publish broker comparisons and top 10 lists to help traders quickly understand their 
              options. MyTradingReviews is part of FinMedia Group, a broader financial media network focused on trading education. 
              This allows us to operate with strong editorial standards while maintaining independence in our evaluations. Our goal 
              is simple: help traders make informed decisions with confidence.
            </p>
          </div>
        )}

        {activeTab === 'funded' && (
          <div className="animate-fadeIn flex flex-col items-center">
            <span className="text-[11px] font-semibold text-[#7A8FA6] uppercase tracking-widest mb-2 text-center">
              How We're Funded
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-white mb-6 max-w-2xl leading-snug text-center">
              MyTradingReviews is completely free to use.
            </h2>
            {/* KUNCI: pake 'text-justify' dan hapus max-w biar teks padat rata kanan-kiri */}
            <p className="text-[#DEEBFF] leading-relaxed text-[14px] md:text-[15px] text-justify opacity-90 w-full">
              We operate through a transparent referral model. In some cases, we may earn a commission if you open an account 
              through one of our links. This does not increase your cost. Our partnerships do not determine our rankings or 
              review conclusions. Maintaining credibility and long-term trust is more important than short-term revenue. Being 
              part of FinMedia Group gives us the infrastructure and resources to keep the platform sustainable while remaining 
              editorially independent.
            </p>
          </div>
        )}

        {activeTab === 'trust' && (
          <div className="animate-fadeIn flex flex-col items-center">
            <span className="text-[11px] font-semibold text-[#7A8FA6] uppercase tracking-widest mb-2 text-center">
              Why Traders Trust Us
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-white mb-6 max-w-2xl leading-snug text-center">
              Since 2022, we have focused on consistency, clarity, and objectivity.
            </h2>
            {/* KUNCI: pake 'text-justify' dan hapus max-w biar teks padat rata kanan-kiri */}
            <p className="text-[#DEEBFF] leading-relaxed text-[14px] md:text-[15px] text-justify opacity-90 w-full">
              Each broker is reviewed using the same structured evaluation criteria. We regularly update our reviews as 
              broker conditions change. Trading involves real money, and outdated information can lead to costly mistakes. Our 
              responsibility is to provide accurate, well-structured information so traders can compare brokers properly and 
              choose what fits their strategy and risk profile.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}