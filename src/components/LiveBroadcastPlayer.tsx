import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCw,
  SkipBack,
  SkipForward,
  PictureInPicture2,
  Signal,
} from 'lucide-react';
import type { TVChannel } from '../data/omniNewsData';

interface LiveBroadcastPlayerProps {
  channel: TVChannel;
  onPrevChannel: () => void;
  onNextChannel: () => void;
}

export const LiveBroadcastPlayer: React.FC<LiveBroadcastPlayerProps> = ({
  channel,
  onPrevChannel,
  onNextChannel,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.85);
  const [isLoadingStream, setIsLoadingStream] = useState<boolean>(true);
  const [usingFallback, setUsingFallback] = useState<boolean>(false);
  const [streamResolution, setStreamResolution] = useState<string>('HD LIVE');
  const [clockText, setClockText] = useState<string>('');
  const [reloadNonce, setReloadNonce] = useState<number>(0);

  // Live Clock (WIB)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClockText(
        `${now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })} WIB`
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset fallback flag when channel changes
  useEffect(() => {
    setUsingFallback(false);
    setIsLoadingStream(true);
  }, [channel.id]);

  // Initialize & attach HLS real live stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const targetUrl =
      usingFallback && channel.fallbackStreamUrl
        ? channel.fallbackStreamUrl
        : channel.streamUrl;

    setIsLoadingStream(true);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const startPlayback = () => {
      video.muted = isMuted;
      video.volume = volume;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoadingStream(false);
          })
          .catch(() => {
            // Autoplay fallback: mute and play
            video.muted = true;
            setIsMuted(true);
            video
              .play()
              .then(() => {
                setIsPlaying(true);
                setIsLoadingStream(false);
              })
              .catch(() => {
                setIsLoadingStream(false);
              });
          });
      }
    };

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
      });
      hlsRef.current = hls;

      hls.loadSource(targetUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        if (data.levels && data.levels.length > 0) {
          const maxLevel = data.levels[data.levels.length - 1];
          if (maxLevel.height) {
            setStreamResolution(`${maxLevel.height}p LIVE`);
          } else {
            setStreamResolution('HD LIVE');
          }
        }
        startPlayback();
      });

      hls.on(Hls.Events.FRAG_BUFFERED, () => {
        setIsLoadingStream(false);
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (!usingFallback && channel.fallbackStreamUrl) {
                setUsingFallback(true);
              } else {
                hls.startLoad();
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              if (!usingFallback && channel.fallbackStreamUrl) {
                setUsingFallback(true);
              } else {
                hls.destroy();
              }
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = targetUrl;
      video.addEventListener('loadedmetadata', startPlayback);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel, usingFallback, reloadNonce]);

  // Sync mute & volume state with video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
    video.volume = volume;
  }, [isMuted, volume]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  const handlePictureInPicture = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch {
      // ignore PiP error
    }
  };

  const handleReloadStream = () => {
    setReloadNonce((n) => n + 1);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-slate-950 overflow-hidden select-none group"
    >
      {/* Real HTML5 HLS Live Video Broadcast */}
      <video
        ref={videoRef}
        poster={channel.thumbnailUrl}
        playsInline
        autoPlay
        muted={isMuted}
        onClick={togglePlay}
        onPlaying={() => {
          setIsLoadingStream(false);
          setIsPlaying(true);
        }}
        onWaiting={() => setIsLoadingStream(true)}
        className="w-full h-full object-contain bg-black cursor-pointer"
      />

      {/* Loading / Buffering Spinner Overlay */}
      {isLoadingStream && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-xs pointer-events-none z-10">
          <div className="w-11 h-11 rounded-full border-3 border-white/20 border-t-rose-500 animate-spin mb-3" />
          <p className="text-xs font-semibold text-white tracking-wide">
            Menghubungkan Siaran Langsung {channel.name}...
          </p>
        </div>
      )}

      {/* Top Overlay: Channel Identity & Live Clock */}
      <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none z-20">
        <div className="flex items-center gap-2">
          <span
            style={{ backgroundColor: channel.badgeColor }}
            className="px-2.5 py-1 rounded-md text-white text-[11px] font-bold tracking-wider uppercase inline-flex items-center gap-1.5 shadow-lg"
          >
            <Signal className="w-3.5 h-3.5" />
            <span>SIARAN LANGSUNG</span>
          </span>

          <div className="px-3 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-white/15 text-white text-xs font-semibold flex items-center gap-2 shadow-md">
            <span>{channel.name}</span>
            <span className="text-slate-400">·</span>
            <span className="text-sky-300 font-mono text-[11px]">
              {streamResolution}
            </span>
          </div>
        </div>

        <div className="px-3 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-white/15 text-slate-100 font-mono text-xs shadow-md">
          {clockText}
        </div>
      </div>

      {/* Prominent Unmute Prompt Button if Muted by Browser Autoplay Policy */}
      {isMuted && !isLoadingStream && (
        <button
          type="button"
          onClick={toggleMute}
          className="absolute top-14 left-4 z-20 px-3.5 py-2 rounded-lg bg-rose-600/95 hover:bg-rose-500 text-white text-xs font-bold shadow-xl border border-white/20 flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
        >
          <VolumeX className="w-4 h-4" />
          <span>Klik untuk Nyalakan Suara TV</span>
        </button>
      )}

      {/* Bottom Interactive TV Control Bar */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent pt-8 pb-3 px-4 flex flex-wrap items-center justify-between gap-3 z-20">
        {/* Left Controls: Play/Pause, Prev/Next Channel, Volume */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Jeda Siaran' : 'Putar Siaran'}
            className="p-2 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={onPrevChannel}
            title="Saluran Sebelumnya"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onNextChannel}
            title="Saluran Berikutnya"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Volume & Mute Control */}
          <div className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
              className="text-white cursor-pointer"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              aria-label="Volume TV"
              className="w-16 sm:w-20 accent-rose-500 cursor-pointer h-1"
            />
          </div>
        </div>

        {/* Right Controls: Reload Signal, Picture-in-Picture, Fullscreen */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReloadStream}
            title="Segarkan Sinyal Siaran"
            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/25 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Segarkan Sinyal</span>
          </button>

          <button
            type="button"
            onClick={handlePictureInPicture}
            title="Layar Mengambang (Picture-in-Picture)"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
          >
            <PictureInPicture2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleFullscreen}
            title="Layar Penuh"
            aria-label="Layar Penuh"
            className="p-2 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
