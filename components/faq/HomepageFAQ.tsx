'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomepageFAQ() {
  // Default index 0 kebuka, sisanya ketutup
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What is MyTradingReview?',
      answer: (
        <p>
          MyTradingReview is an independent platform that provides detailed reviews, comparisons, 
          and insights on online brokers to help traders make informed decisions.
        </p>
      ),
    },
    {
      question: 'How do you evaluate brokers?',
      answer: (
        <>
          <p className="mb-2">We assess brokers based on key factors such as:</p>
          <ul className="list-decimal pl-5 space-y-1">
            <li>Regulation & licensing</li>
            <li>Trading conditions (spreads, leverage, fees)</li>
            <li>Platform performance</li>
            <li>User experience</li>
            <li>Customer support</li>
          </ul>
        </>
      ),
    },
    {
      question: 'Who should use MyTradingReview?',
      answer: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Beginner traders looking for guidance</li>
          <li>Experienced traders comparing brokers</li>
          <li>Anyone wanting transparent broker insights</li>
        </ul>
      ),
    },
    {
      question: 'Do you recommend specific brokers?',
      answer: (
        <p>
          We do not provide financial advice. However, we highlight brokers that meet strong 
          regulatory and performance standards to help users compare options.
        </p>
      ),
    },
    {
      question: 'How often are reviews updated?',
      answer: (
        <>
          <p className="mb-2">We regularly update our content to reflect:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Regulatory changes</li>
            <li>Platform updates</li>
            <li>User feedback</li>
            <li>Market condition</li>
          </ul>
        </>
      ),
    },
  ];

  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 pt-4 pb-16 lg:pt-8 lg:pb-24" aria-label="Frequently Asked Questions">
      
      {/* BAGIAN ATAS: Judul, Subjudul */}
      <div className="flex flex-col items-center text-center mb-12">
        <h2 className="text-3xl md:text-4xl lg:text-[42px] font-extrabold text-white mb-4">
          Frequently Asked <span className="text-[#00A86B]">Question</span>
        </h2>
        <p className="text-[#E8EDF4] text-[15px] md:text-base leading-relaxed mb-8 max-w-2xl opacity-90">
          Quick answers to common questions about Funded Trading.
        </p>

        {/* REVISI 3: BUTTON DI-HIDE MENGGUNAKAN CLASS 'hidden' */}
        <Link 
          href="/faq"
          className="hidden items-center justify-center bg-transparent border border-white hover:bg-white/10 text-white font-bold py-2.5 px-8 rounded-[6px] text-sm transition-all"
        >
          View All FAQ
        </Link>
      </div>

      {/* BAGIAN BAWAH: Accordion FAQ */}
      <div className="max-w-4xl mx-auto flex flex-col gap-4 w-full">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div 
              key={index}
              // REVISI 1: BG SELALU TRANSPARENT
              className={`border rounded-[8px] transition-all duration-300 overflow-hidden bg-transparent ${
                isOpen ? 'border-white/30' : 'border-white/15 hover:border-white/30'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="font-bold text-[15px] md:text-base pr-4 text-white">
                  {faq.question}
                </span>
                <div className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </button>
              
              {/* REVISI 2: ADA GARIS PEMISAH (border-t) ANTARA PERTANYAAN & JAWABAN */}
              <div 
                className={`transition-all duration-300 ease-in-out ${
                  isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="border-t border-white/15 mx-5 md:mx-6 pt-4 pb-5 md:pb-6 text-[14px] md:text-[15px] text-white leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}