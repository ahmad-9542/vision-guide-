import React from 'react';

/**
 * Header component for VisionGuide
 * Displays application branding, purpose tagline, and accessibility status.
 */
export default function Header() {
  return (
    <header className="vg-header" role="banner">
      <div className="vg-header-brand">
        <div className="vg-logo-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <div>
          <h1 className="vg-title" id="app-title">VisionGuide</h1>
          <p className="vg-tagline">See the world through AI-powered assistance.</p>
        </div>
      </div>
      <div className="vg-header-badge" aria-label="Project Status: Foundation Stage">
        <span className="vg-status-dot" aria-hidden="true"></span>
        <span className="vg-status-text">Foundation Stage</span>
      </div>
    </header>
  );
}
