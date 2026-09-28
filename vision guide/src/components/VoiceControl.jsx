import React, { useState } from 'react';

/**
 * VoiceControl component
 * Provides an accessibility-focused voice input button placeholder.
 * Speech recognition is deferred to a future development stage.
 */
export default function VoiceControl() {
  const [showNotice, setShowNotice] = useState(false);

  const handleClick = () => {
    setShowNotice(true);
    // Auto-dismiss the notice after 4 seconds
    setTimeout(() => setShowNotice(false), 4000);
  };

  return (
    <section className="vg-voice-section" aria-labelledby="voice-heading">
      <div className="visually-hidden">
        <h2 id="voice-heading">Voice Control Interface</h2>
      </div>

      <div className="vg-voice-container">
        <button
          id="voice-control-trigger"
          type="button"
          className="vg-voice-btn"
          onClick={handleClick}
          aria-label="Voice input control (Speech recognition will be enabled in a later stage)"
          aria-describedby="voice-control-status"
        >
          <span className="vg-voice-icon-circle" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="8" y1="22" x2="16" y2="22"/>
            </svg>
          </span>
          <span className="vg-voice-label-group">
            <span className="vg-voice-label-primary">Voice Control</span>
            <span className="vg-voice-label-secondary">Tap or hold to ask a question</span>
          </span>
        </button>

        <p id="voice-control-status" className="vg-voice-hint">
          Microphone placeholder • Speech recognition will be added in a later stage
        </p>

        {showNotice && (
          <div className="vg-voice-notice" role="status" aria-live="assertive">
            <span>Voice recognition is not active in this foundation stage. It will be enabled in a later phase.</span>
          </div>
        )}
      </div>
    </section>
  );
}
