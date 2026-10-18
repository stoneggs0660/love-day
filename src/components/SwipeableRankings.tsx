import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

export interface FriendRankItem {
  name: string;
  likes: number;
}

export interface CheerLogItem {
  id: string;
  cheererName: string;
  relationship: string;
  friendName: string;
  heartCount: number;
  timestamp: string;
  gender?: '남' | '여';
}

interface SwipeableRankingsProps {
  friendRanks?: FriendRankItem[];
  cheerLogs: CheerLogItem[];
}

export const SwipeableRankings: React.FC<SwipeableRankingsProps> = ({
  cheerLogs,
}) => {
  return (
    <section id="rankings-zone" className="py-8 sm:py-10 px-4 sm:px-6 relative">
      <div className="max-w-md mx-auto">
        
        {/* 사랑한데이 하트 (랭킹 숫자 삭제, 이름 옆 하트 개수, 최근 20개 상단 적립) */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-xl shadow-rose-950/10 border-2 border-rose-100 min-h-[480px] flex flex-col justify-between">
          <div>
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-rose-100 mb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                <h3 className="font-bold text-base sm:text-lg font-batang text-slate-800">
                  사랑한데이 하트
                </h3>
              </div>
              <span className="text-[11px] text-rose-600 font-semibold bg-rose-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-rose-500" />
                <span>실시간 20개</span>
              </span>
            </div>

            {/* Horizontal Ticker */}
            <div className="mb-3 overflow-hidden bg-rose-50/60 rounded-xl border border-rose-100 p-2 relative">
              <div className="animate-marquee flex items-center gap-6 whitespace-nowrap text-xs text-slate-700">
                {cheerLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="inline-flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800">[{log.relationship}]</span>
                    <span>{log.cheererName}님이</span>
                    <strong className="text-rose-600">{log.friendName}님</strong>에게
                    <span className="inline-flex items-center gap-0.5 font-bold text-rose-500">
                      <Heart className="w-3 h-3 fill-rose-500 inline" />
                      <span>{log.heartCount}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* List: Up to 20 items, latest on top, NO rank number, shows: Name, Sender Nickname, Relationship, Heart Count */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {cheerLogs.slice(0, 20).map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    idx === 0
                      ? 'bg-rose-50/90 border-rose-200 shadow-xs ring-1 ring-rose-200/50'
                      : 'bg-slate-50/80 border-slate-100 hover:bg-rose-50/40'
                  }`}
                >
                  {/* Left: Name + Sender Nickname & Relationship (NO rank number) */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white border border-rose-100 flex items-center justify-center text-rose-500 shadow-xs shrink-0">
                      <Heart className="w-4 h-4 fill-rose-500" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-slate-800 font-batang">
                          {item.friendName} 님
                        </span>
                        {idx === 0 && (
                          <span className="text-[10px] font-bold text-rose-500 bg-rose-100 px-1.5 py-0.2 rounded-full animate-pulse">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">{item.cheererName}</span>
                        <span className="text-slate-300 mx-1">·</span>
                        <span className="text-rose-600 font-medium">[{item.relationship}]</span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Heart Count ONLY (00명 응원 X, just ❤️ count) */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-rose-600 border border-rose-100 shadow-2xs shrink-0 font-bold text-sm">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span>{item.heartCount}</span>
                  </div>
                </div>
              ))}

              {cheerLogs.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400">
                  아직 등록된 사랑한데이 하트가 없습니다.<br />
                  위의 카페이용권을 다운로드하고 첫 하트를 남겨보세요!
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 20s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};
