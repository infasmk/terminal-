import React, { useRef, useState, useEffect } from 'react';
import { formatBytes, formatDurationSeconds } from '../lib/hash';
import { Play, Pause, Volume2, VolumeX, Maximize, Download, X, Film } from 'lucide-react';

interface VideoPlayerModalProps {
  url: string;
  name: string;
  hash: string;
  duration?: string;
  size?: number;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  url,
  name,
  hash,
  duration,
  size,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setTotalDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050706]/95 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 font-mono text-xs select-none">
      <div
        ref={containerRef}
        className="w-full max-w-4xl bg-[#070b09] border border-[#16251b] rounded-xs shadow-2xl flex flex-col overflow-hidden max-h-[95vh]"
      >
        {/* Header Bar */}
        <div className="bg-[#050907] border-b border-[#142018] px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <Film className="w-4 h-4 text-[#10b981]" />
            <span className="font-bold text-[#e2e8f0] truncate max-w-xs sm:max-w-md">{name}</span>
            {size && <span className="text-[#64748b] text-[10px]">({formatBytes(size)})</span>}
          </div>

          <div className="flex items-center space-x-3">
            <a
              href={url}
              download={name}
              target="_blank"
              rel="noreferrer"
              className="text-[#10b981] hover:text-[#34d399] transition-colors p-1"
              title="Download Original File"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="text-[#64748b] hover:text-[#ef4444] transition-colors p-1"
              title="Close Player [ESC]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Screen */}
        <div className="relative bg-black flex-1 flex items-center justify-center overflow-hidden min-h-[300px]">
          <video
            ref={videoRef}
            src={url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
            className="w-full max-h-[65vh] object-contain cursor-pointer"
            autoPlay
          />
        </div>

        {/* Technical Player Controls Bar */}
        <div className="bg-[#050907] border-t border-[#142018] p-3 space-y-2">
          {/* Time Scrubber Slider */}
          <div className="flex items-center space-x-3 text-[11px] text-[#94a3b8]">
            <span className="w-12 text-right">{formatDurationSeconds(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={totalDuration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 accent-[#10b981] h-1.5 bg-[#121f17] rounded-xs cursor-pointer"
            />
            <span className="w-12">{formatDurationSeconds(totalDuration)}</span>
          </div>

          {/* Action Buttons & Speed */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlay}
                className="bg-[#0d1a12] border border-[#162a1e] text-[#10b981] hover:bg-[#10b981] hover:text-black px-3 py-1.5 rounded-xs font-bold transition-all flex items-center space-x-1.5"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>

              <div className="flex items-center space-x-1.5">
                <button onClick={toggleMute} className="text-[#64748b] hover:text-[#10b981]">
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-[#ef4444]" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 accent-[#10b981] h-1 bg-[#121f17] rounded-xs cursor-pointer"
                />
              </div>
            </div>

            {/* Playback Speeds */}
            <div className="flex items-center space-x-2">
              <span className="text-[#475569] text-[10px]">SPEED:</span>
              {[0.5, 1.0, 1.5, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-1.5 py-0.5 rounded-xs border text-[10px] ${
                    playbackSpeed === s
                      ? 'border-[#10b981] text-[#10b981] bg-[#0d1c12] font-bold'
                      : 'border-[#121f17] text-[#64748b] hover:text-[#cbd5e1]'
                  }`}
                >
                  {s}x
                </button>
              ))}

              <button
                onClick={toggleFullscreen}
                className="p-1 text-[#64748b] hover:text-[#10b981] transition-colors ml-2"
                title="Fullscreen Mode"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hash & Metadata Footer */}
          <div className="text-[10px] text-[#475569] pt-1 border-t border-[#101b14] flex justify-between">
            <span>SHA256: {hash || 'COMPUTING...'}</span>
            <span>FORMAT: VIDEO/MP4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
