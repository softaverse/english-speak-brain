'use client';

import { useState } from 'react';
import VoiceRecorder from './VoiceRecorder';
import AnalysisFeedback from './AnalysisFeedback';
import { uploadAudioForAnalysis, transcribeAudio } from '@/lib/api';
import type { SentenceAnalysis, TranscriptionResponse } from '@/types';
import { Loader2, FileAudio } from 'lucide-react';

// Mock user ID - in production, this would come from auth context
const MOCK_USER_ID = 'user-123';

export default function PracticePage() {
  const [transcription, setTranscription] = useState<TranscriptionResponse | null>(null);
  const [analysis, setAnalysis] = useState<SentenceAnalysis | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAudioBlob, setCurrentAudioBlob] = useState<Blob | null>(null);

  const handleTranscriptionRequest = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setError(null);
    setCurrentAudioBlob(audioBlob);

    try {
      const response = await transcribeAudio(audioBlob, {
        language: 'en',
        temperature: 0.2,
      });

      console.log('Transcription response:', response);

      if (response.success && response.data) {
        console.log('Setting transcription data:', response.data);
        console.log('Has text property:', 'text' in response.data);
        console.log('Text value:', response.data.text);
        setTranscription(response.data);
      } else {
        setError(
          response.error?.message || 'Failed to transcribe audio. Please try again.'
        );
      }
    } catch (err) {
      setError('An unexpected error occurred during transcription. Please try again.');
      console.error('Transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleAnalysisRequest = async () => {
    if (!currentAudioBlob) {
      setError('No audio recording available.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await uploadAudioForAnalysis(currentAudioBlob, MOCK_USER_ID);

      if (response.success && response.data) {
        setAnalysis(response.data.analysis);
      } else {
        setError(
          response.error?.message || 'Failed to analyze audio. Please try again.'
        );
      }
    } catch (err) {
      setError('An unexpected error occurred during analysis. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewRecording = () => {
    setTranscription(null);
    setAnalysis(null);
    setError(null);
    setCurrentAudioBlob(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Practice Speaking</h1>
        <p className="mt-2 text-gray-600">
          Record yourself speaking English and get instant AI-powered feedback
        </p>
      </div>

      {/* Debug Info */}
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-xs font-mono">
        <div className="font-semibold mb-2">Debug Info:</div>
        <div>Has transcription: {transcription ? 'Yes' : 'No'}</div>
        <div>Has analysis: {analysis ? 'Yes' : 'No'}</div>
        <div>Is transcribing: {isTranscribing ? 'Yes' : 'No'}</div>
        <div>Is analyzing: {isAnalyzing ? 'Yes' : 'No'}</div>
        {transcription && (
          <div className="mt-2">
            <div>Transcription text length: {transcription.text?.length || 0}</div>
            <div>Transcription preview: {transcription.text?.substring(0, 50) || 'N/A'}</div>
          </div>
        )}
      </div>

      {/* Voice Recorder */}
      {!transcription && !analysis && (
        <VoiceRecorder
          onAnalysisRequest={handleTranscriptionRequest}
          autoSubmit={true}
        />
      )}

      {/* Transcribing State */}
      {isTranscribing && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary-600" />
          <p className="text-lg font-medium text-gray-700">Transcribing your speech...</p>
          <p className="mt-1 text-sm text-gray-500">
            Converting audio to text using AI
          </p>
        </div>
      )}

      {/* Analyzing State */}
      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary-600" />
          <p className="text-lg font-medium text-gray-700">Analyzing your speech...</p>
          <p className="mt-1 text-sm text-gray-500">
            This may take a few seconds
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-error-50 p-4 text-center">
          <p className="font-medium text-error-900">Error</p>
          <p className="mt-1 text-sm text-error-700">{error}</p>
          <button
            onClick={handleNewRecording}
            className="mt-3 text-sm font-medium text-error-700 underline hover:text-error-800"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Transcription Results */}
      {transcription && !analysis && !isTranscribing && !isAnalyzing && (
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <FileAudio className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Transcription</h2>
            </div>

            <div className="rounded-md bg-gray-50 p-4">
              <p className="text-gray-800 leading-relaxed">
                {transcription.text}
              </p>
            </div>

            {transcription.language && (
              <p className="mt-3 text-sm text-gray-500">
                Language: <span className="font-medium">{transcription.language}</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleAnalysisRequest}
              className="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700 transition-colors"
            >
              Analyze Speech Quality
            </button>
            <button
              onClick={handleNewRecording}
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              New Recording
            </button>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && !isAnalyzing && (
        <>
          {/* Show transcription before analysis */}
          {transcription && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <FileAudio className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">Your Speech</h2>
              </div>

              <div className="rounded-md bg-gray-50 p-4">
                <p className="text-gray-800 leading-relaxed">
                  {transcription.text}
                </p>
              </div>
            </div>
          )}

          <AnalysisFeedback analysis={analysis} />

          {/* New Recording Button */}
          <div className="text-center">
            <button
              onClick={handleNewRecording}
              className="text-primary-600 hover:text-primary-700 font-medium underline"
            >
              Start a New Recording
            </button>
          </div>
        </>
      )}
    </div>
  );
}
