import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CornerDownLeft, Copy, Check, Heart, MessageCircle, X, Download, Play, ChevronRight, RotateCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { recordInvitation, recordGiftDownload } from '../services/analytics';

interface SwipeableCardsProps {
  onCheerSuccess: (friendName: string, cheererName: string, gender: '남' | '여', rel: string) => void;
}

interface InvitationLineDef {
  text: string;
  type: 'title' | 'body' | 'highlight' | 'info' | 'sign';
  startIndex: number;
  endIndex: number;
}

const buildInvitationLines = (toName: string, fromName: string) => {
  const displayTitle = toName.trim() ? `${toName.trim()}님 초대합니다.` : '초대합니다.';
  const displaySign = fromName.trim() ? fromName.trim() : '행복한 이웃';

  const raw: { text: string; type: 'title' | 'body' | 'highlight' | 'info' | 'sign' }[] = [
    { text: displayTitle, type: 'title' },
    {
      text: '추수감사주일을 맞아 따뜻한 축복을 나누는 자리에 기쁜 마음으로 초대합니다. 꼭 오셔서 자리를 빛내주세요~',
      type: 'body',
    },
    { text: '사랑한 데이~ ♥', type: 'highlight' },
    { text: '2026년 11월 15일(주일) 11시', type: 'info' },
    { text: `행복한 마산회원교회 ${displaySign}`, type: 'sign' },
  ];

  let acc = 0;
  const lines: InvitationLineDef[] = raw.map((item, idx) => {
    const startIndex = acc;
    const endIndex = acc + item.text.length;
    acc = endIndex + (idx < raw.length - 1 ? 1 : 0);
    return { ...item, startIndex, endIndex };
  });

  return { lines, totalCharCount: acc };
};

const CAFE_MENU_ITEMS = [
  { name: '아메리카노', price: '1,000' },
  { name: '카페라떼', price: '2,000' },
  { name: '바닐라라떼', price: '2,000' },
  { name: '카페모카', price: '2,000' },
  { name: '초코라떼', price: '2,000' },
  { name: '아이스티', price: '1,000' },
  { name: '레몬에이드', price: '2,000' },
  { name: '청포도에이드', price: '2,000' },
  { name: '딸기라떼', price: '3,000' },
  { name: '기타음료', price: '' },
];

const KAKAO_JAVASCRIPT_KEY = '9877678c37f6730a2737d41fc9f00cc3';

