import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Copy, Check, ExternalLink, Phone, Bus } from 'lucide-react';

const KAKAO_MAP_APP_KEY = '9877678c37f6730a2737d41fc9f00cc3';
const DEFAULT_LAT = 35.2187082;
const DEFAULT_LNG = 128.5764516;

export const DirectionsMap: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const mapChurchName = '마산회원교회';
  const mapAddress = '창원시 마산회원구 회원동로 43';
  const fullRoadAddress = '경상남도 창원시 마산회원구 회원동로 43';
  const mapSearchQuery = `${mapAddress} ${mapChurchName}`;
  const phone = '055-255-0191';

  useEffect(() => {
    let isMounted = true;
    let retryTimer: ReturnType<typeof setInterval> | null = null;
    let resizeHandler: (() => void) | null = null;

    const initMap = () => {
      const kakaoObj = (window as any).kakao;
      if (!kakaoObj || !kakaoObj.maps || !mapContainerRef.current) return false;

      kakaoObj.maps.load(() => {
        if (!isMounted || !mapContainerRef.current) return;

        try {
          const maps = kakaoObj.maps;
          const defaultPos = new maps.LatLng(DEFAULT_LAT, DEFAULT_LNG);

          const map = new maps.Map(mapContainerRef.current, {
            center: defaultPos,
            level: 3,
          });

          const zoomControl = new maps.ZoomControl();
          map.addControl(zoomControl, maps.ControlPosition.RIGHT);

          const marker = new maps.Marker({
            position: defaultPos,
            map,
          });

          const overlayContent = `
            <div style="transform: translateY(-44px); padding: 4px 12px; border-radius: 9999px; background: rgba(255,255,255,0.96); border: 1px solid #e7e5e4; box-shadow: 0 2px 6px rgba(0,0,0,0.12); font-family: 'Pretendard Variable', Pretendard, 'Noto Sans KR', sans-serif; font-size: 12px; font-weight: 700; color: #1e293b; white-space: nowrap; pointer-events: none;">
              ${mapChurchName}
            </div>
          `;

          const customOverlay = new maps.CustomOverlay({
            position: defaultPos,
            content: overlayContent,
            yAnchor: 1,
          });
          customOverlay.setMap(map);

          let activeCoords = defaultPos;

          if (maps.services && maps.services.Geocoder) {
            const geocoder = new maps.services.Geocoder();
            geocoder.addressSearch(fullRoadAddress, (result: any[], status: any) => {
              if (!isMounted) return;
              if (status === maps.services.Status.OK && result[0]) {
                const exactCoords = new maps.LatLng(Number(result[0].y), Number(result[0].x));
                activeCoords = exactCoords;
                marker.setPosition(exactCoords);
                customOverlay.setPosition(exactCoords);
                map.setCenter(exactCoords);
              }
            });
          }

          resizeHandler = () => {
            map.relayout();
            map.setCenter(activeCoords);
          };
          window.addEventListener('resize', resizeHandler);

          setMapLoaded(true);
        } catch (err) {
          console.warn('Kakao Map initialization failed:', err);
        }
      });

      return true;
    };

    // Ensure script exists in case it wasn't loaded yet
    if (!(window as any).kakao?.maps) {
      const existingScript = document.querySelector('script[src*="dapi.kakao.com/v2/maps/sdk.js"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_APP_KEY}&libraries=services&autoload=false`;
        script.async = true;
        document.head.appendChild(script);
      }
    }

    if (!initMap()) {
      let retryCount = 0;
      retryTimer = setInterval(() => {
        retryCount++;
        if ((initMap() || retryCount >= 40) && retryTimer) {
          clearInterval(retryTimer);
        }
      }, 250);
    }

    return () => {
      isMounted = false;
      if (retryTimer) clearInterval(retryTimer);
      if (resizeHandler) window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  const handleCopyAddress = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('경상남도 창원시 마산회원구 회원동로 43 마산회원교회');
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleTmapClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      e.preventDefault();
      window.location.href = `tmap://search?name=${encodeURIComponent(mapChurchName)}`;
      setTimeout(() => {
        window.open(`https://map.kakao.com/?q=${encodeURIComponent(mapSearchQuery)}`, '_blank');
      }, 1500);
    }
  };

  return (
    <section id="location" className="py-20 px-4 sm:px-6 bg-white relative font-gothic">
      <div className="max-w-5xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-gothic font-bold text-slate-900 tracking-tight">
            행복한 마산회원교회 오는 길
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 mt-2.5 font-normal">
            경상남도 창원시 마산회원구 회원동로 43 | 2026년 11월 15일(주일) 11:00
          </p>
        </div>

        {/* Map & Direction Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Visual Map Frame (7 Cols) */}
          <div className="lg:col-span-7 bg-[#fdfbf7] rounded-3xl overflow-hidden border border-amber-200/80 shadow-lg flex flex-col justify-between">
            
            {/* Live Kakao Map + Fallback Canvas */}
            <div className="relative w-full h-[280px] sm:h-[340px] bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 flex flex-col items-center justify-center text-center overflow-hidden">
              
              {/* Kakao Map Mount Container */}
              <div
                ref={mapContainerRef}
                className="absolute inset-0 w-full h-full z-20"
              />

              {/* Fallback Illustration (shown while loading or if domain isn't registered yet) */}
              {!mapLoaded && (
                <>
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(#059669 1.5px, transparent 1.5px)',
                      backgroundSize: '24px 24px',
                    }}
                  />

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-rose-500 text-white shadow-md flex items-center justify-center border-2 border-white">
                      <MapPin className="w-4 h-4 fill-white" />
                    </div>
                    <div className="mt-2 px-3.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-stone-200">
                      <p className="text-xs sm:text-sm font-bold text-slate-800 font-gothic">
                        마산회원교회
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Address & Direct Navigation Links */}
            <div className="p-6 bg-white border-t border-amber-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500 font-medium">마산회원교회</p>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 font-gothic">
                    경상남도 창원시 마산회원구 회원동로 43
                  </h4>
                </div>

                <button
                  onClick={handleCopyAddress}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium flex items-center gap-1.5 self-start sm:self-center transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '주소 복사완료!' : '주소 복사'}</span>
                </button>
              </div>

              {/* Map App Links (진한 배경색 + 검은색 글자 + 티맵은 파란색, 글자 굵기 font-medium 적용) */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2.5">
                <a
                  href={`https://map.naver.com/v5/search/${encodeURIComponent(mapSearchQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 rounded-xl bg-[#03C75A] hover:bg-[#02b350] text-black font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition text-center"
                >
                  <span>네이버 지도</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 text-black" />
                </a>

                <a
                  href={`https://map.kakao.com/?q=${encodeURIComponent(mapSearchQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 rounded-xl bg-[#FEE500] hover:bg-[#FDD800] text-black font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition text-center"
                >
                  <span>카카오맵</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 text-black" />
                </a>

                <a
                  href={`tmap://search?name=${encodeURIComponent(mapChurchName)}`}
                  onClick={handleTmapClick}
                  className="py-3 px-3 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-black font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition text-center"
                >
                  <span>티맵(T map)</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 text-black" />
                </a>
              </div>
            </div>

          </div>

          {/* Transportation Information (5 Cols - 자가용/주차 및 KTX 안내 삭제) */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-4">
            
            <div className="bg-[#faf7f2] rounded-2xl p-5 border border-stone-200">
              <div className="flex items-center gap-2.5 mb-2 text-slate-800">
                <Bus className="w-5 h-5 text-sky-600" />
                <h4 className="font-bold text-sm sm:text-base font-gothic">대중교통 (시내버스)</h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                마산·창원 방면 일반 버스 이용 후 <strong>'회원동'</strong> 또는 <strong>'마산회원구청'</strong> 정류장에서 하차하시면 도보 3분 거리입니다.
              </p>
            </div>

            {/* Direct Phone Assistance */}
            <div className="bg-[#faf7f2] rounded-2xl p-5 border border-stone-200 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] text-stone-500 font-semibold">길 안내 및 전화 문의</p>
                <h5 className="text-sm font-bold text-slate-800">행복한 마산회원교회</h5>
                <p className="text-xs text-slate-600 mt-0.5">{phone}</p>
              </div>
              <a
                href={`tel:${phone}`}
                className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>전화 문의</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
