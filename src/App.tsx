/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HeroVideoClean } from './components/HeroVideoClean';
import { SwipeableCards } from './components/SwipeableCards';
import { FaithCardNews } from './components/FaithCardNews';
import { QuestionCards } from './components/QuestionCards';
import {
  SwipeableRankings,
  FriendRankItem,
  CheerLogItem,
} from './components/SwipeableRankings';
import { DirectionsMap } from './components/DirectionsMap';
import { AdminDashboard } from './components/AdminDashboard';
import { HymnPlayer } from './components/HymnPlayer';
import { recordVisit, fetchAppSettings } from './services/analytics';

const INITIAL_FRIEND_RANKS: FriendRankItem[] = [
  { name: '김민수', likes: 16 },
  { name: '이영희', likes: 13 },
  { name: '박준호', likes: 10 },
  { name: '최수진', likes: 8 },
  { name: '정태양', likes: 6 },
];

const INITIAL_CHEER_LOGS: CheerLogItem[] = [
  { id: '1', friendName: '김민수', cheererName: '철수', gender: '남', relationship: '죽마고우', heartCount: 16, timestamp: '방금 전' },
  { id: '2', friendName: '이영희', cheererName: '미경', gender: '여', relationship: '이웃집 아줌마', heartCount: 13, timestamp: '1분 전' },
  { id: '3', friendName: '박준호', cheererName: '동식', gender: '남', relationship: '동네 아저씨', heartCount: 10, timestamp: '3분 전' },
  { id: '4', friendName: '최수진', cheererName: '수빈', gender: '여', relationship: '피를 나눈 자매', heartCount: 8, timestamp: '5분 전' },
  { id: '5', friendName: '김민수', cheererName: '성훈', gender: '남', relationship: '웬수', heartCount: 7, timestamp: '7분 전' },
  { id: '6', friendName: '정태양', cheererName: '지훈', gender: '남', relationship: '동네주민', heartCount: 6, timestamp: '10분 전' },
  { id: '7', friendName: '한유라', cheererName: '수현', gender: '여', relationship: '찐우정', heartCount: 5, timestamp: '14분 전' },
  { id: '8', friendName: '강호성', cheererName: '민우', gender: '남', relationship: '직장동료', heartCount: 4, timestamp: '18분 전' },
];

export default function App() {
  // Check if current path/query is admin
  const [isAdmin] = useState<boolean>(() => {
    const path = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path.includes('admin') || search.includes('admin') || hash.includes('admin');
  });

  // Track page visit (1회 per session)
  React.useEffect(() => {
    if (isAdmin) return;
    const sessionVisited = sessionStorage.getItem('masan_visited');
    if (!sessionVisited) {
      sessionStorage.setItem('masan_visited', 'true');
      const params = new URLSearchParams(window.location.search);
      const from = params.get('from') || '';
      const to = params.get('to') || '';
      recordVisit(from, to).catch((err) => console.error('Visit record failed:', err));
    }
  }, [isAdmin]);

  // App Settings: 총 다운로드수, 발송수 앱 표시 제어 (관리자 모드에서 끄고 켜기)
  const [showStatsInApp, setShowStatsInApp] = useState(true);

  React.useEffect(() => {
    if (isAdmin) return;
    const loadSetting = () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      fetchAppSettings()
        .then((s) => setShowStatsInApp(s.showStatsInApp))
        .catch(() => {});
    };
    loadSetting();
    const timer = setInterval(loadSetting, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadSetting();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isAdmin]);

  // Friend Ranks
  const [friendRanks, setFriendRanks] = useState<FriendRankItem[]>(() => {
    const saved = localStorage.getItem('masan_friend_ranks');
    return saved ? JSON.parse(saved) : INITIAL_FRIEND_RANKS;
  });

  // Cheer Logs (Recent 20 사랑한데이 하트)
  const [cheerLogs, setCheerLogs] = useState<CheerLogItem[]>(() => {
    const saved = localStorage.getItem('masan_cheer_logs');
    return saved ? JSON.parse(saved) : INITIAL_CHEER_LOGS;
  });

  // Handler for Cheer from Card 3
  const handleCheerSuccess = (friendName: string, cheererName: string, gender: '남' | '여', rel: string) => {
    // 1. Update friend rank likes
    let found = false;
    let newLikes = 1;
    const updatedRanks = friendRanks.map((r) => {
      if (r.name === friendName) {
        found = true;
        newLikes = r.likes + 1;
        return { ...r, likes: r.likes + 1 };
      }
      return r;
    });

    if (!found) {
      newLikes = 1;
      updatedRanks.push({ name: friendName, likes: 1 });
    }

    updatedRanks.sort((a, b) => b.likes - a.likes);
    setFriendRanks(updatedRanks);
    localStorage.setItem('masan_friend_ranks', JSON.stringify(updatedRanks));

    // 2. Add log to top (keep up to 20 items stacked)
    const newLog: CheerLogItem = {
      id: Date.now().toString(),
      cheererName,
      gender,
      relationship: rel,
      friendName,
      heartCount: newLikes,
      timestamp: '방금 전',
    };
    const updatedLogs = [newLog, ...cheerLogs].slice(0, 20);
    setCheerLogs(updatedLogs);
    localStorage.setItem('masan_cheer_logs', JSON.stringify(updatedLogs));
  };

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-[#faf6f0] text-slate-800 font-sans selection:bg-rose-200 selection:text-rose-900 relative">
      
      {/* 🎥 Hero Video (Zero text on front, sound toggle only) */}
      <HeroVideoClean />

      <main className="relative z-20">
        {/* 1. Swipeable Cards (초대장 카드, 공식 포스터, 카페이용권 받기) */}
        <SwipeableCards onCheerSuccess={handleCheerSuccess} />

        {/* 2. 신앙에 대해 궁금하세요? 따뜻한 감성 이미지 카드뉴스 */}
        <FaithCardNews showStats={showStatsInApp} />

        {/* 2-1. 고요히 찬양 들어보기 (음악 플레이어 & 2줄 가사 롤링 카드) */}
        <HymnPlayer />

        {/* 3. 마음을 여는 질문카드 (좌우 스와이핑 아코디언 FAQ) */}
        <QuestionCards />

        {/* 4. 오시는 길 (지도) */}
        <DirectionsMap />
      </main>

      {/* Footer (진 검은색 배경, 붉은 테두리 제거, 이쁜 고딕체 적용) */}
      <footer className="bg-black text-neutral-300 pt-12 pb-14 px-4 sm:px-6 relative z-20 overflow-hidden font-gothic border-0">
        <div className="max-w-4xl mx-auto text-center space-y-2.5">
          <div className="flex items-center justify-center">
            <span className="text-xl sm:text-2xl font-bold font-gothic text-white tracking-tight">
              행복한 마산회원교회
            </span>
          </div>

          <p className="text-xs sm:text-sm text-neutral-400 font-normal">
            2026년 11월 15일(주일) 11:00 | 경상남도 창원시 마산회원구 회원동로 43
          </p>

          <p className="text-xs sm:text-sm text-neutral-300 font-medium">
            꼭 오셔서 자리를 빛내주세요 ~ 사랑한 데이~ ♥
          </p>
        </div>
      </footer>

    </div>
  );
}