const createCouponTicketDataUrl = (inviter: string, invitee: string): string => {
  const canvas = document.createElement('canvas');
  const width = 640;
  const height = 700;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const drawRoundRect = (
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.arcTo(x + w, y, x + w, y + r, r);
    c.lineTo(x + w, y + h - r);
    c.arcTo(x + w, y + h, x + w - r, y + h, r);
    c.lineTo(x + r, y + h);
    c.arcTo(x, y + h, x, y + h - r, r);
    c.lineTo(x, y + r);
    c.arcTo(x, y, x + r, y, r);
    c.closePath();
  };

  // 1. 전체 바깥 배경 (따뜻하고 고급스러운 미색 크림)
  ctx.fillStyle = '#FAF7F2';
  ctx.fillRect(0, 0, width, height);

  // 2. 카드 메인 바디 (화이트 라운드 카드)
  const pad = 24;
  const cardW = width - pad * 2;
  const cardH = height - pad * 2;
  drawRoundRect(ctx, pad, pad, cardW, cardH, 32);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#EBE3D7';
  ctx.stroke();

  // 3. 상단 헤더 배지 / 라벨
  ctx.fillStyle = '#8C7A6B';
  ctx.font = 'bold 16px Pretendard, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('마산회원교회 카페', width / 2, 85);

  // 4. 심플 & 모던 커피 컵 일러스트 (도자기 머그와 따뜻한 커피)
  const cx = width / 2;
  const cy = 160;

  // 은은한 스팀 곡선 3가닥
  ctx.save();
  ctx.strokeStyle = '#C4AFA0';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  [-22, 0, 22].forEach((offset) => {
    ctx.beginPath();
    ctx.moveTo(cx + offset, cy - 25);
    ctx.bezierCurveTo(
      cx + offset - 8, cy - 38,
      cx + offset + 8, cy - 50,
      cx + offset, cy - 65
    );
    ctx.stroke();
  });
  ctx.restore();

  // 컵 받침 (소서)
  ctx.beginPath();
  ctx.ellipse(cx, cy + 34, 54, 9, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#EAE2D5';
  ctx.fill();
  ctx.strokeStyle = '#B39F8C';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // 컵 본체
  ctx.beginPath();
  ctx.moveTo(cx - 38, cy - 20);
  ctx.lineTo(cx + 38, cy - 20);
  ctx.lineTo(cx + 32, cy + 24);
  ctx.arcTo(cx + 30, cy + 30, cx, cy + 30, 14);
  ctx.lineTo(cx - 30, cy + 30);
  ctx.arcTo(cx - 32, cy + 24, cx - 38, cy - 20, 14);
  ctx.closePath();
  ctx.fillStyle = '#4A3728';
  ctx.fill();

  // 컵 손잡이
  ctx.beginPath();
  ctx.arc(cx + 42, cy + 5, 17, -Math.PI / 2.6, Math.PI / 2.3);
  ctx.strokeStyle = '#4A3728';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.stroke();

  // 컵 안의 따뜻한 커피 수면
  ctx.beginPath();
  ctx.ellipse(cx, cy - 20, 38, 11, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#735742';
  ctx.fill();
  ctx.strokeStyle = '#4A3728';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // 커피 수면 라떼 하트 포인트
  ctx.beginPath();
  ctx.ellipse(cx, cy - 20, 16, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#C8B29E';
  ctx.fill();

  // 머그컵 외벽 커피 심볼
  ctx.fillStyle = '#EAE2D7';
  ctx.font = '15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('☕', cx, cy + 14);

  // 5. 타이틀: "카페 이용권"
  ctx.fillStyle = '#2B231D';
  ctx.font = 'bold 24px Pretendard, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('카페 이용권', width / 2, 245);

  // 6. 금액: "20,000원"
  ctx.fillStyle = '#1A1410';
  ctx.font = '900 44px Pretendard, -apple-system, sans-serif';
  ctx.fillText('20,000원', width / 2, 305);

  // 7. 티켓 절취 홈(노치) & 점선
  const notchY = 350;
  ctx.save();
  ctx.fillStyle = '#FAF7F2';
  ctx.beginPath();
  ctx.arc(pad, notchY, 15, -Math.PI / 2, Math.PI / 2);
  ctx.fill();
  ctx.strokeStyle = '#EBE3D7';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(width - pad, notchY, 15, Math.PI / 2, -Math.PI / 2);
  ctx.fill();
  ctx.strokeStyle = '#EBE3D7';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // 가로 점선
  ctx.save();
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = '#D9CEBF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad + 24, notchY);
  ctx.lineTo(width - pad - 24, notchY);
  ctx.stroke();
  ctx.restore();

  // 8. 초대 정보 박스
  const infoX = pad + 24;
  const infoY = 385;
  const infoW = cardW - 48;
  const infoH = 220;

  drawRoundRect(ctx, infoX, infoY, infoW, infoH, 20);
  ctx.fillStyle = '#FAF7F2';
  ctx.fill();
  ctx.strokeStyle = '#EAE1D5';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 정보 1: 초대하는 분
  ctx.textAlign = 'left';
  ctx.font = 'bold 16px Pretendard, -apple-system, sans-serif';
  ctx.fillStyle = '#7A6B5F';
  ctx.fillText('초대하는 분', infoX + 24, infoY + 48);

  ctx.textAlign = 'right';
  ctx.font = 'bold 22px Pretendard, -apple-system, sans-serif';
  ctx.fillStyle = '#221A15';
  ctx.fillText(inviter || '행복한 이웃', infoX + infoW - 24, infoY + 48);

  // 정보 구분선 1
  ctx.strokeStyle = '#EAE2D7';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(infoX + 20, infoY + 76);
  ctx.lineTo(infoX + infoW - 20, infoY + 76);
  ctx.stroke();

  // 정보 2: 초대받는 분
  ctx.textAlign = 'left';
  ctx.font = 'bold 16px Pretendard, -apple-system, sans-serif';
  ctx.fillStyle = '#7A6B5F';
  ctx.fillText('초대받는 분', infoX + 24, infoY + 124);

  ctx.textAlign = 'right';
  ctx.font = 'bold 22px Pretendard, -apple-system, sans-serif';
  ctx.fillStyle = '#1A1410';
  ctx.fillText(invitee || '소중한 이웃', infoX + infoW - 24, infoY + 124);

  // 정보 구분선 2
  ctx.strokeStyle = '#EAE2D7';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(infoX + 20, infoY + 152);
  ctx.lineTo(infoX + infoW - 20, infoY + 152);
  ctx.stroke();

  // 정보 3: 사용처
  ctx.textAlign = 'left';
  ctx.font = 'bold 15px Pretendard, -apple-system, sans-serif';
  ctx.fillStyle = '#7A6B5F';
  ctx.fillText('사용처', infoX + 24, infoY + 192);

  ctx.textAlign = 'right';
  ctx.font = 'bold 16px Pretendard, -apple-system, sans-serif';
  ctx.fillStyle = '#4A3B30';
  ctx.fillText('마산회원교회 사랑한 Day~ 카페', infoX + infoW - 24, infoY + 192);

  // 9. 하단 실물쿠폰 교환 및 사용기간 안내 문구
  ctx.textAlign = 'center';
  ctx.font = 'bold 13.5px Pretendard, -apple-system, sans-serif';
  ctx.fillStyle = '#261F1A';
  ctx.fillText('모바일 이용권은 [사랑한 DAY 당일] 실물쿠폰으로 교환가능합니다.', width / 2, 624);

  ctx.font = 'bold 12.5px Pretendard, -apple-system, sans-serif';
  ctx.fillStyle = '#5A4E44';
  ctx.fillText('사용기간 2026년 12월 31일. 양도불가', width / 2, 648);

  return canvas.toDataURL('image/png');
};

export const SwipeableCards: React.FC<SwipeableCardsProps> = ({ onCheerSuccess }) => {
  // Inviter & Invitee Names (Default & from URL)
  const [inviterName, setInviterName] = useState('행복한 이웃');
  const [inviteeName, setInviteeName] = useState('');

  // 1. Kakao Modal State
  const [showKakaoModal, setShowKakaoModal] = useState(false);
  const [kakaoInviter, setKakaoInviter] = useState('');
  const [kakaoInvitee, setKakaoInvitee] = useState('');
  const [kakaoSentNotice, setKakaoSentNotice] = useState(false);

  // 2. Cafe Coupon Page Modal State
  const [showCafePageModal, setShowCafePageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isLandscapeRotated, setIsLandscapeRotated] = useState(false);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const [couponInviterInput, setCouponInviterInput] = useState('');
  const [couponNicknameInput, setCouponNicknameInput] = useState('');
  const [couponRelation, setCouponRelation] = useState('이웃');
  const [couponCustomRelation, setCouponCustomRelation] = useState('');
  const [couponUnlocked, setCouponUnlocked] = useState(false);
  const [couponImageUrl, setCouponImageUrl] = useState<string>('');
  const [couponCopiedNotice, setCouponCopiedNotice] = useState(false);
  const [hasValidInviter, setHasValidInviter] = useState(false);

  // Typewriter Effect looping forward & backwards
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const toParam = params.get('to') || params.get('invitee') || params.get('guest') || params.get('recipient');
    const fromParam = params.get('from') || params.get('inviter') || params.get('friend') || params.get('name');

    if (fromParam && fromParam.trim()) {
      const trimmedFrom = fromParam.trim();
      setInviterName(trimmedFrom);
      if (trimmedFrom !== '행복한 이웃') {
        setKakaoInviter(trimmedFrom);
        setCouponInviterInput(trimmedFrom);
        setHasValidInviter(true);
      } else {
        setHasValidInviter(false);
        setCouponInviterInput('');
      }
    } else {
      setHasValidInviter(false);
      setCouponInviterInput('');
    }

    if (toParam && toParam.trim()) {
      setInviteeName(toParam.trim());
      setKakaoInvitee(toParam.trim());
      setCouponNicknameInput(toParam.trim());
    }
  }, []);

  // Compute invitation letter definition dynamically
  const { lines, totalCharCount } = useMemo(() => {
    return buildInvitationLines(inviteeName, inviterName);
  }, [inviteeName, inviterName]);

  // Restart typewriter animation when names change
  useEffect(() => {
    setCharIndex(0);
    setIsDeleting(false);
  }, [inviteeName, inviterName]);

  // Forward typing -> pause 3.5s -> reverse backtyping -> pause 0.8s -> repeat
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (charIndex < totalCharCount) {
        timer = setTimeout(() => {
          setCharIndex((prev) => prev + 1);
        }, 36);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 3500);
      }
    } else {
      if (charIndex > 0) {
        timer = setTimeout(() => {
          setCharIndex((prev) => Math.max(0, prev - 2));
        }, 16);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(false);
        }, 800);
      }
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, totalCharCount]);

  // Determine active cursor line index
  let activeCursorLineIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const item = lines[i];
    if (charIndex >= item.startIndex && charIndex <= item.endIndex) {
      activeCursorLineIndex = i;
      break;
    }
    if (charIndex > item.endIndex) {
      activeCursorLineIndex = i;
    }
  }

  // Helper to generate public share URL (항상 새 배포 도메인 https://church-hw.web.app/ 사용)
  const generateShareUrl = (from: string, to: string) => {
    try {
      const url = new URL('https://church-hw.web.app/');
      if (from.trim()) {
        url.searchParams.set('from', from.trim());
      }
      if (to.trim()) {
        url.searchParams.set('to', to.trim());
      }
      return url.toString();
    } catch {
      return 'https://church-hw.web.app/';
    }
  };

  // Open Kakao Modal
  const openKakaoModal = () => {
    setKakaoInviter(inviterName === '행복한 이웃' ? '' : inviterName);
    setKakaoInvitee(inviteeName);
    setKakaoSentNotice(false);
    setShowKakaoModal(true);
  };

  // Open Video (가로 전체화면 및 네이티브 풀스크린 자동 트리거)
  const handleOpenVideo = () => {
    setShowVideoModal(true);
    const video = modalVideoRef.current;
    if (video) {
      video.currentTime = 0;
      video.muted = false;
      video.play().catch(() => {});

      // iOS Safari 네이티브 가로 풀스크린 플레이어 직통 호출
      if ((video as any).webkitEnterFullscreen) {
        try {
          (video as any).webkitEnterFullscreen();
        } catch {}
      } else if (video.requestFullscreen) {
        // 안드로이드 / PC 전체화면 및 가로 방향 회전 요청
        video.requestFullscreen().then(() => {
          if (screen.orientation && (screen.orientation as any).lock) {
            (screen.orientation as any).lock('landscape').catch(() => {});
          }
        }).catch(() => {});
      }
    }
  };

  // Close Video
  const handleCloseVideo = () => {
    setShowVideoModal(false);
    setIsLandscapeRotated(false);
    const video = modalVideoRef.current;
    if (video) {
      video.pause();
    }
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  // iOS Safari 및 네이티브 전체화면 종료 이벤트 처리
  useEffect(() => {
    const video = modalVideoRef.current;
    if (!video) return;

    const handleWebkitEnd = () => {
      setShowVideoModal(false);
      video.pause();
    };

    video.addEventListener('webkitendfullscreen', handleWebkitEnd);
    return () => {
      video.removeEventListener('webkitendfullscreen', handleWebkitEnd);
    };
  }, []);

  // ESC 키로 영상 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showVideoModal) {
        handleCloseVideo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showVideoModal]);

  // Initialize Kakao SDK with current JavaScript Key: 9877678c37f6730a2737d41fc9f00cc3
  useEffect(() => {
    const initKakao = () => {
      if (typeof window !== 'undefined' && (window as any).Kakao) {
        try {
          if ((window as any).Kakao.isInitialized()) {
            (window as any).Kakao.cleanup();
          }
          (window as any).Kakao.init(KAKAO_JAVASCRIPT_KEY);
        } catch (e) {
          console.warn('Kakao init error:', e);
        }
      }
    };

    initKakao();
    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      if ((window as any).Kakao && !(window as any).Kakao.isInitialized()) {
        try {
          (window as any).Kakao.init(KAKAO_JAVASCRIPT_KEY);
        } catch {
          // ignore
        }
        clearInterval(timer);
      } else if (attempts >= 40) {
        clearInterval(timer);
      }
    }, 250);

    return () => clearInterval(timer);
  }, []);

  // Send via Kakao / Share
  const handleSendViaKakao = async () => {
    const finalFrom = kakaoInviter.trim();
    if (!finalFrom) {
      alert('[초대하는 사람] 이름을 입력해 주세요. 이름이 있는 초대장만 카페 이용권 선물을 받을 수 있습니다.');
      return;
    }
    const finalTo = kakaoInvitee.trim();
    const shareUrl = generateShareUrl(finalFrom, finalTo);

    setInviterName(finalFrom);
    setCouponInviterInput(finalFrom);
    setHasValidInviter(true);
    if (finalTo) {
      setInviteeName(finalTo);
      setCouponNicknameInput(finalTo);
    }

    // 서버에 초대장 발송 기록 저장
    recordInvitation(finalFrom, finalTo || '소중한 이웃');

    const shareTitle = `[사랑한 Day~] ${finalTo ? `${finalTo}님 ` : ''}초대합니다.`;
    const shareDesc = `${finalFrom}님이 2026년 추수감사주일 '사랑한 Day'에 당신을 초대합니다.`;
    const messageText = `${shareTitle}\n${shareDesc}\n\n👉 모바일 초대장 열기:\n${shareUrl}`;

    // 1. 카카오 공식 SDK (키: 9877678c37f6730a2737d41fc9f00cc3) -> 카카오톡 앱 즉시 직통 실행 (친구 목록 바로 뜨기)
    if ((window as any).Kakao) {
      try {
        if (!(window as any).Kakao.isInitialized()) {
          (window as any).Kakao.init(KAKAO_JAVASCRIPT_KEY);
        }

        if ((window as any).Kakao.isInitialized()) {
          const posterImageUrl = 'https://church-hw.web.app/invitation_poster.png';

          (window as any).Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
              title: shareTitle,
              description: shareDesc,
              imageUrl: posterImageUrl,
              link: {
                mobileWebUrl: shareUrl,
                webUrl: shareUrl,
              },
            },
            buttons: [
              {
                title: '모바일 초대장 열기',
                link: {
                  mobileWebUrl: shareUrl,
                  webUrl: shareUrl,
                },
              },
            ],
          });
          setKakaoSentNotice(true);
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
          setTimeout(() => setKakaoSentNotice(false), 3000);
          return;
        }
      } catch (err) {
        console.warn('Kakao Share failed, falling back to navigator.share:', err);
      }
    }

    // 2. 스마트폰 네이티브 공유창 (카카오톡 아이콘 선택 시 카톡 친구 목록으로 직통)
    if (navigator.share) {
      try {
        await navigator.share({
          title: '행복한 마산회원교회 사랑한 Day 초대장',
          text: messageText,
          url: shareUrl,
        });
        setKakaoSentNotice(true);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        setTimeout(() => setKakaoSentNotice(false), 3000);
        return;
      } catch (err: unknown) {
        if ((err as { name?: string }).name === 'AbortError') {
          return;
        }
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(messageText);
      setKakaoSentNotice(true);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setTimeout(() => setKakaoSentNotice(false), 3000);
    }
  };

  const handleCopyLinkOnly = async () => {
    const finalFrom = kakaoInviter.trim();
    if (!finalFrom) {
      alert('[초대하는 사람] 이름을 입력해 주세요. 이름이 있는 초대장만 카페 이용권 선물을 받을 수 있습니다.');
      return;
    }
    const finalTo = kakaoInvitee.trim();
    const shareUrl = generateShareUrl(finalFrom, finalTo);

    setInviterName(finalFrom);
    setCouponInviterInput(finalFrom);
    setHasValidInviter(true);
    if (finalTo) {
      setInviteeName(finalTo);
      setCouponNicknameInput(finalTo);
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setKakaoSentNotice(true);
      setTimeout(() => setKakaoSentNotice(false), 2500);
    }
  };

  // Handle Coupon Submit
  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasValidInviter) {
      alert('초대한 사람이 없는 링크-카톡초대장을 받아야 해요~');
      return;
    }
    const finalNickname = couponNicknameInput.trim();
    if (!finalNickname) {
      alert('선물 확인을 위해서 이름이나 닉네임을 적어주세요.');
      return;
    }
    const finalInviter = (couponInviterInput.trim() || inviterName).trim();
    const finalRel = couponCustomRelation.trim() || couponRelation || '이웃';

    setInviterName(finalInviter);
    onCheerSuccess(finalInviter, finalNickname, '남', finalRel);

    // 서버에 선물 다운로드 기록 저장
    recordGiftDownload(finalInviter, finalNickname, finalRel);

    const ticketUrl = createCouponTicketDataUrl(finalInviter, finalNickname);
    setCouponImageUrl(ticketUrl);
    setCouponUnlocked(true);

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleCopyCouponImage = async () => {
    if (!couponImageUrl) return;

    try {
      const res = await fetch(couponImageUrl);
      const blob = await res.blob();

      if (navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({ 'image/png': blob }),
        ]);
        setCouponCopiedNotice(true);
        setTimeout(() => setCouponCopiedNotice(false), 3000);
        return;
      }
    } catch (err) {
      console.warn('Clipboard image write failed, falling back to download:', err);
    }

    // fallback: 이미지 다운로드 실행
    handleDownloadCouponImage();
    setCouponCopiedNotice(true);
    setTimeout(() => setCouponCopiedNotice(false), 3000);
  };

  const handleDownloadCouponImage = () => {
    if (!couponImageUrl) return;
    const finalNickname = couponNicknameInput.trim() || inviteeName || '이웃';
    const link = document.createElement('a');
    link.href = couponImageUrl;
    link.download = `사랑한Day_카페이용권_${finalNickname}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="py-6 sm:py-10 px-2 sm:px-4 relative overflow-hidden">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* 1. 초대합니다 카드 (외곽 네모 박스 제거 + 카드 크기 확대 + 외곽선 및 하단 깊은 입체 그림자) */}
        <div className="relative z-10 font-gothic select-none mb-2">
          {/* 아랫쪽을 더욱 깊이감 있게 받쳐주는 하단 집중 그림자 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-3.5 left-[4%] right-[4%] h-10 rounded-[100%] bg-stone-950/40 blur-xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-1.5 left-[8%] right-[8%] h-6 rounded-[100%] bg-stone-950/35 blur-md"
          />

          {/* 배경 편지지 & 봉투 누끼 이미지 (외곽선 전체 + 아랫쪽 강조 드롭섀도우) */}
          <img
            src="/invitation_card.png"
            alt="초대합니다 편지지 카드"
            className="relative w-full h-auto block [filter:drop-shadow(0_-2px_6px_rgba(30,20,15,0.10))_drop-shadow(0_8px_14px_rgba(30,20,15,0.20))_drop-shadow(0_22px_28px_rgba(25,15,10,0.34))]"
          />

          {/* 편지지(흰색 종이 안쪽 테두리) 영역 위에 초대 글자 표시 (이쁜 프리텐다드 고딕체) */}
          <div className="absolute top-[13%] left-[14.5%] right-[14.5%] bottom-[34%] flex flex-col justify-start pointer-events-none">
            <div className="text-left space-y-0.5 sm:space-y-1 text-[15px] sm:text-[18px] font-gothic font-medium leading-[1.25] sm:leading-[1.28] text-slate-900 break-keep">
              {lines.map((item, idx) => {
                const charsToShow = Math.max(0, Math.min(item.text.length, charIndex - item.startIndex));
                const isVisible = charIndex >= item.startIndex;
                const hasCursor = idx === activeCursorLineIndex;

                if (!isVisible && charsToShow === 0 && !hasCursor) {
                  return null;
                }

                const lineText = item.text.slice(0, charsToShow);
                const isHighlight = item.type === 'highlight';

                return (
                  <div
                    key={idx}
                    className={isHighlight ? 'text-rose-600 font-semibold' : 'text-slate-900 font-medium'}
                  >
                    <span>{lineText}</span>
                    {hasCursor && (
                      <span
                        className={`inline-block w-[2px] h-[1.1em] ml-0.5 animate-pulse align-middle ${
                          isHighlight ? 'bg-rose-600' : 'bg-slate-900'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 봉투 하단 영역: 카톡으로 초대장 전달하기 + 검은색 동그란 엔터 버튼 */}
          <div className="absolute bottom-[4.5%] left-[6.5%] right-[6.5%] bg-white/92 backdrop-blur-md rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3.5 shadow-lg border border-amber-900/10 flex items-center justify-between font-gothic">
            <button
              type="button"
              onClick={openKakaoModal}
              className="text-slate-900 text-[15px] sm:text-[17px] font-bold hover:text-slate-600 transition cursor-pointer text-left bg-transparent p-0 border-0 outline-none font-gothic"
            >
              카톡으로 초대장 전달하기
            </button>

            <button
              type="button"
              onClick={openKakaoModal}
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black hover:bg-slate-800 text-white flex items-center justify-center shadow-md transition-all active:scale-90 hover:scale-105 cursor-pointer shrink-0"
              title="카톡으로 초대장 전달하기 (Enter ↵)"
              aria-label="카톡으로 초대장 전달하기 (Enter ↵)"
            >
              <CornerDownLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.4} />
            </button>
          </div>
        </div>

        {/* 2. 초대장 원본 카드 (초대장 카드 바로 아래 배치 + 중앙에 '카페이용권 선물로 드립니다' 버튼) */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-stone-900/15 border border-stone-200/80 bg-[#faf4ec] group mt-8 sm:mt-12">
          <img
            src="/invitation_poster.png"
            alt="사랑한 데이 공식 포스터"
            className="w-full h-auto object-cover block mx-auto"
          />

          {/* 포스터 하단부 여백: '카페이용권 선물로 드립니다' 버튼 및 그 아래 '초대영상 보기' 버튼 배치 */}
          <div className="absolute top-[56.5%] left-0 right-0 flex flex-col items-center gap-2.5 px-4 pointer-events-none">
            <button
              type="button"
              onClick={() => setShowCafePageModal(true)}
              className="group/btn pointer-events-auto px-6 py-3 sm:px-7 sm:py-3.5 rounded-full bg-[#26211e] hover:bg-[#1a1614] text-white font-gothic font-semibold text-[13.5px] sm:text-[15px] tracking-tight border border-white/25 shadow-[0_4px_0_#120f0d,0_10px_20px_rgba(20,15,10,0.26)] hover:translate-y-[1px] hover:shadow-[0_3px_0_#120f0d,0_7px_14px_rgba(20,15,10,0.24)] active:translate-y-[4px] active:shadow-[0_0px_0_#120f0d,0_3px_6px_rgba(20,15,10,0.2)] flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer"
            >
              <span>카페이용권 선물로 드립니다</span>
              <ChevronRight className="w-4 h-4 text-white/80 transition-transform duration-200 group-hover/btn:translate-x-0.5 shrink-0" />
            </button>

            <button
              type="button"
              onClick={handleOpenVideo}
              className="group/vid pointer-events-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-white/95 hover:bg-white text-stone-800 font-gothic font-semibold text-xs sm:text-sm tracking-tight border border-stone-300/90 shadow-[0_3px_0_#d6d3d1,0_8px_16px_rgba(20,15,10,0.15)] hover:translate-y-[1px] hover:shadow-[0_2px_0_#d6d3d1,0_5px_12px_rgba(20,15,10,0.14)] active:translate-y-[3px] active:shadow-[0_0px_0_#d6d3d1,0_2px_5px_rgba(20,15,10,0.12)] flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-stone-800 fill-stone-800 shrink-0" />
              <span>초대영상 보기</span>
            </button>
          </div>
        </div>

      </div>

      {/* 💬 카카오톡 스타일 초대장 발송 팝업창 */}
      {showKakaoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-amber-300 relative animate-in zoom-in-95 duration-150 font-gothic">
            
            <button
              onClick={() => setShowKakaoModal(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs cursor-pointer"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-full bg-[#FEE500] flex items-center justify-center text-[#191919] font-black text-xs shadow-xs">
                <MessageCircle className="w-4 h-4 fill-current" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                카카오톡으로 초대장 보내기
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  초대하는 사람:
                </label>
                <input
                  type="text"
                  value={kakaoInviter}
                  onChange={(e) => setKakaoInviter(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#FEE500] bg-slate-50 text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal outline-none"
                  placeholder="초대하는 분"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  초대받는 사람:
                </label>
                <input
                  type="text"
                  value={kakaoInvitee}
                  onChange={(e) => setKakaoInvitee(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#FEE500] bg-slate-50 text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal outline-none"
                  placeholder="초대받는 분"
                />
              </div>

              <div className="pt-1 pb-0.5 text-center leading-relaxed">
                <p className="text-xs sm:text-[13px] text-stone-900 font-bold mb-0.5">
                  위의 이름으로 초대장이 발송됩니다.
                </p>
                <p className="text-[11.5px] sm:text-xs text-stone-700 font-medium">
                  [초대하는 사람]이 있는 초대장만 카페 이용권 선물을 받을 수 있으니<br />
                  반드시 이름을 넣어 발송하세요.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSendViaKakao}
                className="w-full mt-1.5 py-3 rounded-2xl bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-[#191919]" />
                <span>카카오톡 친구에게 보내기</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLinkOnly}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>초대 링크만 복사하기</span>
              </button>

              {kakaoSentNotice && (
                <div className="py-1 px-2 text-slate-900 text-xs sm:text-[13px] font-bold text-center animate-in fade-in duration-150 flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4 text-slate-900" strokeWidth={2.4} />
                  <span>카카오톡 친구 선택 또는 대화방에 붙여넣기(Ctrl+V) 하세요!</span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ☕ 카페이용권 페이지 (모달: 교회 카페 배경 사진이 훤히 보이도록 투명 배경 + 흰색 광채 그림자 텍스트 적용) */}
      {showCafePageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-gothic"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCafePageModal(false);
          }}
        >
          <div
            className="rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border-2 border-white/60 relative max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150 bg-cover bg-center overflow-hidden"
            style={{ backgroundImage: "url('/cafe_bg.jpg')" }}
          >
            {/* 카페 사진 원본이 밝고 선명하게 드러나도록 아주 얇은 은은한 필터만 적용 */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-white/10"
            />

            <button
              onClick={() => setShowCafePageModal(false)}
              className="sticky top-0 float-right -mr-1 -mt-1 w-8 h-8 rounded-full bg-white/90 text-stone-900 hover:bg-white shadow-md border border-stone-200 flex items-center justify-center text-xs cursor-pointer z-30 transition"
              aria-label="닫기"
              title="닫기"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative z-10">
              {/* Header & 20,000원 (배경 완전 투명 + 진한 글씨에 흰색 다중 테두리 그림자) */}
              <div className="text-center pt-1 pb-2.5 border-b border-white/60">
                <h3 className="text-xl sm:text-2xl font-extrabold font-gothic text-stone-950 tracking-tight [text-shadow:0_0_8px_#fff,0_0_14px_#fff,0_0_20px_#fff,1px_1px_0_#fff,-1px_-1px_0_#fff,1px_-1px_0_#fff,-1px_1px_0_#fff]">
                  사랑한데이 카페이용권
                </h3>
                <div className="text-3xl sm:text-4xl font-black text-stone-950 mt-1 tracking-tight [text-shadow:0_0_8px_#fff,0_0_16px_#fff,0_0_24px_#fff,1.5px_1.5px_0_#fff,-1.5px_-1.5px_0_#fff,1.5px_-1.5px_0_#fff,-1.5px_1.5px_0_#fff]">
                  20,000<span className="text-2xl sm:text-3xl ml-0.5 font-extrabold">원</span>
                </div>
              </div>

              {/* Description (배경 완전 투명 + 흰색 광채 그림자로 카페 사진 노출 극대화) */}
              <div className="my-2.5 px-1 py-1 text-center bg-transparent">
                <p className="text-[13px] sm:text-sm text-stone-950 leading-relaxed font-extrabold break-keep [text-shadow:0_0_6px_#fff,0_0_12px_#fff,0_0_18px_#fff,1px_1px_0_#fff,-1px_-1px_0_#fff,1px_-1px_0_#fff,-1px_1px_0_#fff]">
                  유명카페의 고급 원두와 레시피를 섬기는 마음을 담아 항상 저렴한 가격으로 제공합니다. 언제든지 오셔서 쉬어 가세요.
                </p>
              </div>

              {/* Cafe Menu Table (반투명 유리 효과로 뒤쪽 카페 모습이 비치면서 흰색 글자 그림자로 선명하게 표시) */}
              <div className="bg-white/35 backdrop-blur-[1.5px] rounded-2xl p-3.5 border border-white/60 shadow-sm mb-3.5">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:text-[13px] text-stone-950 font-extrabold [text-shadow:0_0_6px_#fff,0_0_10px_#fff,1px_1px_0_#fff,-1px_-1px_0_#fff,1px_-1px_0_#fff,-1px_1px_0_#fff]">
                  <div className="space-y-1.5">
                    {CAFE_MENU_ITEMS.slice(0, 5).map((item) => (
                      <div key={item.name} className="flex items-center justify-between border-b border-dotted border-stone-700/40 pb-0.5">
                        <span>{item.name}</span>
                        <span className="font-mono font-black">{item.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    {CAFE_MENU_ITEMS.slice(5, 10).map((item) => (
                      <div key={item.name} className="flex items-center justify-between border-b border-dotted border-stone-700/40 pb-0.5">
                        <span>{item.name}</span>
                        <span className="font-mono font-black">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Voucher Download Form or Unlocked View (불투명한 깔끔한 흰색 카드로 표시) */}
              {!couponUnlocked ? (
                <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-lg">
                  <div className="flex items-center justify-between mb-3 pb-1 border-b border-stone-100">
                    <h4 className="text-sm sm:text-[15px] font-extrabold font-gothic text-stone-900">
                      카페 선물권을 다운로드 하세요
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowCafePageModal(false)}
                      className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer transition shrink-0"
                      aria-label="닫기"
                      title="닫기"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCouponSubmit} className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs sm:text-[13px] font-bold text-stone-800">
                          초대한 사람:
                        </label>
                        {hasValidInviter && (
                          <span className="text-[11px] text-stone-500 font-medium">
                            (링크로 고정됨)
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        readOnly={true}
                        value={
                          hasValidInviter
                            ? couponInviterInput || inviterName
                            : '초대한 사람이 없는 링크-카톡초대장을 받아야 해요~'
                        }
                        className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-[13px] font-semibold outline-none transition select-none ${
                          hasValidInviter
                            ? 'bg-stone-100 text-stone-900 border-stone-300 cursor-not-allowed'
                            : 'bg-stone-100 text-stone-800 border-stone-300 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-[13px] font-bold text-stone-800 mb-1">
                        나의 닉네임:
                      </label>
                      <input
                        type="text"
                        required
                        disabled={!hasValidInviter}
                        value={couponNicknameInput}
                        onChange={(e) => setCouponNicknameInput(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold outline-none transition ${
                          !hasValidInviter
                            ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                            : 'bg-stone-50 focus:bg-white text-stone-900 border-stone-200 focus:border-stone-800'
                        }`}
                        placeholder={
                          hasValidInviter
                            ? '본인 닉네임 또는 이름'
                            : '초대한 사람이 없어 입력할 수 없습니다'
                        }
                      />
                    </div>

                    {/* 안내 문구 수정: 심플한 검은색 글자 */}
                    <div className="pt-1.5 pb-0.5 text-center space-y-1">
                      <p className="text-xs sm:text-[12.5px] text-stone-900 font-bold leading-snug">
                        선물 확인을 위해서 이름이나 닉네임을 적어주세요.
                      </p>
                      <p className="text-[11px] sm:text-xs text-stone-700 font-medium leading-relaxed">
                        선물은 1인 1개. 초대받은 손님만 받을 수 있고 양도불가 합니다.<br />
                        마산회원교회 성도는 받을 수 없습니다.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={!hasValidInviter || !couponNicknameInput.trim()}
                      className={`w-full mt-1.5 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition ${
                        !hasValidInviter || !couponNicknameInput.trim()
                          ? 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-75 shadow-none'
                          : 'bg-stone-900 hover:bg-black text-white shadow-md active:scale-98 cursor-pointer'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      <span>선물 다운로드</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-lg text-center space-y-3 font-gothic">
                  <div className="flex items-center justify-between pb-1 border-b border-stone-100">
                    <div className="flex items-center gap-1.5 text-stone-900 font-bold text-xs sm:text-[13px]">
                      <Check className="w-4 h-4 text-stone-900" strokeWidth={2.4} />
                      <span>선물 발급 완료</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-600 font-bold">
                        마산회원교회 카페
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCafePageModal(false)}
                        className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-black flex items-center justify-center cursor-pointer transition shrink-0"
                        aria-label="닫기"
                        title="닫기"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 생성된 이용권 이미지 */}
                  {couponImageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm bg-[#FAF7F2]">
                      <img
                        src={couponImageUrl}
                        alt="사랑한 Day 카페 이용권"
                        className="w-full h-auto block select-none"
                      />
                    </div>
                  )}

                  {couponCopiedNotice && (
                    <div className="py-1 px-2 text-stone-900 text-xs sm:text-[13px] font-bold text-center animate-in fade-in flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4 text-stone-900" strokeWidth={2.4} />
                      <span>이용권 이미지가 복사되었습니다! 카카오톡에 바로 붙여넣기(Ctrl+V) 하세요.</span>
                    </div>
                  )}

                  {/* 복사 & 다운로드 버튼 */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyCouponImage}
                      className="py-3 px-3 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Copy className="w-4 h-4" />
                      <span>이용권 복사하기</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadCouponImage}
                      className="py-3 px-3 rounded-xl bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 font-bold text-xs sm:text-sm shadow-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      <span>이미지 저장</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-stone-400 text-center font-normal pt-0.5">
                    💡 이미지를 길게 누르거나 위 버튼으로 사진첩 저장 및 복사가 가능합니다.
                  </p>

                  {/* 창 닫기 버튼 */}
                  <button
                    type="button"
                    onClick={() => setShowCafePageModal(false)}
                    className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>창 닫기</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 🎬 초대영상 가로 풀스크린 모달 */}
      <div
        className={`fixed inset-0 z-[100] w-full h-full bg-black flex items-center justify-center transition-opacity duration-200 ${
          showVideoModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleCloseVideo}
      >
        {/* Top Control Bar: 가로 회전 토글 + 닫기 버튼 */}
        <div className="fixed top-0 left-0 right-0 z-[110] p-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLandscapeRotated((prev) => !prev);
              const video = modalVideoRef.current;
              if (video && video.requestFullscreen && !document.fullscreenElement) {
                video.requestFullscreen().then(() => {
                  if (screen.orientation && (screen.orientation as any).lock) {
                    (screen.orientation as any).lock('landscape').catch(() => {});
                  }
                }).catch(() => {});
              }
            }}
            className="pointer-events-auto px-3.5 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-gothic text-xs font-medium flex items-center gap-1.5 backdrop-blur-md border border-white/25 transition active:scale-95 cursor-pointer shadow-lg"
          >
            <RotateCw className="w-3.5 h-3.5 text-white" />
            <span>{isLandscapeRotated ? '세로 보기' : '가로 꽉찬 화면'}</span>
          </button>

          <button
            type="button"
            onClick={handleCloseVideo}
            className="pointer-events-auto w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/25 transition active:scale-90 cursor-pointer shadow-lg"
            aria-label="영상 닫기"
            title="영상 닫기"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Video Wrapper (가로 회전 토글 시 세로 폰에서도 가로로 꽉 참) */}
        <div
          className={`relative flex items-center justify-center transition-transform duration-300 ${
            isLandscapeRotated
              ? 'w-[100vh] h-[100vw] rotate-90 max-w-none max-h-none'
              : 'w-full h-full max-w-none max-h-none'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <video
            ref={modalVideoRef}
            src="/hero_video.mp4"
            poster="/hero_poster.jpg"
            controls
            playsInline
            className="w-full h-full object-contain bg-black"
          />
        </div>
      </div>

    </section>
  );
};
