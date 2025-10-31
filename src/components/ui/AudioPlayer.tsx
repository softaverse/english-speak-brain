'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Download } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface AudioPlayerProps {
  audioBlob: Blob;
  recordedDuration: number;
}

export default function AudioPlayer({ audioBlob, recordedDuration }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(recordedDuration);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const animationFrameRef = useRef<number | undefined>(undefined);
  const isUpdatingRef = useRef(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const currentTimeDisplayRef = useRef<HTMLSpanElement>(null);

  // Log initial values for debugging
  useEffect(() => {
    console.log('🎵 AudioPlayer initialized:', {
      blobSize: audioBlob.size,
      blobType: audioBlob.type,
      recordedDuration: recordedDuration,
    });
  }, [audioBlob, recordedDuration]);

  useEffect(() => {
    // Create object URL for the audio blob
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);

    // Cleanup
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [audioBlob]);

  // 使用 useRef 來存儲更新函數，避免閉包問題
  const updateProgressRef = useRef<(() => void) | undefined>(undefined);

  // 定義更新函數（每次渲染都更新以訪問最新的 state）
  updateProgressRef.current = () => {
    const audio = audioRef.current;

    console.log('🔄 updateProgress called:', {
      hasAudio: !!audio,
      paused: audio?.paused,
      ended: audio?.ended,
      currentTime: audio?.currentTime,
      isUpdating: isUpdatingRef.current
    });

    if (audio && !audio.paused && !audio.ended && isUpdatingRef.current) {
      // 立即更新當前時間
      setCurrentTime(audio.currentTime);
      // 繼續下一幀更新
      animationFrameRef.current = requestAnimationFrame(() => {
        updateProgressRef.current?.();
      });
      console.log('✅ Next frame scheduled:', animationFrameRef.current);
    } else {
      // 停止時清理
      isUpdatingRef.current = false;
      animationFrameRef.current = undefined;
      if (audio) {
        console.log('⏸ Progress update stopped:', {
          paused: audio.paused,
          ended: audio.ended,
          currentTime: audio.currentTime
        });
      }
    }
  };

  // 啟動進度更新的輔助函數
  const startProgressUpdate = useCallback(() => {
    console.log('🚀 Starting progress update');
    isUpdatingRef.current = true;
    updateProgressRef.current?.();
  }, []);

  // 停止進度更新的輔助函數
  const stopProgressUpdate = useCallback(() => {
    console.log('🛑 Stopping progress update');
    isUpdatingRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
  }, []);

  // 組件卸載時清理 animation frame
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, []);

  // 音頻事件處理
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      const audioDuration = audio.duration;
      if (audioDuration && isFinite(audioDuration) && audioDuration > 0) {
        setDuration(audioDuration);
        console.log('✓ Audio duration from metadata:', audioDuration);
      } else {
        setDuration(recordedDuration);
        console.log('⚠ Using recorded duration as fallback:', recordedDuration);
      }
    };

    const handlePlaying = () => {
      // 音頻真正開始播放時，確保進度更新已啟動
      console.log('▶️ Audio playing event fired');
      if (!isUpdatingRef.current) {
        startProgressUpdate();
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      stopProgressUpdate();
    };

    const handleDurationChange = () => {
      const audioDuration = audio.duration;
      if (audioDuration && isFinite(audioDuration) && audioDuration > 0) {
        setDuration(audioDuration);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [recordedDuration, startProgressUpdate, stopProgressUpdate]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      // 停止進度更新
      stopProgressUpdate();
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
        // 開始平滑的進度更新
        console.log('▶️ Starting smooth progress update');
        startProgressUpdate();
      } catch (error) {
        console.error('播放失敗:', error);
      }
    }
  };

  const handleRestart = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);
    try {
      await audio.play();
      setIsPlaying(true);
      // 開始平滑的進度更新
      console.log('⟲ Restarting with smooth progress');
      startProgressUpdate();
    } catch (error) {
      console.error('重新播放失敗:', error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);

    // 如果正在播放，確保繼續更新進度
    if (isPlaying && !isUpdatingRef.current) {
      console.log('⏩ Resuming progress after seek');
      startProgressUpdate();
    }
  };

  const handleDownload = () => {
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('📥 Audio downloaded to computer');
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <audio ref={audioRef} src={audioUrl || undefined} preload="metadata" />

      <div className="space-y-4">
        {/* Title */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            🎧 Listen to Your Recording
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Play back your recording before submitting for analysis
          </p>
        </div>

        {/* Time Display */}
        <div className="flex items-center justify-between text-sm font-mono text-gray-700">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-10 flex items-center group">
          {/* Background Track */}
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-300 shadow-inner">
            {/* Progress Fill */}
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 relative"
              style={{
                width: `${progress}%`,
                transition: 'width 0.05s linear'  // 超平滑過渡
              }}
            >
              {/* Progress Indicator Dot */}
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white shadow-lg border-2 border-green-600 group-hover:scale-125"
                style={{ transition: 'transform 0.2s ease-out' }}
              />
            </div>
          </div>

          {/* Interactive Range Input */}
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.01"
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full cursor-pointer opacity-0 z-10"
            style={{ height: '40px' }}
          />

          {/* Hover Tooltip */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none">
            Click to jump
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {/* Restart Button */}
          <button
            onClick={handleRestart}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-gray-700 transition-all hover:bg-gray-300 active:scale-95"
            title="Restart"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all hover:bg-green-600 active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" fill="currentColor" />
            ) : (
              <Play className="ml-1 h-8 w-8" fill="currentColor" />
            )}
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white transition-all hover:bg-blue-600 active:scale-95"
            title="Download to Computer"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>

        {/* Download Info */}
        <div className="rounded-lg bg-blue-50 p-3 text-center">
          <p className="text-sm text-blue-800">
            <Download className="inline h-4 w-4 mr-1" />
            Click the download button to save recording to your computer
          </p>
        </div>

        {/* Audio Info */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded bg-white p-2 shadow-sm">
            <div className="font-semibold text-gray-900">
              {(audioBlob.size / 1024).toFixed(1)} KB
            </div>
            <div className="text-gray-600">File Size</div>
          </div>
          <div className="rounded bg-white p-2 shadow-sm">
            <div className="font-semibold text-gray-900">
              {formatDuration(isFinite(duration) ? duration : recordedDuration)}
            </div>
            <div className="text-gray-600">Duration</div>
          </div>
          <div className="rounded bg-white p-2 shadow-sm">
            <div className="font-semibold text-gray-900">
              {audioBlob.type.split('/')[1]?.split(';')[0]?.toUpperCase() || 'AUDIO'}
            </div>
            <div className="text-gray-600">Format</div>
          </div>
        </div>
      </div>
    </div>
  );
}
