import React, { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, RotateCcw } from 'lucide-react';

interface LyricLine {
  time: number;
  text: string;
}

const LYRICS: LyricLine[] = [
  { time: 1.0, text: '주의 자녀로 산다는 것은 불 가운데로 걸어가는 것' },
  { time: 18.2, text: '그 속에서 신실하게 날 지키시는 그 손길을 경험하는 것' },
  { time: 33.8, text: '주의 자녀로 산다는 것은 바다 위로 걸어가는 것' },
  { time: 49.2, text: '내 온몸을 덮쳐오는 폭풍 속에서 잠잠히 주 바라보는 것' },
  { time: 64.0, text: '때론 불 가운데 휩싸일 때도 폭풍 가운데 무너질 때도' },
  { time: 80.5, text: '주님 내 곁에 함께 하시네 가장 가까이에 함께 하시네' },
  { time: 128.0, text: '주의 자녀로 산다는 것은 나도 그들을 용납하는 것' },
  { time: 151.0, text: '나를 위해 달리신 십자가 사랑 그 사랑으로 살아가는 것' },
  { time: 164.0, text: '주의 자녀로 산다는 것은 주님과 함께 동행하는 것' },
  { time: 181.0, text: '주께서 지신 십자가 기꺼이 지고 주와 함께 걸어가는 것' },
  { time: 196.0, text: '때론 불 가운데 휩싸일 때도 폭풍 가운데 무너질 때도' },
  { time: 212.0, text: '주님 내 곁에 함께 하시네 가장 가까이에 함께 하시네' },
  { time: 231.0, text: '때론 불 가운데 휩싸일 때도 폭풍 가운데 무너질 때도' },
  { time: 244.5, text: '주님 내 곁에 함께 하시네 가장 가까이에 함께 하시네' },
  { time: 260.0, text: '때론 불 가운데 휩싸일 때도 폭풍 가운데 무너질 때도' },
  { time: 277.0, text: '주님 내 곁에 함께 하시네 가장 가까이에 함께 하시네' },
  { time: 291.0, text: '때론 불 가운데 휩싸일 때도 폭풍 가운데 무너질 때도' },
  { time: 309.0, text: '주님 내 곁에 함께 하시네 가장 가까이에 함께 하시네' },
  { time: 319.0, text: '가장 가까이에 함께 하시네 가장 가까이에 함께 하시네' },
];

const LINE_HEIGHT = 28; // px

export const HymnPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.warn('Audio play blocked or failed:', err);
      });
    }
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);
    audio.play().catch((err) => {
      console.warn('Audio play blocked or failed:', err);
    });
  };

  // 현재 재생 시간에 해당하는 가사 인덱스
  const activeIndex = LYRICS.reduce((acc, item, idx) => {
    if (currentTime >= item.time) return idx;
    return acc;
  }, 0);

  return (
    <section className="pt-2 pb-6 px-4 font-gothic select-none">
      <div className="max-w-md mx-auto">
        
        {/* 숨김 오디오 엘리먼트 */}
        <audio
          ref={audioRef}
          src="/bgm.m4a"
          preload="metadata"
        />

        {/* 1. 상단 컨트롤 바: 음악 검은색 선 배경없는 아이콘 + 고요히 찬양 들어보기 + 재생버튼 + 처음부터 재생버튼 */}
        <div className="flex items-center justify-center gap-2 text-stone-900">
          <Music className={`w-4 h-4 text-stone-900 stroke-[1.8] ${isPlaying ? 'animate-pulse text-stone-950' : ''}`} />
          <span className="text-xs sm:text-[13px] font-bold tracking-tight">
            고요히 찬양 들어보기
          </span>

          <div className="flex items-center gap-1 ml-1">
            {/* 재생 / 중지 토글 버튼 */}
            <button
              type="button"
              onClick={togglePlay}
              className="p-1 text-stone-900 hover:text-black transition cursor-pointer active:scale-95 flex items-center justify-center"
              title={isPlaying ? '중지' : '재생'}
              aria-label={isPlaying ? '중지' : '재생'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-stone-900 stroke-[1.5]" />
              ) : (
                <Play className="w-4 h-4 fill-stone-900 stroke-[1.5] translate-x-0.5" />
              )}
            </button>

            {/* 처음부터 재생 버튼 (동그란 화살표) */}
            <button
              type="button"
              onClick={handleRestart}
              className="p-1 text-stone-900 hover:text-black transition cursor-pointer active:scale-90 flex items-center justify-center"
              title="처음부터 재생"
              aria-label="처음부터 재생"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* 2. 가사 카드 (다른 설명 없이, 두 줄까지 보이며 싱크에 맞춰 부드럽게 위로 이동) */}
        <div className="mt-2.5 bg-white/80 backdrop-blur-xs rounded-2xl px-4 py-3 border border-stone-200/80 shadow-xs text-center relative overflow-hidden">
          {/* 상하 페이드 그라데이션 마스크 (부드러운 안개 페이드 효과) */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-3.5 bg-gradient-to-b from-white via-white/80 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3.5 bg-gradient-to-t from-white via-white/80 to-transparent z-10" />

          {/* 두 줄 높이 뷰포트 (56px) */}
          <div className="h-[56px] overflow-hidden relative">
            <div
              className="transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{
                transform: `translateY(-${activeIndex * LINE_HEIGHT}px)`,
              }}
            >
              {LYRICS.map((item, idx) => {
                const isCurrent = idx === activeIndex;
                const isNext = idx === activeIndex + 1;

                return (
                  <p
                    key={idx}
                    className={`h-[28px] flex items-center justify-center text-center px-2 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] whitespace-nowrap text-ellipsis overflow-hidden m-0 ${
                      isCurrent
                        ? 'text-xs sm:text-[13px] font-bold text-stone-900 scale-[1.01]'
                        : isNext
                        ? 'text-xs sm:text-[13px] font-medium text-stone-500 opacity-70'
                        : 'text-xs sm:text-[13px] font-normal text-stone-400 opacity-30'
                    }`}
                  >
                    {item.text}
                  </p>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
