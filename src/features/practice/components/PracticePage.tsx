'use client';

import { useState } from 'react';
import VoiceRecorder from './VoiceRecorder';
import { transcribeAudio, generateConversation } from '@/lib/api';
import type { TranscriptionResponse } from '@/types';
import { Loader2, FileAudio } from 'lucide-react';

export default function PracticePage() {
  const [transcription, setTranscription] = useState<TranscriptionResponse | null>(null);
  const [textAnalysis, setTextAnalysis] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAnalyzingText, setIsAnalyzingText] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranscriptionRequest = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setError(null);

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

  const handleTextAnalysisRequest = async () => {
    if (!transcription?.text) {
      setError('No transcription text available to analyze.');
      return;
    }

    setIsAnalyzingText(true);
    setError(null);

    try {
      // Using generateConversation API instead of analyzeText (no history - stateless)
      const response = await generateConversation(
        transcription.text,
        [], // Empty history for now to test the API difference
        {
          temperature: 0.8,
          maxOutputTokens: 300,
        }
      );

      if (response.success && response.data) {
        setTextAnalysis(response.data.text);
      } else {
        setError(
          response.error?.message || 'Failed to analyze text. Please try again.'
        );
      }
    } catch (err) {
      setError('An unexpected error occurred during text analysis. Please try again.');
      console.error('Text analysis error:', err);
    } finally {
      setIsAnalyzingText(false);
    }
  };

  const handleNewRecording = () => {
    setTranscription(null);
    setTextAnalysis(null);
    setError(null);
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
        <div>Has text analysis: {textAnalysis ? 'Yes' : 'No'}</div>
        <div>Is transcribing: {isTranscribing ? 'Yes' : 'No'}</div>
        <div>Is analyzing text: {isAnalyzingText ? 'Yes' : 'No'}</div>
        {transcription && (
          <div className="mt-2">
            <div>Transcription text length: {transcription.text?.length || 0}</div>
            <div>Transcription preview: {transcription.text?.substring(0, 50) || 'N/A'}</div>
          </div>
        )}
      </div>

      {/* Voice Recorder */}
      {!transcription && !textAnalysis && (
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

      {/* Analyzing Text State */}
      {isAnalyzingText && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary-600" />
          <p className="text-lg font-medium text-gray-700">Analyzing your text...</p>
          <p className="mt-1 text-sm text-gray-500">
            Getting AI feedback on your writing
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
      {transcription && !textAnalysis && !isTranscribing && !isAnalyzingText && (
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
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleTextAnalysisRequest}
              disabled={isAnalyzingText}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Get AI Feedback
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

      {/* Text Analysis Results */}
      {textAnalysis && !isAnalyzingText && (
        <>
          {/* Show transcription before feedback */}
          {transcription && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <FileAudio className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">Your Text</h2>
              </div>

              <div className="rounded-md bg-gray-50 p-4">
                <p className="text-gray-800 leading-relaxed">
                  {transcription.text}
                </p>
              </div>
            </div>
          )}

          {/* AI Feedback */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">AI Feedback</h2>
            <div className="prose prose-gray max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">
                {textAnalysis}
              </div>
            </div>
          </div>

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
