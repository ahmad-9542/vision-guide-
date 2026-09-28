import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Camera states
 *   idle        – no camera active, shows "Start Camera" prompt
 *   requesting  – waiting for browser permission dialog
 *   active      – live video stream running
 *   captured    – still image captured, shows preview + Retake
 *   error       – something went wrong, shows user-friendly message
 */
const STATE = {
  IDLE: 'idle',
  REQUESTING: 'requesting',
  ACTIVE: 'active',
  CAPTURED: 'captured',
  ERROR: 'error',
};

/** Map raw browser error names / messages to friendly strings. */
function friendlyError(err) {
  if (!err) return 'An unknown error occurred. Please try again.';
  const name = err.name || '';
  const msg = (err.message || '').toLowerCase();

  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return 'Camera permission was denied. Please allow camera access in your browser settings and try again.';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'No camera was found on this device. Please connect a camera and try again.';
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return 'Your camera is in use by another application. Please close other apps using the camera and try again.';
  }
  if (name === 'OverconstrainedError' || name === 'ConstraintNotSatisfiedError') {
    return 'The camera could not be started with the requested settings. Please try again.';
  }
  if (name === 'SecurityError' || msg.includes('secure')) {
    return 'Camera access is blocked because this page is not served over a secure connection (HTTPS).';
  }
  if (name === 'AbortError') {
    return 'Camera access was interrupted. Please try again.';
  }
  if (name === 'TypeError' || msg.includes('mediadevices') || msg.includes('undefined')) {
    return 'Your browser does not support camera access, or camera access is not available in this context.';
  }
  return 'Unable to access the camera. Please check your browser permissions and try again.';
}

/** Stop every track on a MediaStream safely. */
function stopStream(stream) {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
}

/**
 * @param {function} onCapture       – called with the PNG data-URL when a frame is captured
 * @param {function} onClearCapture  – called when the user retakes or stops the camera
 * @param {string|null} capturedImage – PNG data-URL owned by App (passed back as a prop)
 */
