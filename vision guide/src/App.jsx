import React, { useState, useCallback } from 'react';
import Header from './components/Header.jsx';
import CameraSection from './components/CameraSection.jsx';
import ActionButtons from './components/ActionButtons.jsx';
import VoiceControl from './components/VoiceControl.jsx';
import ResponseSection from './components/ResponseSection.jsx';
import Footer from './components/Footer.jsx';
import { analyzeImage } from './services/visionService.js';
import './App.css';

/**
 * VisionGuide Application — Step 3: AI Vision Understanding
 *
 * State ownership:
 *   capturedImage   – base64 data-URL of the last captured camera frame.
 *                     Lifted here so CameraSection, ActionButtons, and
 *                     ResponseSection can all react to it.
 *   activeAction    – the selected analysis mode (describe | read | find).
 *   analysisResult  – object returned by analyzeImage() { text, action, timestamp }
 *   analysisStatus  – 'idle' | 'loading' | 'ready' | 'error'
 */
export default function App() {
  const [activeAction,   setActiveAction]   = useState(null);
  const [capturedImage,  setCapturedImage]  = useState(null); // PNG data-URL
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState('idle'); // 'idle'|'loading'|'ready'|'error'
  const [analysisError,  setAnalysisError]  = useState('');

  // Called by CameraSection when the user presses Capture
  const handleCapture = useCallback((dataUrl) => {
    setCapturedImage(dataUrl);
    // Reset previous analysis whenever a new frame is captured
    setAnalysisResult(null);
    setAnalysisStatus('idle');
    setAnalysisError('');
  }, []);

  // Called by CameraSection when the user presses Retake or Stop
  const handleClearCapture = useCallback(() => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setAnalysisStatus('idle');
    setAnalysisError('');
  }, []);

  // Toggle or switch the selected action mode
  const handleSelectAction = useCallback((actionId) => {
    setActiveAction((prev) => (prev === actionId ? null : actionId));
    // Reset analysis result when switching modes
    setAnalysisResult(null);
    setAnalysisStatus('idle');
    setAnalysisError('');
  }, []);

  /**
   * Trigger AI analysis — called when the user presses "Analyse" in
   * ResponseSection (wired in Step 3, real API call arrives in Step 4).
   */
  const handleAnalyse = useCallback(async () => {
    if (!capturedImage || !activeAction) return;

    setAnalysisStatus('loading');
    setAnalysisResult(null);
    setAnalysisError('');

    try {
      const result = await analyzeImage(capturedImage, activeAction);
      setAnalysisResult(result);
      setAnalysisStatus('ready');
    } catch (err) {
      console.error('[VisionGuide] Analysis error:', err);
      setAnalysisError(err.message || 'An unexpected error occurred during analysis.');
      setAnalysisStatus('error');
    }
  }, [capturedImage, activeAction]);

  return (
    <div className="vg-app-wrapper">
      {/* Keyboard accessible skip-to-content navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="vg-container">
        {/* Header with Title and Tagline */}
        <Header />

        {/* Main Content Area */}
        <main id="main-content" className="vg-main-content">
          {/* Camera Viewport — now reports captured frames up to App */}
          <CameraSection
            onCapture={handleCapture}
            onClearCapture={handleClearCapture}
            capturedImage={capturedImage}
          />

          {/* Primary Action Buttons: Describe, Read, Find */}
          <ActionButtons
            activeAction={activeAction}
            onSelectAction={handleSelectAction}
            capturedImage={capturedImage}
          />

          {/* Voice Control Placeholder */}
          <VoiceControl />

          {/* Response Container — shows capture preview + analysis output */}
          <ResponseSection
            capturedImage={capturedImage}
            activeAction={activeAction}
            analysisStatus={analysisStatus}
            analysisResult={analysisResult}
            analysisError={analysisError}
            onAnalyse={handleAnalyse}
          />
        </main>
      </div>

      {/* Information Footer */}
      <Footer />
    </div>
  );
}
