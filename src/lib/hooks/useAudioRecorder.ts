import { useState, useRef, useCallback, useEffect } from 'react';
import type { RecordingState } from '@/types';

interface UseAudioRecorderReturn {
  recordingState: RecordingState;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
  isSupported: boolean;
  error: string | null;
  audioStream: MediaStream | null;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // Check browser support after component mounts (client-side only)
  useEffect(() => {
    setIsSupported(
      typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
    );
  }, []);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Update duration timer
  const updateDuration = useCallback(() => {
    const elapsed = (Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000;
    setRecordingState((prev) => ({ ...prev, duration: elapsed }));
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Audio recording is not supported in this browser');
      return;
    }

    try {
      setError(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Try different mime types until we find one that works
      let mimeType = '';
      const possibleTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/mpeg',
      ];

      for (const type of possibleTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      console.log('Using mime type:', mimeType || 'default');

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType || 'audio/webm',
        });
        console.log('Recording stopped, blob size:', audioBlob.size);
        setRecordingState((prev) => ({
          ...prev,
          isRecording: false,
          isPaused: false,
          audioBlob,
        }));

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      // Start recording with timeslice to ensure data is captured
      mediaRecorder.start(1000); // Capture data every 1 second
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;

      console.log('Recording started successfully');

      setRecordingState({
        isRecording: true,
        isPaused: false,
        duration: 0,
      });

      // Start duration timer
      timerRef.current = setInterval(updateDuration, 100);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      console.error('Recording error:', err);
    }
  }, [isSupported, updateDuration]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.stop();

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [recordingState.isRecording]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording && !recordingState.isPaused) {
      mediaRecorderRef.current.pause();
      pausedTimeRef.current = Date.now() - startTimeRef.current;

      setRecordingState((prev) => ({
        ...prev,
        isPaused: true,
      }));

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [recordingState.isRecording, recordingState.isPaused]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording && recordingState.isPaused) {
      mediaRecorderRef.current.resume();
      startTimeRef.current = Date.now() - pausedTimeRef.current;

      setRecordingState((prev) => ({
        ...prev,
        isPaused: false,
      }));

      timerRef.current = setInterval(updateDuration, 100);
    }
  }, [recordingState.isRecording, recordingState.isPaused, updateDuration]);

  // Reset recording
  const resetRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    audioChunksRef.current = [];
    setRecordingState({
      isRecording: false,
      isPaused: false,
      duration: 0,
    });
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    recordingState,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    isSupported,
    error,
    audioStream: streamRef.current,
  };
}
