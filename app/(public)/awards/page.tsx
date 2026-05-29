import '@/styles/awards.css';
import { getAwardsPageData } from '@/lib/awards/queries';
import AwardYearTabs from '@/components/awards/AwardYearTabs';

export const revalidate = 300; // ISR 5 menit

export default async function AwardsPage() {
  const data = await getAwardsPageData();
  const { stats, years } = data;
  const currentYear = stats.current_year;

  return (
    <div className="aw-wrap">

      {/* ================================================
            SECTION 01 — HERO (hardcode)
           ================================================ */}
      <section className="aw-hero">
        <div className="aw-hero-content">
          <span className="aw-eyebrow">
            <span className="aw-eyebrow-dot"></span>
            MTR Broker Awards {currentYear}
          </span>
          <h1 className="aw-hero-title">
            The Best Brokers
            <span className="aw-green">Recognised.</span>
          </h1>
          <p className="aw-hero-desc">
            {stats.categories_count} categories. Independent research. The MyTradingReviews Broker Awards recognise brokers that consistently deliver for traders across regulation, costs, platforms, and service.
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
          <img className="aw-trophy-img" src="https://ibouiklqlhfbzypecbqm.supabase.co/storage/v1/object/public/assets/mtr-hero-banner-latest.png" alt={`MTR Broker Awards ${currentYear} Trophy`}/>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="aw-stats-bar">
        <div className="aw-stat">
          <div className="aw-stat-icon">
            <svg viewBox="0 0 24 24" className="aw-filled"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <div className="aw-stat-body">
            <span className="aw-stat-val">{stats.categories_count}</span>
            <span className="aw-stat-lbl">Award Categories</span>
          </div>
        </div>
        <div className="aw-stat">
          <div className="aw-stat-icon">
            <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="aw-stat-body">
            <span className="aw-stat-val">{stats.brokers_count_bucketed}</span>
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
            <span className="aw-stat-val">{currentYear}</span>
            <span className="aw-stat-lbl">Current Season</span>
          </div>
        </div>
      </div>

      {/* ================================================
            SECTION 02 — AWARD CATEGORIES (Year Tabs)
            Tabs switcher antar tahun, default = tahun terbaru.
            Konten per tab fully dinamis dari DB.
           ================================================ */}
      <AwardYearTabs years={years} />

      {/* ================================================
            SECTION 03 — METHODOLOGY (hardcode)
           ================================================ */}
      <section className="aw-methodology" id="methodology">
        <div className="aw-meth-inner">
          <div className="aw-meth-left">
            <p className="aw-meth-eyebrow">How We Judge</p>
            <h2 className="aw-meth-title">Independent by <span className="aw-green">Design.</span></h2>
            <div className="aw-meth-rule"></div>
            <p className="aw-meth-desc">Every category winner is determined by the same process: data collection, scoring, and editorial sign-off. The methodology is consistent across all categories.</p>
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
            <div className="aw-step"><div className="aw-step-icon-col"><div className="aw-step-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg></div></div><div className="aw-step-content"><div className="aw-step-head"><span className="aw-step-num">05</span><h3 className="aw-step-title">Winner Announcement</h3></div><p className="aw-step-desc">Winners are announced at the end of the {currentYear} evaluation period. All scoring data and methodology notes are published alongside each winner, so traders can verify the reasoning themselves.</p></div></div>
          </div>
        </div>
      </section>

      {/* ================================================
            SECTION 04 — PARTICIPATE (hardcode)
           ================================================ */}
      <section className="aw-participate">

        <div className="aw-part-header">
          <p className="aw-part-eyebrow">Participate in the {currentYear} Awards</p>
          <h2 className="aw-part-title">Help shape the industry.<br/><span className="aw-green">Get recognized.</span> Get <span className="aw-green">listed.</span></h2>
          <p className="aw-part-desc">Whether you want to nominate a broker that stands out or get your company listed for consideration, we make it simple.</p>
        </div>

        <div className="aw-part-cards">
          <div className="aw-part-card aw-part-card-left">
            <div className="aw-part-card-body">
              <div className="aw-part-card-head"><div className="aw-part-card-icon"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div><h3 className="aw-part-card-title">Nominate a Broker</h3></div>
              <div className="aw-part-card-rule"></div>
              <p className="aw-part-card-desc">Know a broker that deserves recognition in one of our {currentYear} categories? Submit a nomination and our team will review it for inclusion in the evaluation process.</p>
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

        {/* Timeline Bar */}
        <div className="aw-part-timeline">

          <div className="aw-tl-header">
            <div className="aw-tl-header-line"></div>
            <span className="aw-tl-header-label">{currentYear} Award Timeline</span>
            <div className="aw-tl-header-line"></div>
          </div>

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
                <span className="aw-tl-sub">Q3 {currentYear}</span>
                <span className="aw-tl-desc">We collect and verify data across all nominated brokers.</span>
              </div>
            </div>

            <div className="aw-tl-item">
              <div className="aw-tl-icon">
                <svg viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
              </div>
              <div className="aw-tl-body">
                <span className="aw-tl-title">Winners Announced</span>
                <span className="aw-tl-sub">Q4 {currentYear}</span>
                <span className="aw-tl-desc">Winners are revealed and shortlists are published.</span>
              </div>
            </div>

            <div className="aw-tl-item">
              <div className="aw-tl-icon">
                <svg viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <div className="aw-tl-body">
                <span className="aw-tl-title">Shortlists Published</span>
                <span className="aw-tl-sub">Before Q4 {currentYear}</span>
                <span className="aw-tl-desc">Shortlists will be published before the final announcement.</span>
              </div>
            </div>

          </div>
        </div>

      </section>

    </div>
  );
}
