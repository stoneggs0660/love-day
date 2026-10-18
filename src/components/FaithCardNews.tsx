import React, { useState, useRef, useEffect } from 'react';
import { Send, Gift } from 'lucide-react';
import { fetchSummaryCounts } from '../services/analytics';

interface ChurchPhotoItem {
  src: string;
  width: number;
  height: number;
  isPortrait: boolean;
}

// 사진 순서: 13, 12, 2, 6, 나머지는 감성적으로 다채롭게 믹스
// 세로 사진: 세로 비율을 그대로 살려 길게 표시 (100% 원본 보존)
// 가로 사진: 4:3 와이드 비율 + 좌↔우 부드러운 패닝 모션
const CHURCH_PHOTOS: ChurchPhotoItem[] = [
  { src: '/photos/slide_13.jpg?v=2', width: 1400, height: 1050, isPortrait: false }, // 13: 실내 통창 시내 뷰 (가로)
  { src: '/photos/slide_12.jpg?v=3', width: 1050, height: 1400, isPortrait: true },  // 12: 계단실 통창 햇살 뷰 (세로 길게)
  { src: '/photos/slide_02.jpg', width: 1280, height: 1400, isPortrait: true },     // 2: 십자가 탑 외관 (세로 길게)
  { src: '/photos/slide_06.jpg', width: 1400, height: 891, isPortrait: false },      // 6: 그랜드 피아노 & 강단 (가로)
  { src: '/photos/slide_08.jpg?v=2', width: 1024, height: 767, isPortrait: false },  // 8: 따뜻한 교회 카페 메인 전경 (가로)
  { src: '/photos/slide_01.jpg', width: 999, height: 1400, isPortrait: true },       // 1: 교회 건물 정면 간판 전경 (세로 길게)
  { src: '/photos/slide_03.jpg', width: 1400, height: 1050, isPortrait: false },     // 3: 대예배실(본당) 전경 (가로)
  { src: '/photos/slide_09.jpg', width: 1311, height: 1400, isPortrait: true },      // 9: 카페 원목 파티션 & 식물 조명 (세로 길게)
  { src: '/photos/slide_04.jpg', width: 1400, height: 829, isPortrait: false },      // 4: 대예배실 강단 무대 조명 (가로)
  { src: '/photos/slide_10.jpg', width: 1400, height: 1050, isPortrait: false },     // 10: 카페 펜던트 조명 & 물고기 모빌 (가로)
  { src: '/photos/slide_05.jpg', width: 1400, height: 933, isPortrait: false },      // 5: 대예배실 중층 뷰 (가로)
  { src: '/photos/slide_11.jpg', width: 1400, height: 1050, isPortrait: false },     // 11: 4F 층별 안내 사인 (가로)
];

interface FaithCardNewsProps {
  showStats?: boolean;
}

