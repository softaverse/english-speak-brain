'use client';

import { useCallback, useState, useEffect } from 'react';
import { Mic, Square, X } from 'lucide-react';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import { formatDuration } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import AudioVisualizer from '@/components/ui/AudioVisualizer';

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
    resetRecording,
    isSupported,
    error,
    audioStream,
  } = useAudioRecorder();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleStartClick = async () => {
    setHasAutoSubmitted(false); // Reset auto-submit flag
    setAnalysisError(null); // Clear any previous analysis errors
    try {
      await startRecording();
    } catch (err) {
      // Error is handled by useAudioRecorder hook
    }
  };

  const handleStopClick = async () => {
    await stopRecording();
    // Note: Auto-submit happens in useEffect when audioBlob is created
  };

  const handleCancelClick = () => {
    setHasAutoSubmitted(false); // Reset auto-submit flag
    resetRecording(); // This will stop recording and clear all data without creating an audioBlob
  };

  const handleSubmitClick = useCallback(async () => {
    if (!recordingState.audioBlob) {
      return;
    }

    setAnalysisError(null); // Clear any previous errors

    if (onRecordingComplete) {
      onRecordingComplete(recordingState.audioBlob, recordingState.duration);
    }

    if (onAnalysisRequest) {
      setIsAnalyzing(true);
      try {
        await onAnalysisRequest(recordingState.audioBlob);
      } catch (err) {
        // Set user-friendly error message
        const errorMessage = err instanceof Error ? err.message : '分析失敗，請重試';
        setAnalysisError(errorMessage);
      } finally {
        setIsAnalyzing(false);
        // Reset to initial state after submission attempt (success or failure)
        // This ensures the user can always attempt another recording
        setHasAutoSubmitted(false);
        resetRecording();
      }
    }
  }, [recordingState.audioBlob, recordingState.duration, onRecordingComplete, onAnalysisRequest, resetRecording]);

  // Auto-submit when recording is complete
  useEffect(() => {
    const shouldAutoSubmit =
      autoSubmit &&
      recordingState.audioBlob &&
      !recordingState.isRecording &&
      !isAnalyzing &&
      !hasAutoSubmitted;

    if (shouldAutoSubmit) {
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
        {/* Recording Status */}
        <div className="text-center">
          {isAnalyzing ? (
            // Processing state - show while transcribing
            <div className="space-y-4">
              <div className="mx-auto h-20 w-20">
                <div className="h-full w-full animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
              </div>
              <p className="text-xl font-semibold text-primary-600">處理中...</p>
              <p className="text-sm text-gray-600">正在轉錄您的語音...</p>
            </div>
          ) : recordingState.isRecording ? (
            // Recording state - show timer and visualizer
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 rounded-full animate-pulse bg-red-500" />
                <p className="text-xl font-semibold text-gray-900">錄音中...</p>
              </div>
              <p className="text-4xl font-mono font-bold text-gray-900">
                {formatDuration(recordingState.duration)}
              </p>

              {/* Audio Visualizer */}
              <div className="mx-auto max-w-2xl">
                <AudioVisualizer
                  audioStream={audioStream}
                  isActive={true}
                  height={120}
                />
              </div>

              <p className="text-sm text-gray-600">
                🎤 正在錄音中 - 講錯了可以隨時點擊「取消重錄」重新開始
              </p>
            </div>
          ) : (
            // Initial state - ready to record
            <div className="space-y-3">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
                <Mic className="h-12 w-12 text-blue-600" />
              </div>
              <p className="text-xl font-semibold text-gray-900">
                準備開始練習
              </p>
              <p className="text-sm text-gray-600">
                點擊下方按鈕開始錄音
              </p>
            </div>
          )}
        </div>

        {/* Error Messages */}
        {error && (
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-900">錄音錯誤：</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        )}

        {analysisError && (
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-900">分析錯誤：</p>
            <p className="mt-1 text-sm text-red-700">{analysisError}</p>
            <button
              onClick={() => setAnalysisError(null)}
              className="mt-2 text-sm font-medium text-red-700 underline hover:text-red-800"
            >
              關閉
            </button>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          {/* Initial State: Show Start Button */}
          {!recordingState.isRecording && !isAnalyzing && (
            <button
              onClick={handleStartClick}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 active:scale-95"
              style={{ cursor: 'pointer' }}
            >
              <Mic className="h-6 w-6" />
              開始錄音
            </button>
          )}

          {/* Recording State: Show Stop and Cancel Buttons */}
          {recordingState.isRecording && (
            <>
              <button
                onClick={handleStopClick}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-green-600 px-6 text-lg font-semibold text-white shadow-lg transition-all hover:bg-green-700 active:scale-95"
              >
                <Square className="h-5 w-5" />
                完成錄音
              </button>
              <button
                onClick={handleCancelClick}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-gray-600 px-6 text-lg font-semibold text-white shadow-lg transition-all hover:bg-gray-700 active:scale-95"
              >
                <X className="h-5 w-5" />
                取消重錄
              </button>
            </>
          )}
        </div>

        {/* Tips */}
        {!recordingState.isRecording && !isAnalyzing && (
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="mb-2 font-semibold text-blue-900">使用提示：</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• 請清晰自然地說話</li>
              <li>• 找一個安靜的地方</li>
              <li>• 允許瀏覽器使用麥克風</li>
              <li>• 講錯了？隨時點擊「取消重錄」重新開始！</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
