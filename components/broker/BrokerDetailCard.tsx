'use client';
import { Broker } from '@/types/broker';
import '@/styles/broker-detail.css'; // Mengimpor CSS Elementor yang sudah diekstrak

interface Props {
  broker: Broker;
}

export default function BrokerDetailCard({ broker }: Props) {
  // Logic Extract Domain (sama seperti di BrokerCard.tsx)
  let domain = '';
  try {
    if (broker.website && broker.website !== '--') {
      const urlObj = new URL(broker.website.startsWith('http') ? broker.website : 'https://' + broker.website);
      domain = urlObj.hostname.replace('www.', '');
    }
  } catch (e) {}

  const logoSrc = domain 
    ? `https://logo.clearbit.com/${domain}` 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(broker.name)}&background=101010&color=fff&size=132`;

  // Render Stars dinamis
  const score = broker.score || 0;
  const numStars = Math.round(score / 2);
  const stars = Array(5).fill(0).map((_, i) => (
    <svg key={i} className="star" viewBox="0 0 24 24" fill={i < numStars ? "#ffcc00" : "#333"} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
    </svg>
  ));

  const updateDate = new Date(broker.updated_at || broker.created_at || new Date()).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric'
  });

  return (
    <section className="broker-card" aria-label={`${broker.name} broker overview card`}>
      <header className="header">
        <div className="logo-box">
          <img src={logoSrc} alt={`${broker.name} logo`} loading="lazy" onError={(e) => { e.currentTarget.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`; }} />
        </div>

        <div>
          <div className="name-row">
            <h1 className="name">{broker.name}</h1>
            <span className="verified-badge"><span className="verified-dot">&#10003;</span>MTR verified</span>
          </div>

          <div className="chips" aria-label="Broker tags">
            {broker.account_type && broker.account_type.length > 0 && (
              <span className="chip">{broker.account_type[0]}</span>
            )}
            {broker.regulation && broker.regulation.map((reg, idx) => (
              <span key={idx} className="chip">{reg}</span>
            ))}
            {broker.regulation_tier && (
              <span className="chip warn">{broker.regulation_tier}</span>
            )}
            <span className="chip">
              {broker.hq_country || 'Unknown HQ'} | Founded: {broker.founded_approx || 'Unknown'}
            </span>
          </div>
        </div>

        <div className="score-col">
          <p className="score">{score.toFixed(1)} <small>/10</small></p>
          <div className="stars" aria-hidden="true">
            {stars}
          </div>
          <p className="score-hint">Editorial score</p>
        </div>
      </header>
      
      {/* Trust Panel (Dibangun dari CSS class Elementor) */}
      <div className="mtr-trust-panel">
        <div className="mtr-trust-person">
          <div className="mtr-trust-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>MTR</div>
          <div className="mtr-trust-meta">
            <span className="mtr-trust-role">Reviewed By</span>
            <span className="mtr-trust-name">MyTradingReviews Team</span>
          </div>
        </div>
        <div className="mtr-trust-date-wrap mtr-trust-meta">
           <span className="mtr-trust-role">Last Updated</span>
           <span className="mtr-trust-name">{updateDate}</span>
        </div>
      </div>

      {broker.quick_verdict && (
        <section className="verdict" aria-label="Quick verdict">
          <strong>Quick Verdict :</strong> {broker.quick_verdict}
        </section>
      )}

      <section className="stats-grid" aria-label="Broker facts">
        <article className="stat">
          <p className="sl">Min. Deposit</p>
          <p className="sv">{broker.min_deposit !== null && broker.min_deposit !== undefined ? `$${broker.min_deposit}` : '—'}</p>
          <p className="ss">{broker.min_deposit_note || ''}</p>
        </article>

        <article className="stat">
          <p className="sl">Max Leverage</p>
          <p className="sv warn">{broker.max_leverage ? `1:${broker.max_leverage}` : '—'}</p>
          <p className="ss">{broker.leverage_note || ''}</p>
        </article>

        <article className="stat">
          <p className="sl">Regulation Tier</p>
          <p className="sv warn">{broker.regulation_tier || '—'}</p>
          <p className="ss">{broker.regulation_note || ''}</p>
        </article>

        <article className="stat">
          <p className="sl">Broker Type</p>
          <div className="sv">
            {broker.account_type && broker.account_type.map((t, i) => (
               <span key={i} className="pill neutral" style={{ marginRight: '4px' }}>{t}</span>
            ))}
            {(!broker.account_type || broker.account_type.length === 0) && '—'}
          </div> 
          <p className="ss">{broker.broker_type_note || ''}</p>
        </article>

        <article className="stat">
          <p className="sl">Copy Trading</p>
          <p className="sv"><span className="pill neutral">{broker.copy_trading || '—'}</span></p>
          <p className="ss">{broker.copy_trading_note || ''}</p>
        </article>

        <article className="stat">
          <p className="sl">Founded</p>
          <p className="sv">{broker.founded_approx || '—'}</p>
          <p className="ss">{broker.founded_note || ''}</p>
        </article>

        <article className="stat">
          <p className="sl">Spreads From</p>
          <p className="sv good">{broker.spreads_from || '—'}</p>
          <p className="ss">{broker.spreads_note || ''}</p>
        </article>

        <article className="stat">
          <p className="sl">Withdrawal</p>
          <p className="sv">{broker.withdrawal_time || '—'}</p>
          <p className="ss">{broker.withdrawal_note || ''}</p>
        </article>

        <article className="stat">
          <p className="sl">Instruments</p>
          <p className="sv" style={{ fontSize: '18px' }}>{broker.instruments || '—'}</p>
          <p className="ss">{broker.instruments_note || ''}</p>
        </article>

        <article className="stat">
          <p className="sl">Demo Account</p>
          <p className="sv"><span className="pill neutral">{broker.demo_account || '—'}</span></p>
          <p className="ss">{broker.demo_account_note || ''}</p>
        </article>

        <article className="stat span-2">
          <p className="sl">Platforms</p>
          <div className="stat-scroll-row">
            {broker.platforms && broker.platforms.length > 0 ? (
              broker.platforms.map((plat, idx) => (
                <span key={idx} className="chip">{plat}</span>
              ))
            ) : (
              <span className="chip">N/A</span>
            )}
          </div>
          <p className="ss">{broker.platform_note || ''}</p>
        </article>

        <article className="stat span-2">
          <p className="sl">Payment Methods</p>
          <div className="pay-row">
            {broker.payment_methods && broker.payment_methods.length > 0 ? (
              broker.payment_methods.map((method, idx) => (
                <span key={idx} className="pay-chip">{method}</span>
              ))
            ) : (
              <span className="pay-chip">N/A</span>
            )}
          </div>
        </article>
      </section>

      <section className="pros-cons" aria-label="Pros and cons">
        <article className="box pros">
          <h3>Pros</h3>
          <ul className="list">
            {broker.pros && broker.pros.length > 0 ? (
              broker.pros.map((pro, idx) => (
                <li key={idx}><div className="dot good"></div>{pro}</li>
              ))
            ) : (
              <li>No pros data available.</li>
            )}
          </ul>
        </article>
        <article className="box cons">
          <h3>Cons</h3>
          <ul className="list">
            {broker.cons && broker.cons.length > 0 ? (
              broker.cons.map((con, idx) => (
                <li key={idx}><div className="dot bad"></div>{con}</li>
              ))
            ) : (
              <li>No cons data available.</li>
            )}
          </ul>
        </article>
      </section>

      {broker.offer_title && (
        <section className="offer" aria-label="Exclusive offer">
          <div>
            <p className="offer-kicker">Exclusive Offer</p>
            <p className="offer-title">{broker.offer_title}</p>
            <div className="offer-sub">{broker.offer_desc || ''}</div>
            <div className="offer-note">{broker.offer_note || ''}</div>
          </div>
          <a className="btn btn-primary" href={broker.offer_url || broker.affiliate_url || broker.website || '#'} target="_blank" rel="nofollow sponsored noopener">
            {broker.offer_label || 'Claim Offer'}
          </a>
        </section>
      )}

      <section className="cta-row" aria-label="Actions">
        <a className="btn btn-primary" href={broker.affiliate_url || broker.website || '#'} target="_blank" rel="nofollow sponsored noopener">Open Account</a>
        <a className="report-link" href="#" target="_blank" rel="noopener">Report issue</a>
      </section>

      <hr className="divider" />

      <section className="trust-row" aria-label="Trust signals">
        {broker.trust_signals && broker.trust_signals.map((signal, idx) => (
          <span key={idx} className="trust-item">
            <span className="trust-dot good"></span>
            {signal}
          </span>
        ))}
        
        {broker.trust_pilot_score && (
          <span className="trust-item">
            <span className="trust-dot good"></span>
            Trustpilot: {broker.trust_pilot_score}
          </span>
        )}
      </section>
      
      {broker.awards && broker.awards.length > 0 && (
        <div className="award-row" aria-label="Awards and recognitions" style={{ marginTop: '16px' }}>
          {broker.awards.map((award, idx) => (
            <span key={idx} className="award">{award}</span>
          ))}
        </div>
      )}
    </section>
  );
}