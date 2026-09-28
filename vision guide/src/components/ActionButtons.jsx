import React from 'react';

/**
 * ActionButtons component
 * Renders the three primary action controls: Describe, Read, Find.
 *
 * @param {string|null} activeAction    – currently selected action id
 * @param {function}    onSelectAction  – callback when an action is toggled
 * @param {string|null} capturedImage   – PNG data-URL; non-null when a frame is ready
 */
export default function ActionButtons({ activeAction, onSelectAction, capturedImage }) {
  const actions = [
    {
      id: 'describe',
      label: 'Describe',
      subtitle: 'Scene & surroundings overview',
      accentClass: 'action-describe',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
      description: 'Request a comprehensive description of what is in front of the camera.'
    },
    {
      id: 'read',
      label: 'Read',
      subtitle: 'Printed & handwritten text',
      accentClass: 'action-read',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
          <path d="M6 6h10"/>
          <path d="M6 10h10"/>
          <path d="M6 14h6"/>
        </svg>
      ),
      description: 'Detect and read out documents, labels, signs, or text.'
    },
    {
      id: 'find',
      label: 'Find',
      subtitle: 'Locate specific objects or items',
      accentClass: 'action-find',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="11" y1="8" x2="11" y2="14"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      ),
      description: 'Search for and highlight particular objects in the scene.'
    }
  ];

  return (
    <section className="vg-actions-section" aria-labelledby="actions-heading">
      <div className="vg-section-header">
        <h2 id="actions-heading" className="vg-section-title">
          <svg className="vg-icon-inline" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          Primary Actions
        </h2>
        <span className="vg-section-hint">Select a mode</span>
      </div>

      <div className="vg-action-grid" role="group" aria-label="Visual assistance action modes">
        {actions.map((action) => {
          const isSelected = activeAction === action.id;
          return (
            <button
              key={action.id}
              id={`action-btn-${action.id}`}
              type="button"
              className={`vg-action-btn ${action.accentClass} ${isSelected ? 'is-selected' : ''}`}
              onClick={() => onSelectAction(action.id)}
              aria-pressed={isSelected}
              aria-describedby={`action-desc-${action.id}`}
            >
              <div className="vg-action-btn-icon">
                {action.icon}
              </div>
              <div className="vg-action-btn-text">
                <span className="vg-action-title">{action.label}</span>
                <span className="vg-action-subtitle">{action.subtitle}</span>
              </div>
              <span id={`action-desc-${action.id}`} className="visually-hidden">
                {action.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contextual nudge: image captured but no action selected yet */}
      {capturedImage && !activeAction && (
        <div className="vg-action-status-banner" role="status" aria-live="polite">
          <span className="vg-status-indicator-dot" aria-hidden="true"></span>
          <span>
            Image captured — select an action above to prepare for AI analysis.
          </span>
        </div>
      )}

      {/* Selected action confirmation */}
      {activeAction && (
        <div className="vg-action-status-banner" role="status" aria-live="polite">
          <span className="vg-status-indicator-dot" aria-hidden="true"></span>
          <span>
            Mode: <strong>{actions.find(a => a.id === activeAction)?.label}</strong>
            {capturedImage
              ? ' — image ready. Press Analyse in the response panel.'
              : ' — capture an image to continue.'}
          </span>
        </div>
      )}
    </section>
  );
}

