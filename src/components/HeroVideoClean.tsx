import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Play } from 'lucide-react';

export const HeroVideoClean: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);

  // Attempt autoplay safely across all mobile & desktop browsers
  const startAutoplay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch(() => {
          // Autoplay was blocked by browser policy (e.g. low power mode or strict autoplay)
          setIsPlaying(false);
          setAutoplayBlocked(true);
        });
    }
  }, []);

  useEffect(() => {
    startAutoplay();

    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      setIsPlaying(true);
      setAutoplayBlocked(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    video.addEventListener('playing', handlePlay);
    video.addEventListener('pause', handlePause);

    // Fallback: trigger playback on first user touch anywhere on the page
    const handleFirstUserInteraction = () => {
      if (videoRef.current && videoRef.current.paused) {
        startAutoplay();
      }
    };

    window.addEventListener('touchstart', handleFirstUserInteraction, { once: true, passive: true });
    window.addEventListener('click', handleFirstUserInteraction, { once: true, passive: true });

    return () => {
      video.removeEventListener('playing', handlePlay);
      video.removeEventListener('pause', handlePause);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
      window.removeEventListener('click', handleFirstUserInteraction);
    };
  }, [startAutoplay]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;

    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;
      videoRef.current.play().catch(() => {});
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleManualPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.play().then(() => {
      setIsPlaying(true);
      setAutoplayBlocked(false);
    }).catch(() => {});
  };

  return (
    <section className="relative w-full overflow-hidden bg-black flex items-center justify-center">
      {/* Full width hero video: aspect 4/3 on mobile portrait, 16/9 on desktop */}
      <div 
        className="relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[78vh] flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={handleManualPlay}
      >
        {/* The Transcoded Universal H.264 Hero Video with poster thumbnail */}
        <video
          ref={videoRef}
          poster="/hero_poster.jpg"
          className="w-full h-full object-cover object-center bg-black"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/hero_video.mp4" type="video/mp4" />
          영상을 지원하지 않는 브라우저입니다.
        </video>

        {/* Fallback Play Button overlay if autoplay was blocked by browser power-saving */}
        {autoplayBlocked && !isPlaying && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs transition-opacity">
            <button
              onClick={handleManualPlay}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 hover:bg-white text-slate-900 font-semibold shadow-xl transition-transform active:scale-95"
            >
              <Play className="w-5 h-5 text-rose-600 fill-rose-600" />
              <span className="text-sm">영상 재생하기</span>
            </button>
          </div>
        )}

        {/* Minimal Sound Toggle Button (No text overlays on front) */}
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20">
          <button
            onClick={toggleSound}
            aria-label={isMuted ? '음향 켜기' : '음향 끄기'}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-md text-white text-xs font-medium border border-white/30 shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-[11px] sm:text-xs">소리 켜기</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span className="text-[11px] sm:text-xs text-rose-300 font-semibold">소리 끄기</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
