import React from 'react';
import { ACTION_LABELS } from '../services/visionService.js';

/**
 * ResponseSection component — Step 3: AI Vision Understanding
 *
 * Renders four possible states:
 *   1. idle     – no image captured yet (original placeholder)
 *   2. ready    – image captured; shows thumbnail + Analyse button
 *   3. loading  – analyzeImage() call in-flight; shows spinner
 *   4. result   – analysisResult available; shows text output
 *   5. error    – analysis failed; shows error message
 *
 * @param {string|null}  capturedImage   PNG data-URL from CameraSection
 * @param {string|null}  activeAction    'describe' | 'read' | 'find' | null
 * @param {string}       analysisStatus  'idle' | 'loading' | 'ready' | 'error'
 * @param {object|null}  analysisResult  { text, action, timestamp }
 * @param {string}       analysisError   error message string
 * @param {function}     onAnalyse       trigger analysis
 */
export default function ResponseSection({
  capturedImage,
  activeAction,
  analysisStatus,
  analysisResult,
  analysisError,
  onAnalyse,
}) {
  const actionLabel = activeAction ? ACTION_LABELS[activeAction] : null;
  const canAnalyse  = capturedImage && activeAction && analysisStatus !== 'loading';

  return (
    <section className="vg-response-section" aria-labelledby="response-heading">
      <div className="vg-section-header">
        <h2 id="response-heading" className="vg-section-title">
          <svg className="vg-icon-inline" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Assistant Response
        </h2>
        <div className="vg-tts-placeholder" aria-label="Text to speech placeholder">
          <button
            type="button"
            className="vg-tts-btn"
            disabled
            aria-disabled="true"
            title="Audio readout will be available in a future stage"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>
            <span>Audio (Standby)</span>
          </button>
        </div>
      </div>

      <div
        className="vg-response-card"
        role="region"
        aria-live="polite"
        aria-atomic="true"
        tabIndex="0"
        aria-label="Assistant response container"
      >

        {/* ── IDLE: no image captured yet ─────────────────────────────── */}
        {!capturedImage && (
          <div className="vg-response-content">
            <div className="vg-response-icon-badge" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
            </div>
            <div className="vg-response-text-area">
              <p className="vg-response-placeholder-text">
                AI responses will appear here.
              </p>
              <p className="vg-response-subtext">
                Start the camera, capture a frame, select an analysis mode, then press <strong>Analyse</strong>.
              </p>
            </div>
          </div>
        )}

        {/* ── CAPTURED + READY TO ANALYSE ─────────────────────────────── */}
        {capturedImage && analysisStatus !== 'loading' && (
          <div className="vg-capture-preview-panel">
            {/* Thumbnail */}
            <div className="vg-capture-thumbnail-wrap" aria-label="Captured image preview">
              <img
                src={capturedImage}
                alt="Captured frame ready for AI analysis"
                className="vg-capture-thumbnail"
              />
              <span className="vg-capture-ready-badge" aria-hidden="true">
                ✓ Frame captured
              </span>
            </div>

            {/* Action + Analyse */}
            <div className="vg-capture-action-area">
              {actionLabel ? (
                <>
                  <p className="vg-capture-action-label">
                    <span className="vg-capture-mode-tag">{actionLabel}</span>
                    {' '}analysis prepared
                  </p>
                  <button
                    id="btn-analyse"
                    type="button"
                    className="vg-analyse-btn"
                    onClick={onAnalyse}
                    disabled={!canAnalyse}
                    aria-disabled={!canAnalyse}
                    aria-label={`Run ${actionLabel} analysis on captured image`}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                    </svg>
                    Analyse
                  </button>
                </>
              ) : (
                <p className="vg-capture-action-label vg-capture-action-label--hint">
                  Select an action above, then press <strong>Analyse</strong>.
                </p>
              )}
            </div>

            {/* Analysis result (success) */}
            {analysisStatus === 'ready' && analysisResult && (
              <div className="vg-analysis-result" role="status" aria-live="polite">
                <p className="vg-analysis-result-text">{analysisResult.text}</p>
                <p className="vg-analysis-result-meta">
                  {new Date(analysisResult.timestamp).toLocaleTimeString()}
                </p>
              </div>
            )}

            {/* Analysis error */}
            {analysisStatus === 'error' && analysisError && (
              <div className="vg-analysis-error" role="alert">
                <p className="vg-analysis-error-text">{analysisError}</p>
              </div>
            )}
          </div>
        )}

        {/* ── LOADING ─────────────────────────────────────────────────── */}
        {analysisStatus === 'loading' && (
          <div className="vg-analysis-loading" role="status" aria-live="polite" aria-label="Analysing image…">
            <svg
              className="vg-spin"
              width="36" height="36"
              viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" strokeDasharray="63" strokeDashoffset="21"/>
            </svg>
            <p className="vg-analysis-loading-text">
              Analysing image{actionLabel ? ` — ${actionLabel}` : ''}…
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
