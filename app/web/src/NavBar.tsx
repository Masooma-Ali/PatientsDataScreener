import type { Status } from './api';

export type NavEntry = { id: string; label: string; onSelect: () => void; active?: boolean; disabled?: boolean };

function statusView(status: Status | null) {
  if (!status) return { kind: 'unknown', text: 'Connecting' };
  if (status.state === 'loading') return { kind: 'unknown', text: 'Model loading' };
  if (status.state === 'failed') return { kind: 'failed', text: 'Model failed' };
  return { kind: 'met', text: status.trained ? 'Model ready' : 'Untrained model ready' };
}

export default function NavBar({ entries, status, onBrand }: { entries: NavEntry[]; status: Status | null; onBrand: () => void }) {
  const { kind, text } = statusView(status);
  return (
    <header className="navbar">
      <button type="button" className="navbar-brand" onClick={onBrand} aria-label="CRS home">
        <span className="navbar-logo" aria-hidden="true">CRS</span>
        <span className="navbar-sub">Clinical Trial Criterion Screener</span>
      </button>
      <nav className="navbar-links" aria-label="Main">
        {entries.map(({ id, label, onSelect, active, disabled }) => (
          <button
            key={id}
            type="button"
            className={`navbar-link ${active ? 'navbar-link-active' : ''}`}
            onClick={onSelect}
            disabled={disabled}
            aria-current={active ? 'page' : undefined}
          >
            {label}
          </button>
        ))}
      </nav>
      <p className="navbar-status" role="status">
        <span className={`dot dot-${kind}`} aria-hidden="true" />
        <span className="navbar-status-text">{text}</span>
      </p>
    </header>
  );
}
