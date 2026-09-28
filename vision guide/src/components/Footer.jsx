import React from 'react';

/**
 * Footer component
 * Displays stage information, accessibility compliance notice, and copyright.
 */
export default function Footer() {
  return (
    <footer className="vg-footer" role="contentinfo">
      <div className="vg-footer-inner">
        <div>
          <strong>VisionGuide</strong> • Accessibility-first AI Visual Assistant
        </div>
        <div className="vg-footer-badges">
          <span className="vg-footer-tag">WCAG High-Contrast</span>
          <span className="vg-footer-tag">Foundation Phase (Frontend Only)</span>
          <span className="vg-footer-tag">Keyboard Navigable</span>
        </div>
      </div>
    </footer>
  );
}
