import type { CSSProperties } from 'react';

/**
 * Clinical hero illustration for the landing screen: a patient record on the left,
 * trial criteria matched to cited evidence on the right. Replaces the former dark orb.
 */
export default function LandingOrb() {
  return (
    <div className="hero-art" aria-hidden="true">
      <svg viewBox="0 0 360 260" width="360" height="260" className="max-w-[86vw]" role="img" aria-label="Patient record matched to trial criteria">
        <defs>
          <linearGradient id="acc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#14b8a6" />
            <stop offset="1" stopColor="#0d9488" />
          </linearGradient>
        </defs>

        {/* Patient record card */}
        <g className="hero-float">
          <rect x="18" y="40" width="150" height="190" rx="16" fill="#ffffff" stroke="#e2e8f0" />
          <rect x="18" y="40" width="150" height="40" rx="16" fill="#f0fdfa" />
          <circle cx="44" cy="60" r="10" fill="url(#acc)" />
          <rect x="62" y="54" width="78" height="6" rx="3" fill="#cbd5e1" />
          <rect x="62" y="66" width="52" height="5" rx="2.5" fill="#e2e8f0" />
          {[100, 120, 140, 160, 180, 200].map((y, i) => (
            <rect key={y} x="36" y={y} width={i % 2 ? 108 : 118} height="7" rx="3.5" fill="#eef2f7" />
          ))}
        </g>

        {/* Connector */}
        <path d="M168 135 H214" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" fill="none" />

        {/* Criterion rows with verdicts */}
        <g className="hero-rows">
          {[
            { y: 70, c: '#16a34a', mark: 'check' },
            { y: 118, c: '#d97706', mark: 'q' },
            { y: 166, c: '#dc2626', mark: 'cross' },
          ].map(({ y, c, mark }, i) => (
            <g key={y} style={{ '--i': i } as CSSProperties} className="hero-row">
              <rect x="214" y={y} width="128" height="42" rx="12" fill="#ffffff" stroke="#e2e8f0" />
              <circle cx="236" cy={y + 21} r="11" fill={c} opacity="0.14" />
              {mark === 'check' && <path d={`M231 ${y + 21} l4 4 l7 -8`} stroke={c} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
              {mark === 'cross' && <path d={`M232 ${y + 16} l8 10 M240 ${y + 16} l-8 10`} stroke={c} strokeWidth="2.4" fill="none" strokeLinecap="round" />}
              {mark === 'q' && <text x="236" y={y + 26} textAnchor="middle" fontSize="15" fontWeight="700" fill={c} fontFamily="sans-serif">?</text>}
              <rect x="256" y={y + 13} width="70" height="6" rx="3" fill="#cbd5e1" />
              <rect x="256" y={y + 25} width="48" height="5" rx="2.5" fill="#e8edf3" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