export default function CameraSection({ onCapture, onClearCapture, capturedImage }) {
  const [cameraState, setCameraState] = useState(STATE.IDLE);
  const [errorMessage, setErrorMessage] = useState('');

  const videoRef = useRef(null); // <video> element
  const streamRef = useRef(null); // active MediaStream
  const canvasRef = useRef(null); // off-screen <canvas> for capture

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopStream(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  // ── Attach stream to video element whenever state becomes ACTIVE ───────────
  useEffect(() => {
    if (cameraState === STATE.ACTIVE && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraState]);

  // ── Start Camera ──────────────────────────────────────────────────────────
  const handleStartCamera = useCallback(async () => {
    // Stop any existing stream first (e.g. restarting after Stop)
    stopStream(streamRef.current);
    streamRef.current = null;

    setCameraState(STATE.REQUESTING);
    setErrorMessage('');
    onClearCapture?.();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      streamRef.current = stream;
      setCameraState(STATE.ACTIVE);
    } catch (err) {
      console.error('[VisionGuide] Camera error:', err);
      setErrorMessage(friendlyError(err));
      setCameraState(STATE.ERROR);
    }
  }, []);

  // ── Stop Camera ───────────────────────────────────────────────────────────
  const handleStopCamera = useCallback(() => {
    stopStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    // Notify App that the captured image is cleared
    if (onClearCapture) onClearCapture();
    setCameraState(STATE.IDLE);
  }, [onClearCapture]);

  // ── Capture Frame ─────────────────────────────────────────────────────────
  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    // PNG data URL – kept in memory only, not uploaded anywhere.
    // Notify App so the image can be shared with the entire component tree.
    const dataUrl = canvas.toDataURL('image/png');
    if (onCapture) onCapture(dataUrl);
    setCameraState(STATE.CAPTURED);
  }, [onCapture]);

  // ── Retake ────────────────────────────────────────────────────────────────
  const handleRetake = useCallback(() => {
    // Notify App that the captured image is cleared
    if (onClearCapture) onClearCapture();
    // Stream is still alive; go straight back to ACTIVE
    setCameraState(STATE.ACTIVE);
  }, [onClearCapture]);

  // ─────────────────────────────────────────────────────────────────────────
  // Derived UI values
  // ─────────────────────────────────────────────────────────────────────────
  const badgeLabel = {
    [STATE.IDLE]: 'Camera Inactive',
    [STATE.REQUESTING]: 'Requesting Permission…',
    [STATE.ACTIVE]: 'Live',
    [STATE.CAPTURED]: 'Image Captured',
    [STATE.ERROR]: 'Camera Error',
  }[cameraState];

  const badgeClass = {
    [STATE.IDLE]: 'vg-badge vg-badge-idle',
    [STATE.REQUESTING]: 'vg-badge vg-badge-requesting',
    [STATE.ACTIVE]: 'vg-badge vg-badge-live',
    [STATE.CAPTURED]: 'vg-badge vg-badge-captured',
    [STATE.ERROR]: 'vg-badge vg-badge-error',
  }[cameraState];

  return (
    <section className="vg-camera-section" aria-labelledby="camera-heading">
      {/* Hidden off-screen canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} aria-hidden="true" />

      {/* ── Section Header ──────────────────────────────────── */}
      <div className="vg-section-header">
        <h2 id="camera-heading" className="vg-section-title">
          <svg
            className="vg-icon-inline"
            width="22" height="22"
            viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
          Live Camera View
        </h2>
        <span className={badgeClass} id="camera-status" aria-live="polite">
          {cameraState === STATE.ACTIVE && (
            <span className="vg-live-dot" aria-hidden="true" />
          )}
          {badgeLabel}
        </span>
      </div>

      {/* ── Viewport ────────────────────────────────────────── */}
      <div
        className={`vg-camera-viewport${cameraState === STATE.ACTIVE ? ' vg-camera-viewport--active' : ''}`}
        role="region"
        aria-label="Camera preview area"
        aria-describedby="camera-status"
      >
        {/* Reticle corners – always shown for visual framing */}
        <div className="reticle-corner top-left" aria-hidden="true" />
        <div className="reticle-corner top-right" aria-hidden="true" />
        <div className="reticle-corner bottom-left" aria-hidden="true" />
        <div className="reticle-corner bottom-right" aria-hidden="true" />

        {/* ── LIVE VIDEO ───────────────────────────────────── */}
        {(cameraState === STATE.ACTIVE) && (
          <video
            ref={videoRef}
            className="vg-camera-video"
            autoPlay
            playsInline
            muted
            aria-label="Live camera feed"
          />
        )}

        {/* ── CAPTURED IMAGE ────────────────────────────────── */}
        {cameraState === STATE.CAPTURED && capturedImage && (
          <img
            src={capturedImage}
            className="vg-camera-video"
            alt="Captured still frame from camera"
          />
        )}

        {/* ── IDLE / REQUESTING / ERROR placeholder ────────── */}
        {(cameraState === STATE.IDLE ||
          cameraState === STATE.REQUESTING ||
          cameraState === STATE.ERROR) && (
            <div className="vg-camera-placeholder-content">
              <div className="vg-camera-icon-wrapper" aria-hidden="true">
                {cameraState === STATE.ERROR ? (
                  /* Error icon */
                  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                ) : cameraState === STATE.REQUESTING ? (
                  /* Spinner-style camera icon */
                  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="vg-spin">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                ) : (
                  /* Idle camera icon (crossed-out) */
                  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                    <circle cx="12" cy="13" r="3" />
                    <line x1="2" y1="2" x2="22" y2="22" stroke="#64748b" strokeWidth="1.75" />
                  </svg>
                )}
              </div>

              {cameraState === STATE.ERROR ? (
                <>
                  <p className="vg-camera-primary-msg vg-camera-primary-msg--error">
                    Camera Unavailable
                  </p>
                  <p className="vg-camera-secondary-msg">{errorMessage}</p>
                  <div className="vg-camera-note" role="alert">
                    <span>Check permissions</span> in your browser settings, then try again.
                  </div>
                </>
              ) : cameraState === STATE.REQUESTING ? (
                <>
                  <p className="vg-camera-primary-msg">Requesting Camera Access…</p>
                  <p className="vg-camera-secondary-msg">
                    Please allow camera access when prompted by your browser.
                  </p>
                </>
              ) : (
                <>
                  <p className="vg-camera-primary-msg">Camera Ready to Start</p>
                  <p className="vg-camera-secondary-msg">
                    Press <strong>Start Camera</strong> below to begin your live preview.
                    No images are uploaded or shared.
                  </p>
                  <div className="vg-camera-note" role="note">
                    <span>Privacy</span> • Images stay on your device only
                  </div>
                </>
              )}
            </div>
          )}
      </div>

      {/* ── Camera Controls ─────────────────────────────────── */}
      <div className="vg-camera-controls" role="group" aria-label="Camera controls">

        {/* IDLE or ERROR → Start Camera */}
        {(cameraState === STATE.IDLE || cameraState === STATE.ERROR) && (
          <button
            id="btn-start-camera"
            type="button"
            className="vg-cam-btn vg-cam-btn--start"
            onClick={handleStartCamera}
            aria-label="Start camera"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            Start Camera
          </button>
        )}

        {/* REQUESTING → disabled indicator */}
        {cameraState === STATE.REQUESTING && (
          <button
            type="button"
            className="vg-cam-btn vg-cam-btn--start"
            disabled
            aria-disabled="true"
            aria-label="Waiting for camera permission"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="vg-spin">
              <circle cx="12" cy="12" r="10" strokeDasharray="63" strokeDashoffset="21" />
            </svg>
            Requesting Permission…
          </button>
        )}

        {/* ACTIVE → Capture + Stop */}
        {cameraState === STATE.ACTIVE && (
          <>
            <button
              id="btn-capture"
              type="button"
              className="vg-cam-btn vg-cam-btn--capture"
              onClick={handleCapture}
              aria-label="Capture current camera frame"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="4" fill="currentColor" />
              </svg>
              Capture
            </button>

            <button
              id="btn-stop-camera"
              type="button"
              className="vg-cam-btn vg-cam-btn--stop"
              onClick={handleStopCamera}
              aria-label="Stop camera and close live preview"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" />
              </svg>
              Stop Camera
            </button>
          </>
        )}

        {/* CAPTURED → Retake + Stop */}
        {cameraState === STATE.CAPTURED && (
          <>
            <button
              id="btn-retake"
              type="button"
              className="vg-cam-btn vg-cam-btn--retake"
              onClick={handleRetake}
              aria-label="Retake photo and return to live preview"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Retake
            </button>

            <button
              id="btn-stop-after-capture"
              type="button"
              className="vg-cam-btn vg-cam-btn--stop"
              onClick={handleStopCamera}
              aria-label="Stop camera and discard captured image"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" />
              </svg>
              Stop Camera
            </button>
          </>
        )}
      </div>

      {/* Descriptive status for screen readers */}
      <p className="vg-camera-sr-status visually-hidden" aria-live="polite" aria-atomic="true">
        {cameraState === STATE.IDLE && 'Camera is inactive. Press Start Camera to begin.'}
        {cameraState === STATE.REQUESTING && 'Requesting camera permission from the browser.'}
        {cameraState === STATE.ACTIVE && 'Live camera is active. Press Capture to take a photo.'}
        {cameraState === STATE.CAPTURED && 'Photo captured. Press Retake to take another photo, or Stop Camera to end the session.'}
        {cameraState === STATE.ERROR && `Camera error: ${errorMessage}`}
      </p>
    </section>
  );
}
