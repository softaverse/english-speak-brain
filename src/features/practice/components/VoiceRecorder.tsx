'use client';

import { useCallback, useState, useEffect } from 'react';
import { Mic, Square, Pause, Play, RotateCcw, Send } from 'lucide-react';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import { formatDuration } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import AudioVisualizer from '@/components/ui/AudioVisualizer';
import AudioPlayer from '@/components/ui/AudioPlayer';

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, duration: number) => void;
  onAnalysisRequest?: (audioBlob: Blob) => Promise<void>;
  autoSubmit?: boolean; // Auto-submit recording after stop
}

export default function VoiceRecorder({
  onRecordingComplete,
  onAnalysisRequest,
  autoSubmit = true, // Default to auto-submit
}: VoiceRecorderProps) {
  const {
    recordingState,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    isSupported,
    error,
    audioStream,
  } = useAudioRecorder();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleStartClick = async () => {
    console.log('🎤 Start button clicked!');
    setHasAutoSubmitted(false); // Reset auto-submit flag
    try {
      await startRecording();
      console.log('✅ Recording started successfully');
    } catch (err) {
      console.error('❌ Failed to start recording:', err);
    }
  };

  const handleStopClick = async () => {
    console.log('⏹️ Stop button clicked');
    await stopRecording();
  };

  const handlePauseResumeClick = () => {
    if (recordingState.isPaused) {
      console.log('▶️ Resume button clicked');
      resumeRecording();
    } else {
      console.log('⏸️ Pause button clicked');
      pauseRecording();
    }
  };

  const handleResetClick = () => {
    console.log('🔄 Reset button clicked');
    setHasAutoSubmitted(false); // Reset auto-submit flag
    resetRecording();
  };

  const handleSubmitClick = useCallback(async () => {
    if (!recordingState.audioBlob) {
      console.warn('No audio blob to submit');
      return;
    }

    console.log('📤 Submitting recording, blob size:', recordingState.audioBlob.size);

    if (onRecordingComplete) {
      onRecordingComplete(recordingState.audioBlob, recordingState.duration);
    }

    if (onAnalysisRequest) {
      setIsAnalyzing(true);
      try {
        await onAnalysisRequest(recordingState.audioBlob);
      } catch (err) {
        console.error('Analysis failed:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }
  }, [recordingState.audioBlob, recordingState.duration, onRecordingComplete, onAnalysisRequest]);

  // Auto-submit when recording is complete
  useEffect(() => {
    const shouldAutoSubmit =
      autoSubmit &&
      recordingState.audioBlob &&
      !recordingState.isRecording &&
      !isAnalyzing &&
      !hasAutoSubmitted;

    if (shouldAutoSubmit) {
      console.log('🚀 Auto-submitting recording for transcription');
      setHasAutoSubmitted(true);
      handleSubmitClick();
    }
  }, [recordingState.audioBlob, recordingState.isRecording, autoSubmit, isAnalyzing, hasAutoSubmitted, handleSubmitClick]);

  // Loading state during SSR
  if (!isMounted) {
    return (
      <Card variant="elevated">
        <CardContent className="py-8 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  // Not supported
  if (!isSupported) {
    return (
      <Card variant="bordered">
        <CardContent className="py-8 text-center">
          <p className="text-error-600 font-medium">
            Audio recording is not supported in your browser.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Please use Chrome, Firefox, Edge, or Safari (iOS 14.5+)
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <CardContent className="space-y-6 py-8">
        {/* Debug Info */}
        <div className="rounded-lg bg-gray-100 p-4 text-xs font-mono">
          <div className="space-y-1">
            <div>Mounted: {isMounted ? '✓' : '✗'}</div>
            <div>Supported: {isSupported ? '✓' : '✗'}</div>
            <div>Recording: {recordingState.isRecording ? '✓' : '✗'}</div>
            <div>Paused: {recordingState.isPaused ? '✓' : '✗'}</div>
            <div>Has Audio: {recordingState.audioBlob ? '✓' : '✗'}</div>
            <div>Duration: {recordingState.duration.toFixed(2)}s</div>
            {recordingState.audioBlob && (
              <div>Blob Size: {recordingState.audioBlob.size} bytes</div>
            )}
          </div>
        </div>

        {/* Recording Status */}
        <div className="text-center">
          {recordingState.isRecording ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div
                  className={`h-4 w-4 rounded-full ${
                    recordingState.isPaused
                      ? 'bg-yellow-500'
                      : 'animate-pulse bg-red-500'
                  }`}
                />
                <p className="text-xl font-semibold text-gray-900">
                  {recordingState.isPaused ? 'Paused' : 'Recording...'}
                </p>
              </div>
              <p className="text-4xl font-mono font-bold text-gray-900">
                {formatDuration(recordingState.duration)}
              </p>

              {/* Audio Visualizer */}
              <div className="mx-auto max-w-2xl">
                <AudioVisualizer
                  audioStream={audioStream}
                  isActive={recordingState.isRecording && !recordingState.isPaused}
                  height={120}
                />
              </div>

              <p className="text-sm text-gray-600">
                {recordingState.isPaused
                  ? '⏸️ Recording paused'
                  : '🎤 Speak now - your voice is being captured'}
              </p>
            </div>
          ) : recordingState.audioBlob ? (
            <div className="space-y-4">
              {isAnalyzing ? (
                <>
                  <div className="mx-auto h-20 w-20">
                    <div className="h-full w-full animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
                  </div>
                  <p className="text-xl font-semibold text-primary-600">Processing...</p>
                  <p className="text-sm text-gray-600">
                    {autoSubmit ? 'Transcribing your speech...' : 'Analyzing your recording...'}
                  </p>
                </>
              ) : (
                <>
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                    <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-xl font-semibold text-green-600">Recording Complete!</p>
                </>
              )}
              <p className="text-2xl font-mono font-bold text-gray-900">
                {formatDuration(recordingState.duration)}
              </p>

              {/* Audio Player - only show when not analyzing */}
              {!isAnalyzing && (
                <div className="mx-auto max-w-2xl">
                  <AudioPlayer
                    audioBlob={recordingState.audioBlob}
                    recordedDuration={recordingState.duration}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
                <Mic className="h-12 w-12 text-blue-600" />
              </div>
              <p className="text-xl font-semibold text-gray-900">
                Ready to Practice
              </p>
              <p className="text-sm text-gray-600">
                Click the button below to start recording
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-900">Error:</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          {/* Initial State: Show Start Button */}
          {!recordingState.isRecording && !recordingState.audioBlob && (
            <button
              onClick={handleStartClick}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 active:scale-95"
              style={{ cursor: 'pointer' }}
            >
              <Mic className="h-6 w-6" />
              Start Recording
            </button>
          )}

          {/* Recording State: Show Pause and Stop Buttons */}
          {recordingState.isRecording && (
            <>
              <button
                onClick={handlePauseResumeClick}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-yellow-500 px-6 text-lg font-semibold text-white shadow-lg transition-all hover:bg-yellow-600 active:scale-95"
              >
                {recordingState.isPaused ? (
                  <>
                    <Play className="h-5 w-5" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-5 w-5" />
                    Pause
                  </>
                )}
              </button>
              <button
                onClick={handleStopClick}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 text-lg font-semibold text-white shadow-lg transition-all hover:bg-red-700 active:scale-95"
              >
                <Square className="h-5 w-5" />
                Stop
              </button>
            </>
          )}

          {/* Complete State: Show Reset and Submit Buttons (only if not auto-submitting or not analyzing) */}
          {recordingState.audioBlob && !recordingState.isRecording && !isAnalyzing && (
            <>
              <button
                onClick={handleResetClick}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-6 text-lg font-semibold text-gray-700 shadow transition-all hover:bg-gray-50 active:scale-95"
              >
                <RotateCcw className="h-5 w-5" />
                Record Again
              </button>
              {!autoSubmit && (
                <button
                  onClick={handleSubmitClick}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-green-600 px-8 text-lg font-semibold text-white shadow-lg transition-all hover:bg-green-700 active:scale-95"
                >
                  <Send className="h-5 w-5" />
                  Get Feedback
                </button>
              )}
            </>
          )}
        </div>

        {/* Tips */}
        {!recordingState.isRecording && !recordingState.audioBlob && (
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="mb-2 font-semibold text-blue-900">Tips:</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Speak clearly and naturally</li>
              <li>• Find a quiet place</li>
              <li>• Allow microphone access when prompted</li>
              <li>• Speak complete sentences</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