export const FaithCardNews: React.FC<FaithCardNewsProps> = ({ showStats = true }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [counts, setCounts] = useState<{ invitationCount: number; giftCount: number }>({
    invitationCount: 0,
    giftCount: 0,
  });

  useEffect(() => {
    if (!showStats) return;
    const loadCounts = async () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      const summary = await fetchSummaryCounts();
      setCounts({
        invitationCount: summary.invitationCount,
        giftCount: summary.giftCount,
      });
    };
    loadCounts();

    // 30초마다 화면 활성 시에만 새로고침 (불필요한 트래픽 낭비 방지)
    const timer = setInterval(loadCounts, 30000);

    // 다시 앱 화면으로 돌아왔을 때 즉시 갱신
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadCounts();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [showStats]);

  // 스크롤 위치에 따라 현재 중앙에 위치한 카드 인덱스 계산
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    const children = Array.from(container.children) as HTMLElement[];
    let closestIdx = 0;
    let minDistance = Infinity;

    children.forEach((child, idx) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const distance = Math.abs(containerCenter - childCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIdx = idx;
      }
    });

    setActiveIndex(closestIdx);
  };

  // 특정 카드 인덱스로 부드럽게 중앙 스크롤
  const scrollToSlide = (idx: number) => {
    const container = containerRef.current;
    if (!container) return;
    const targetIdx = Math.max(0, Math.min(CHURCH_PHOTOS.length - 1, idx));
    const child = container.children[targetIdx] as HTMLElement | undefined;
    if (!child) return;

    const targetScrollLeft =
      child.offsetLeft - (container.clientWidth - child.offsetWidth) / 2;

    container.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth',
    });
    setActiveIndex(targetIdx);
  };

  // 화면에 처음 보일 때 살짝 옆으로 움직였다 돌아오는 힌트 모션(Nudge)으로 스와이프 유도
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let nudged = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !nudged) {
            nudged = true;
            setTimeout(() => {
              if (!containerRef.current) return;
              containerRef.current.scrollBy({ left: 42, behavior: 'smooth' });
              setTimeout(() => {
                if (!containerRef.current) return;
                containerRef.current.scrollBy({ left: -42, behavior: 'smooth' });
              }, 380);
            }, 350);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-6 sm:py-8 relative overflow-hidden select-none">
      <div className="max-w-xl mx-auto relative">

        {/* 오늘까지 카운트 현황 (관리자 모드에서 끄고 켤 수 있음) */}
        {showStats && (
          <div className="mb-3 px-4 text-center font-gothic animate-in fade-in duration-300">
            <div className="inline-flex flex-col items-center gap-1 text-stone-900">
              <span className="text-[11px] text-stone-500 font-medium tracking-tight">
                오늘까지
              </span>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-xs sm:text-[13px] text-stone-900 font-medium">
                <div className="flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-stone-900 stroke-[1.8]" />
                  <span>초대장 총 <strong className="font-bold text-black">{counts.invitationCount.toLocaleString()}</strong>명에게 발송되었습니다.</span>
                </div>
                <span className="hidden sm:inline text-stone-300">|</span>
                <div className="flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-stone-900 stroke-[1.8]" />
                  <span>선물 총 <strong className="font-bold text-black">{counts.giftCount.toLocaleString()}</strong>명 다운로드 하셨습니다.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🎬 갤러리: 세로 사진은 세로 비율을 그대로 살려 길게, 가로 사진은 좌↔우 패닝 모션 */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex items-center overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar h-[340px] sm:h-[400px] px-8 sm:px-14 gap-3.5 sm:gap-4 py-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {CHURCH_PHOTOS.map((item, idx) => {
            const isActive = idx === activeIndex;

            return (
              <div
                key={item.src}
                onClick={() => scrollToSlide(idx)}
                className={`h-full shrink-0 snap-center transition-all duration-300 cursor-pointer flex items-center justify-center ${
                  isActive
                    ? 'scale-100 opacity-100 z-10'
                    : 'scale-[0.93] opacity-65 hover:opacity-85'
                }`}
              >
                <div
                  style={{
                    aspectRatio: item.isPortrait
                      ? `${item.width} / ${item.height}`
                      : '4 / 3',
                  }}
                  className="relative h-full max-w-[85vw] sm:max-w-[480px] rounded-3xl overflow-hidden shadow-xl shadow-stone-900/18 bg-stone-200"
                >
                  <img
                    src={item.src}
                    alt=""
                    className={`w-full h-full object-cover block ${
                      isActive && !item.isPortrait ? 'animate-kenburns-x' : 'scale-100'
                    }`}
                    loading={idx < 3 ? 'eager' : 'lazy'}
                    draggable={false}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 하단 페이지네이션 도트 인디케이터 */}
        <div className="flex items-center justify-center gap-1.5 pt-3">
          {CHURCH_PHOTOS.map((item, idx) => (
            <button
              key={item.src}
              type="button"
              onClick={() => scrollToSlide(idx)}
              aria-label={`사진 ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === idx
                  ? 'w-6 bg-stone-900'
                  : 'w-2 bg-stone-300 hover:bg-stone-400'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};



