'use client';

import React, { useEffect } from 'react';
import '@/styles/awards.css';

export default function AwardsPage() {
  
  // Efek scroll handler untuk carousel statis bawaan Elementor
  useEffect(() => {
    const carousels = document.querySelectorAll('.aw-carousel');
    carousels.forEach((carousel, i) => {
      const fadeLeft = document.getElementById(`aw-fade-left-${i}`);
      const fadeRight = document.getElementById(`aw-fade-right-${i}`);
      
      const updateFades = () => {
        const scrollLeft = carousel.scrollLeft;
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        if (fadeLeft) fadeLeft.classList.toggle('aw-fade-visible', scrollLeft > 4);
        if (fadeRight) fadeRight.classList.toggle('aw-fade-visible', scrollLeft < maxScroll - 4);
      };

      carousel.addEventListener('scroll', updateFades);
      updateFades(); // Initial check

      return () => carousel.removeEventListener('scroll', updateFades);
    });
  }, []);

  return (
    <div className="aw-wrap">

      {/* ================================================
            SECTION 01 — HERO
           ================================================ */}
      <section className="aw-hero">
        <div className="aw-hero-content">
          <span className="aw-eyebrow">
            <span className="aw-eyebrow-dot"></span>
            MTR Broker Awards 2026
          </span>
          <h1 className="aw-hero-title">
            The Best Brokers
            <span className="aw-green">Recognised.</span>
          </h1>
          <p className="aw-hero-desc">
            16 categories. Independent research. The MyTradingReviews Broker Awards recognise brokers that consistently deliver for traders across regulation, costs, platforms, and service.
          </p>
          <div className="aw-hero-actions">
            <a href="#award-categories" className="aw-btn aw-btn-primary">
              View Award Categories
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            </a>
            <a href="#methodology" className="aw-btn aw-btn-outline">Our Methodology</a>
          </div>
        </div>
        <div className="aw-hero-visual">
          <img className="aw-trophy-img" src="https://mytradingreviews.com/wp-content/uploads/2026/05/MTR-AWARD-BG.png" alt="MTR Broker Awards 2026 Trophy"/>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="aw-stats-bar">
        <div className="aw-stat">
          <div className="aw-stat-icon">
            <svg viewBox="0 0 24 24" className="aw-filled"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <div className="aw-stat-body">
            <span className="aw-stat-val">16</span>
            <span className="aw-stat-lbl">Award Categories</span>
          </div>
        </div>
        <div className="aw-stat">
          <div className="aw-stat-icon">
            <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="aw-stat-body">
            <span className="aw-stat-val">100+</span>
            <span className="aw-stat-lbl">Brokers Evaluated</span>
          </div>
        </div>
        <div className="aw-stat">
          <div className="aw-stat-icon">
            <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
          </div>
          <div className="aw-stat-body">
            <span className="aw-stat-val">Independent</span>
            <span className="aw-stat-lbl">Editorial Judging</span>
          </div>
        </div>
        <div className="aw-stat">
          <div className="aw-stat-icon">
            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8.01" y2="14"/><line x1="12" y1="14" x2="12.01" y2="14"/><line x1="16" y1="14" x2="16.01" y2="14"/></svg>
          </div>
          <div className="aw-stat-body">
            <span className="aw-stat-val">2026</span>
            <span className="aw-stat-lbl">Current Season</span>
          </div>
        </div>
      </div>

      {/* ================================================
            SECTION 02 — AWARD CATEGORIES
           ================================================ */}
      <section className="aw-categories" id="award-categories">

        <div className="aw-cat-header">
          <div>
            <p className="aw-cat-eyebrow">2026 Award Categories</p>
            <h2 className="aw-cat-title">16 Categories. <span className="aw-green">One Standard.</span></h2>
          </div>
          <p className="aw-cat-desc">Winners are determined through independent research, live testing, and editorial review.</p>
        </div>

        {/* Group: Trading Excellence */}
        <div className="aw-group">
          <div className="aw-group-header">
            <div className="aw-group-icon">
              <svg viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            </div>
            <span className="aw-group-name">Trading Excellence</span>
            <span className="aw-group-line"></span>
            <span className="aw-group-badge">4 awards</span>
          </div>
          <div className="aw-carousel-wrap">
            <div className="aw-fade-left" id="aw-fade-left-0"></div>
            <div className="aw-fade-right aw-fade-visible" id="aw-fade-right-0"></div>
            <div className="aw-carousel" id="aw-carousel-0">
              <div className="aw-card aw-card-active">
                <div className="aw-card-fold"><span className="aw-card-num">#01</span></div>
                <div className="aw-card-inner">
                  <div className="aw-card-head"><div className="aw-card-head-left"><div className="aw-card-icon"><svg viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M4 22h16"/></svg></div><h3 className="aw-card-title">Best Overall Broker</h3></div></div>
                  <p className="aw-card-desc">Awarded to the broker with the strongest all-round performance across regulation, platforms, costs, support, and execution quality.</p>
                  <div className="aw-card-tags"><span className="aw-tag">Regulation</span><span className="aw-tag">Execution</span><span className="aw-tag">Platforms</span><span className="aw-tag">Costs</span><span className="aw-tag">Support</span></div>
                </div>
                <div className="aw-card-footer"><span className="aw-winner"><span className="aw-winner-dot"></span>Winner TBA</span><span className="aw-season">2026 Season</span></div>
              </div>
              <div className="aw-card">
                <div className="aw-card-fold"><span className="aw-card-num">#02</span></div>
                <div className="aw-card-inner">
                  <div className="aw-card-head"><div className="aw-card-head-left"><div className="aw-card-icon"><svg viewBox="0 0 24 24"><path d="M17.5 6.5A7 7 0 1 0 17.5 17.5"/><path d="M3 10h11"/><path d="M3 14h11"/></svg></div><h3 className="aw-card-title">Best Forex Broker</h3></div></div>
                  <p className="aw-card-desc">Recognises the broker offering the best conditions for forex trading: tight spreads, deep liquidity, and strong currency pair coverage.</p>
                  <div className="aw-card-tags"><span className="aw-tag">Spreads</span><span className="aw-tag">Liquidity</span><span className="aw-tag">Currency pairs</span><span className="aw-tag">Execution speed</span></div>
                </div>
                <div className="aw-card-footer"><span className="aw-winner"><span className="aw-winner-dot"></span>Winner TBA</span><span className="aw-season">2026 Season</span></div>
              </div>
              <div className="aw-card">
                <div className="aw-card-fold"><span className="aw-card-num">#03</span></div>
                <div className="aw-card-inner">
                  <div className="aw-card-head"><div className="aw-card-head-left"><div className="aw-card-icon"><svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div><h3 className="aw-card-title">Best CFD Broker</h3></div></div>
                  <p className="aw-card-desc">For the broker delivering the widest and most fairly priced CFD product range across indices, commodities, stocks, and crypto.</p>
                  <div className="aw-card-tags"><span className="aw-tag">Product range</span><span className="aw-tag">CFD pricing</span><span className="aw-tag">Margin rates</span><span className="aw-tag">Overnight fees</span></div>
                </div>
                <div className="aw-card-footer"><span className="aw-winner"><span className="aw-winner-dot"></span>Winner TBA</span><span className="aw-season">2026 Season</span></div>
              </div>
              <div className="aw-card">
                <div className="aw-card-fold"><span className="aw-card-num">#04</span></div>
                <div className="aw-card-inner">
                  <div className="aw-card-head"><div className="aw-card-head-left"><div className="aw-card-icon"><svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div><h3 className="aw-card-title">Best Execution Quality</h3></div></div>
                  <p className="aw-card-desc">Awarded for the lowest slippage, fastest order fill times, and most consistent execution, verified through independent testing.</p>
                  <div className="aw-card-tags"><span className="aw-tag">Slippage rate</span><span className="aw-tag">Fill speed</span><span className="aw-tag">Requote frequency</span><span className="aw-tag">Spread consistency</span></div>
                </div>
                <div className="aw-card-footer"><span className="aw-winner"><span className="aw-winner-dot"></span>Winner TBA</span><span className="aw-season">2026 Season</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Group 2: Platform & Technology */}
        <div className="aw-group">
          <div className="aw-group-header">
            <div className="aw-group-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>
            <span className="aw-group-name">Platform & Technology</span>
            <span className="aw-group-line"></span>
            <span className="aw-group-badge">3 awards</span>
          </div>
          <div className="aw-carousel-wrap">
            <div className="aw-fade-left" id="aw-fade-left-1"></div>
            <div className="aw-fade-right aw-fade-visible" id="aw-fade-right-1"></div>
            <div className="aw-carousel" id="aw-carousel-1">
              <div className="aw-card"><div className="aw-card-fold"><span className="aw-card-num">#01</span></div><div className="aw-card-inner"><div className="aw-card-head"><div className="aw-card-head-left"><div className="aw-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div><h3 className="aw-card-title">Best Trading Platform</h3></div></div><p className="aw-card-desc">Recognises the broker with the most capable, reliable, and user-friendly trading platform, proprietary or third-party.</p><div className="aw-card-tags"><span className="aw-tag">Usability</span><span className="aw-tag">Charting tools</span><span className="aw-tag">Order types</span><span className="aw-tag">Reliability</span></div></div><div className="aw-card-footer"><span className="aw-winner"><span className="aw-winner-dot"></span>Winner TBA</span><span className="aw-season">2026 Season</span></div></div>
              <div className="aw-card"><div className="aw-card-fold"><span className="aw-card-num">#02</span></div><div className="aw-card-inner"><div className="aw-card-head"><div className="aw-card-head-left"><div className="aw-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg></div><h3 className="aw-card-title">Best Mobile Trading App</h3></div></div><p className="aw-card-desc">For the broker whose mobile app delivers a full desktop experience: fast, stable, and feature-complete on iOS and Android.</p><div className="aw-card-tags"><span className="aw-tag">iOS & Android quality</span><span className="aw-tag">Speed</span><span className="aw-tag">Feature parity</span><span className="aw-tag">Design</span></div></div><div className="aw-card-footer"><span className="aw-winner"><span className="aw-winner-dot"></span>Winner TBA</span><span className="aw-season">2026 Season</span></div></div>
              <div className="aw-card"><div className="aw-card-fold"><span className="aw-card-num">#03</span></div><div className="aw-card-inner"><div className="aw-card-head"><div className="aw-card-head-left"><div className="aw-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div><h3 className="aw-card-title">Best Copy Trading Platform</h3></div></div><p className="aw-card-desc">Awarded to the broker with the best social and copy trading infrastructure: strategy selection, risk controls, and transparency.</p><div className="aw-card-tags"><span className="aw-tag">Signal quality</span><span className="aw-tag">Risk settings</span><span className="aw-tag">Trader transparency</span><span className="aw-tag">Fees</span></div></div><div className="aw-card-footer"><span className="aw-winner"><span className="aw-winner-dot"></span>Winner TBA</span><span className="aw-season">2026 Season</span></div></div>
            </div>
          </div>
        </div>

        {/* Group 3: Value & Costs */}
        <div className="aw-group">
          <div className="aw-group-header">
            <div className="aw-group-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></div>
            <span className="aw-group-name">Value & Costs</span>
            <span className="aw-group-line"></span>
            <span className="aw-group-badge">3 awards</span>
          </div>
          <div className="aw-carousel-wrap">
            <div className="aw-fade-left" id="aw-fade-left-2"></div>
            <div className="aw-fade-right aw-fade-visible" id="aw-fade-right-2"></div>
            <div className="aw-carousel" id="aw-carousel-2">
              <div className="aw-card"><div className="aw-card-fold"><span className="aw-card-num">#01</span></div><div className="aw-card-inner"><div className="aw-card-head"><div className="aw-card-head-left"><div className="aw-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div><h3 className="aw-card-title">Best Low Spread Broker</h3></div></div><p className="aw-card-desc">For the broker consistently offering the tightest spreads on major pairs, verified through live spread sampling across multiple sessions.</p><div className="aw-card-tags"><span className="aw-tag">EUR/USD spread</span><span className="aw-tag">GBP/USD spread</span><span className="aw-tag">Spread consistency</span><span className="aw-tag">Raw vs markup</span></div></div><div className="aw-card-footer"><span className="aw-winner"><span className="aw-winner-dot"></span>Winner TBA</span><span className="aw-season">2026 Season</span></div></div>
              <div className="aw-card"><div className="aw-card-fold"><span className="aw-card-num">#02</span></div><div className="aw-card-inner"><div className="aw-card-head"><div className="aw-card-head-left"><div className="aw-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div><h3 className="aw-card-title">Best Deposit & Withdrawal Experience</h3></div></div><p className="aw-card-desc">Recognises the broker with the fastest, most flexible, and lowest-cost deposit and withdrawal process.</p><div className="aw-card-tags"><span className="aw-tag">Processing time</span><span className="aw-tag">Payment methods</span><span className="aw-tag">Withdrawal fees</span><span className="aw-tag">Min deposit</span></div></div><div className="aw-card-footer"><span className="aw-winner"><span className="aw-winner-dot"></span>Winner TBA</span><span className="aw-season">2026 Season</span></div></div>
              <div className="aw-card"><div className="aw-card-fold"><span className="aw-card-num">#03</span></div><div className="aw-card-inner"><div className="aw-card-head"><div className="aw-card-head-left"><div className="aw-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></div><h3 className="aw-card-title">Best Value Broker</h3></div></div><p className="aw-card-desc">For the broker that delivers the strongest overall package relative to its cost, balancing spreads, commissions, platform, and service.</p><div className="aw-card-tags"><span className="aw-tag">Cost vs features</span><span className="aw-tag">Hidden fees</span><span className="aw-tag">Account tiers</span><span className="aw-tag">Overall pricing</span></div></div><div className="aw-card-footer"><span className="aw-winner"><span className="aw-winner-dot"></span>Winner TBA</span><span className="aw-season">2026 Season</span></div></div>
            </div>
          </div>
        </div>

        {/* Group 4: Regulation & Safety */}
        <div className="aw-group">
          <div className="aw-group-header">
            <div className="aw-group-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
            <span className="aw-group-name">Regulation & Safety</span>
            <span className="aw-group-line"></span>
            <span className="aw-group-badge">2 awards</span>
          </div>
          <div className="aw-carousel-wrap">
            <div className="aw-fade-left" id="aw-fade-left-3"></div>
            <div className="aw-fade-right aw-fade-visible" id="aw-fade-right-3"></div>
            <div className="aw-carousel" id="aw-carousel-3">
              <div className="aw-card"><div className="aw-card-fold"><span className="aw-card-num">#01</span></div><div className="aw-card-inner"><div className="aw-card-head"><div className="aw-card-head-left"><div className="aw-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg></div><h3 className="aw-card-title">Best Regulated Broker</h3></div></div><p className="aw-card-desc">Awarded to the broker with the strongest regulatory footprint: multi-jurisdiction licensing, client fund segregation, and a clean compliance record.</p><div className="aw-card-tags"><span className="aw-tag">Regulatory licences</span><span className="aw-tag">Fund segregation</span><span className="aw-tag">Compensation schemes</span><span className="aw-tag">Compliance history</span></div></div><div className="aw-card-footer"><span className="aw-winner"><span className="aw-winner-dot"></span>Winner TBA</span><span className="aw-season">2026 Season</span></div></div>
              <div className="aw-card"><div className="aw-card-fold"><span className="aw-card-num">#02</span></div><div className="aw-card-inner"><div className="aw-card-head"><div className="aw-card-head-left"><div className="aw-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div><h3 className="aw-card-title">Most Transparent Broker</h3></div></div><p className="aw-card-desc">For the broker that publishes the clearest, most complete information on fees, execution, and conflicts of interest.</p><div className="aw-card-tags"><span className="aw-tag">Fee disclosure</span><span className="aw-tag">Execution policy</span><span className="aw-tag">Conflict of interest</span><span className="aw-tag">Audit access</span></div></div><div className="aw-card-footer"><span className="aw-winner"><span className="aw-winner-dot"></span>Winner TBA</span><span className="aw-season">2026 Season</span></div></div>
            </div>
          </div>
        </div>

        {/* Group 5: Trader Experience */}
        <div className="aw-group">
          <div className="aw-group-header">
            <div className="aw-group-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <span className="aw-group-name">Trader Experience</span>
            <span className="aw-group-line"></span>
            <span className="aw-group-badge">4 awards</span>
          </div>
          <div className="aw-carousel-wrap">
            <div className="aw-fade-left" id="aw-fade-left-4"></div>
            <div className="aw-fade-right aw-fade-visible" id="aw-fade-right-4"></div>
            <div className="aw-carousel" id="aw-carousel-4">
              <div className="aw-card"><div className="aw-card-fold"><span className="aw-card-num">#01</span></div><div className="aw-card-inner"><div className="aw-card-head"><div className="aw-card-head-left"><div className="aw-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div><h3 className="aw-card-title">Best Broker for Beginners</h3></div></div><p className="aw-card-desc">Recognises the broker that gives new traders the clearest path to starting: low barriers, strong education, and helpful onboarding.</p><div className="aw-card-tags"><span className="aw-tag">Min deposit</span><span className="aw-tag">Demo account</span><span className="aw-tag">Education quality</span><span className="aw-tag">Onboarding UX</span></div></div><div className="aw-card-footer"><span className="aw-winner"><span className="aw-winner-dot"></span>Winner TBA</span><span className="aw-season">2026 Season</span></div></div>
              <div className="aw-card"><div className="aw-card-fold"><span className="aw-card-num">#02</span></div><div className="aw-card-inner"><div className="aw-card-head"><div className="aw-card-head-left"><div className="aw-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div><h3 className="aw-card-title">Best Broker for Advanced Traders</h3></div></div><p className="aw-card-desc">For the broker delivering the depth experienced traders need: API access, algorithmic tools, low latency, and professional account tiers.</p><div className="aw-card-tags"><span className="aw-tag">API & algo tools</span><span className="aw-tag">Latency</span><span className="aw-tag">Pro account access</span><span className="aw-tag">Advanced order types</span></div></div><div className="aw-card-footer"><span className="aw-winner"><span className="aw-winner-dot"></span>Winner TBA</span><span className="aw-season">2026 Season</span></div></div>
              <div className="aw-card"><div className="aw-card-fold"><span className="aw-card-num">#03</span></div><div className="aw-card-inner"><div className="aw-card-head"><div className="aw-card-head-left"><div className="aw-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><h3 className="aw-card-title">Best Customer Support</h3></div></div><p className="aw-card-desc">Awarded to the broker whose support team delivers the fastest response, most knowledgeable answers, and best availability across channels.</p><div className="aw-card-tags"><span className="aw-tag">Response time</span><span className="aw-tag">Knowledge quality</span><span className="aw-tag">Availability</span><span className="aw-tag">Channel options</span></div></div><div className="aw-card-footer"><span className="aw-winner"><span className="aw-winner-dot"></span>Winner TBA</span><span className="aw-season">2026 Season</span></div></div>
              <div className="aw-card"><div className="aw-card-fold"><span className="aw-card-num">#04</span></div><div className="aw-card-inner"><div className="aw-card-head"><div className="aw-card-head-left"><div className="aw-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div><h3 className="aw-card-title">Best Educational Resources</h3></div></div><p className="aw-card-desc">For the broker that invests seriously in trader education: webinars, tutorials, market analysis, and structured learning paths.</p><div className="aw-card-tags"><span className="aw-tag">Content depth</span><span className="aw-tag">Webinar quality</span><span className="aw-tag">Market analysis</span><span className="aw-tag">Structured courses</span></div></div><div className="aw-card-footer"><span className="aw-winner"><span className="aw-winner-dot"></span>Winner TBA</span><span className="aw-season">2026 Season</span></div></div>
            </div>
          </div>
        </div>

      </section>

      {/* ================================================
            SECTION 03 — METHODOLOGY
           ================================================ */}
      <section className="aw-methodology" id="methodology">
        <div className="aw-meth-inner">
          <div className="aw-meth-left">
            <p className="aw-meth-eyebrow">How We Judge</p>
            <h2 className="aw-meth-title">Independent by <span className="aw-green">Design.</span></h2>
            <div className="aw-meth-rule"></div>
            <p className="aw-meth-desc">Every category winner is determined by the same process: data collection, scoring, and editorial sign-off. The methodology is consistent across all 16 categories.</p>
            <div className="aw-meth-editorial">
              <div className="aw-meth-editorial-head">
                <div className="aw-meth-editorial-icon"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                <span className="aw-meth-editorial-title">Editorial Independence</span>
              </div>
              <p className="aw-meth-editorial-text">MyTradingReviews generates revenue through broker listings and affiliate partnerships. This does not influence award outcomes. Listed brokers are scored by the same criteria as unlisted ones. Full scoring data is published with every award result.</p>
            </div>
          </div>
          <div className="aw-timeline">
            <div className="aw-step"><div className="aw-step-line"></div><div className="aw-step-icon-col"><div className="aw-step-icon"><svg viewBox="0 0 24 24"><polygon points="22 3 2 9 12 13 16 23 22 3"/></svg></div></div><div className="aw-step-content"><div className="aw-step-head"><span className="aw-step-num">01</span><h3 className="aw-step-title">Broker Shortlisting</h3></div><p className="aw-step-desc">We start with brokers that meet a minimum regulatory threshold: at least one Tier 1 or Tier 2 licence. Unregulated or offshore-only brokers are excluded from all award categories.</p></div></div>
            <div className="aw-step"><div className="aw-step-line"></div><div className="aw-step-icon-col"><div className="aw-step-icon"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg></div></div><div className="aw-step-content"><div className="aw-step-head"><span className="aw-step-num">02</span><h3 className="aw-step-title">Data Collection</h3></div><p className="aw-step-desc">Our team collects live data on spreads, execution quality, deposit and withdrawal times, platform uptime, and support response rates. This is done through direct testing, not broker-supplied figures.</p></div></div>
            <div className="aw-step"><div className="aw-step-line"></div><div className="aw-step-icon-col"><div className="aw-step-icon"><svg viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div></div><div className="aw-step-content"><div className="aw-step-head"><span className="aw-step-num">03</span><h3 className="aw-step-title">Category Scoring</h3></div><p className="aw-step-desc">Each broker is scored on the criteria specific to each award category. Scores are weighted by importance: spread consistency counts more than payment method variety in a cost-focused award.</p></div></div>
            <div className="aw-step"><div className="aw-step-line"></div><div className="aw-step-icon-col"><div className="aw-step-icon"><svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div></div><div className="aw-step-content"><div className="aw-step-head"><span className="aw-step-num">04</span><h3 className="aw-step-title">Editorial Review</h3></div><p className="aw-step-desc">The MyTradingReviews editorial team reviews the top-ranked brokers in each category, cross-checks data against published terms, and applies a final qualitative assessment. Scores can be adjusted with documented reasoning.</p></div></div>
            <div className="aw-step"><div className="aw-step-icon-col"><div className="aw-step-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg></div></div><div className="aw-step-content"><div className="aw-step-head"><span className="aw-step-num">05</span><h3 className="aw-step-title">Winner Announcement</h3></div><p className="aw-step-desc">Winners are announced at the end of the 2026 evaluation period. All scoring data and methodology notes are published alongside each winner, so traders can verify the reasoning themselves.</p></div></div>
          </div>
        </div>
      </section>

      {/* ================================================
            SECTION 04 — PARTICIPATE
           ================================================ */}
      <section className="aw-participate">

        <div className="aw-part-header">
          <p className="aw-part-eyebrow">Participate in the 2026 Awards</p>
          <h2 className="aw-part-title">Help shape the industry.<br/><span className="aw-green">Get recognized.</span> Get <span className="aw-green">listed.</span></h2>
          <p className="aw-part-desc">Whether you want to nominate a broker that stands out or get your company listed for consideration, we make it simple.</p>
        </div>

        <div className="aw-part-cards">
          <div className="aw-part-card aw-part-card-left">
            <div className="aw-part-card-body">
              <div className="aw-part-card-head"><div className="aw-part-card-icon"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div><h3 className="aw-part-card-title">Nominate a Broker</h3></div>
              <div className="aw-part-card-rule"></div>
              <p className="aw-part-card-desc">Know a broker that deserves recognition in one of our 2026 categories? Submit a nomination and our team will review it for inclusion in the evaluation process.</p>
              <a href="#" className="aw-btn aw-btn-primary" style={{ width: 'fit-content', marginTop: '8px' }}>Submit a Nomination <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
            </div>
          </div>
          <div className="aw-part-card">
            <div className="aw-part-card-body">
              <div className="aw-part-card-head"><div className="aw-part-card-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg></div><h3 className="aw-part-card-title">Are You a Broker?</h3></div>
              <div className="aw-part-card-rule"></div>
              <p className="aw-part-card-desc">Get listed on MyTradingReviews and make sure your data is accurate in our evaluation. A listing does not guarantee an award, but it ensures you are in the running.</p>
              <a href="#" className="aw-btn aw-btn-outline" style={{ width: 'fit-content', marginTop: '8px' }}>Get Listed <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
            </div>
          </div>
        </div>

        {/* Timeline Bar — REDESIGN */}
        <div className="aw-part-timeline">

          {/* Header dengan garis kiri kanan */}
          <div className="aw-tl-header">
            <div className="aw-tl-header-line"></div>
            <span className="aw-tl-header-label">2026 Award Timeline</span>
            <div className="aw-tl-header-line"></div>
          </div>

          {/* 4 kolom item */}
          <div className="aw-tl-items">

            <div className="aw-tl-item">
              <div className="aw-tl-icon">
                <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div className="aw-tl-body">
                <span className="aw-tl-title">Nominations Open Now</span>
                <span className="aw-tl-sub">Open now</span>
                <span className="aw-tl-desc">Submit your nominations. We review every submission.</span>
              </div>
            </div>

            <div className="aw-tl-item">
              <div className="aw-tl-icon">
                <svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
              </div>
              <div className="aw-tl-body">
                <span className="aw-tl-title">Data Collection</span>
                <span className="aw-tl-sub">Q3 2026</span>
                <span className="aw-tl-desc">We collect and verify data across all nominated brokers.</span>
              </div>
            </div>

            <div className="aw-tl-item">
              <div className="aw-tl-icon">
                <svg viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
              </div>
              <div className="aw-tl-body">
                <span className="aw-tl-title">Winners Announced</span>
                <span className="aw-tl-sub">Q4 2026</span>
                <span className="aw-tl-desc">Winners are revealed and shortlists are published.</span>
              </div>
            </div>

            <div className="aw-tl-item">
              <div className="aw-tl-icon">
                <svg viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <div className="aw-tl-body">
                <span className="aw-tl-title">Shortlists Published</span>
                <span className="aw-tl-sub">Before Q4 2026</span>
                <span className="aw-tl-desc">Shortlists will be published before the final announcement.</span>
              </div>
            </div>

          </div>
        </div>

      </section>

    </div>
  );
}