import React, { useState, useEffect } from 'react';
import {
  Lock,
  RefreshCw,
  Download,
  LogOut,
  Send,
  Gift,
  Users,
  Search,
  ExternalLink,
  CheckCircle,
  Power,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  fetchAdminRecords,
  InvitationRecord,
  GiftDownloadRecord,
  VisitRecord,
  fetchAppSettings,
  updateAppSettings,
} from '../services/analytics';

const ADMIN_PASSWORD = '83950660';

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('masan_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Data States
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<InvitationRecord[]>([]);
  const [giftDownloads, setGiftDownloads] = useState<GiftDownloadRecord[]>([]);
  const [visits, setVisits] = useState<VisitRecord[]>([]);

  // App Settings States (앱에 총 발송수·다운로드수 끄고 켜기)
  const [showStatsInApp, setShowStatsInApp] = useState(true);
  const [isUpdatingSetting, setIsUpdatingSetting] = useState(false);
  const [showAdminTable, setShowAdminTable] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter & Tab
  const [activeTab, setActiveTab] = useState<'invitations' | 'gifts' | 'visits'>('invitations');
  const [searchQuery, setSearchQuery] = useState('');

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [records, settings] = await Promise.all([
        fetchAdminRecords(),
        fetchAppSettings(),
      ]);
      setInvitations(records.invitations);
      setGiftDownloads(records.giftDownloads);
      setVisits(records.visits);
      setShowStatsInApp(settings.showStatsInApp);
    } finally {
      setLoading(false);
    }
  };

  // Toggle App Setting (앱에 총 발송수·다운로드수 끄고 켜기)
  const handleToggleAppStatsSetting = async () => {
    setIsUpdatingSetting(true);
    const nextVal = !showStatsInApp;
    try {
      const ok = await updateAppSettings({ showStatsInApp: nextVal });
      if (ok) {
        setShowStatsInApp(nextVal);
        setToastMessage(
          nextVal
            ? '✅ 모바일 앱에 총 발송수·다운로드수를 표시합니다. (메인 화면에 노출됨)'
            : '🔒 모바일 앱에서 총 발송수·다운로드수를 숨겼습니다. (메인 화면에서 숨김)'
        );
        setTimeout(() => setToastMessage(null), 3500);
      } else {
        alert('설정 변경에 실패했습니다. 네트워크를 확인해주세요.');
      }
    } finally {
      setIsUpdatingSetting(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('masan_admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('비밀번호가 올바르지 않습니다.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('masan_admin_auth');
    setPasswordInput('');
  };

  // Format Date (KST)
  const formatDate = (isoString: string) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      return isoString;
    }
  };

  // Export to CSV with UTF-8 BOM
  const handleExportCSV = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel

    if (activeTab === 'invitations') {
      csvContent += '번호,발송일시,초대하는 분(발송자),초대받는 분(수신자)\n';
      filteredInvitations.forEach((item, idx) => {
        csvContent += `"${idx + 1}","${formatDate(item.createdAt)}","${item.inviter || ''}","${item.invitee || ''}"\n`;
      });
    } else if (activeTab === 'gifts') {
      csvContent += '번호,다운로드일시,초대한 분(선물발송자),다운로드한 분(받는이/닉네임),관계\n';
      filteredGifts.forEach((item, idx) => {
        csvContent += `"${idx + 1}","${formatDate(item.createdAt)}","${item.inviter || ''}","${item.invitee || ''}","${item.relation || ''}"\n`;
      });
    } else {
      csvContent += '번호,접속일시,초대한 분(링크),초대받는 분(링크)\n';
      filteredVisits.forEach((item, idx) => {
        csvContent += `"${idx + 1}","${formatDate(item.createdAt)}","${item.from || ''}","${item.to || ''}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const nowStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    link.download = `사랑한Day_${activeTab}_${nowStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered Lists by Search Query
  const filteredInvitations = invitations.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.inviter?.toLowerCase().includes(q) ||
      item.invitee?.toLowerCase().includes(q)
    );
  });

  const filteredGifts = giftDownloads.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.inviter?.toLowerCase().includes(q) ||
      item.invitee?.toLowerCase().includes(q) ||
      item.relation?.toLowerCase().includes(q)
    );
  });

  const filteredVisits = visits.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.from?.toLowerCase().includes(q) ||
      item.to?.toLowerCase().includes(q)
    );
  });

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#faf6f0] flex items-center justify-center p-4 font-gothic">
        <div className="bg-white rounded-3xl p-7 sm:p-9 max-w-sm w-full shadow-xl border border-stone-200 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-900 border border-stone-200">
            <Lock className="w-6 h-6 stroke-[2]" />
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-stone-950 tracking-tight">
              사랑한 Day 관리자 인증
            </h1>
            <p className="text-xs text-stone-500 font-medium mt-1">
              마산회원교회 현황 대시보드
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3 pt-2 text-left">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                관리자 비밀번호
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="비밀번호 8자리 입력"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-stone-900 bg-stone-50 focus:bg-white text-sm font-semibold text-stone-900 outline-none transition"
              />
            </div>

            {loginError && (
              <p className="text-xs text-rose-600 font-bold text-center">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-sm shadow-md transition cursor-pointer active:scale-98"
            >
              로그인
            </button>
          </form>

          <div className="pt-2 border-t border-stone-100">
            <a
              href="/"
              className="text-xs text-stone-500 hover:text-stone-900 font-medium underline"
            >
              ← 메인 초대장 페이지로 이동
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Screen
  return (
    <div className="min-h-screen bg-[#faf6f0] text-stone-900 font-gothic p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-900 text-white font-bold">
                ADMIN
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-stone-950 tracking-tight">
                행복한 마산회원교회 현황 대시보드
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1">
              2026년 추수감사주일 사랑한 Day 발송 및 카페선물권 통계
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>새로고침</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>엑셀(CSV) 저장</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>메인 보기</span>
            </a>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="로그아웃"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>로그아웃</span>
            </button>
          </div>
        </header>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 font-bold mb-1">
                초대장 발송 총계
              </p>
              <div className="text-3xl font-black text-stone-950 font-mono">
                {invitations.length.toLocaleString()}
                <span className="text-base font-bold ml-1 text-stone-600">명</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-900 flex items-center justify-center">
              <Send className="w-5 h-5 stroke-[2]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 font-bold mb-1">
                카페선물 다운로드 총계
              </p>
              <div className="text-3xl font-black text-stone-950 font-mono">
                {giftDownloads.length.toLocaleString()}
                <span className="text-base font-bold ml-1 text-stone-600">명</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-900 flex items-center justify-center">
              <Gift className="w-5 h-5 stroke-[2]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 font-bold mb-1">
                총 방문 조회수
              </p>
              <div className="text-3xl font-black text-stone-950 font-mono">
                {visits.length.toLocaleString()}
                <span className="text-base font-bold ml-1 text-stone-600">회</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-900 flex items-center justify-center">
              <Users className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 📊 앱에 총 발송수·다운로드수 끄고 켜기 & 관리자 상세내역 접기/펼치기 컨트롤 바 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-stone-900">
                📊 모바일 앱 통계 표시 설정 (초대장 발송수 / 선물 다운로드수)
              </span>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  showStatsInApp
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-stone-100 text-stone-600 border border-stone-300'
                }`}
              >
                {showStatsInApp ? '● 메인 앱 표시 중 (공개)' : '○ 메인 앱 숨김 (비공개)'}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {showStatsInApp
                ? '현재 메인 초대장 페이지에 성도 및 방문자가 볼 수 있는 총 발송수와 다운로드수가 표시되고 있습니다.'
                : '현재 메인 초대장 페이지에서 통계 숫자가 숨겨져 있으며, 관리자 페이지만 볼 수 있습니다.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* 앱 통계 끄고 켜기 토글 버튼 */}
            <button
              onClick={handleToggleAppStatsSetting}
              disabled={isUpdatingSetting}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition cursor-pointer active:scale-98 ${
                showStatsInApp
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300'
                  : 'bg-stone-900 hover:bg-black text-white'
              }`}
            >
              <Power className={`w-4 h-4 ${isUpdatingSetting ? 'animate-spin' : ''}`} />
              <span>{showStatsInApp ? '앱에서 통계 숨기기' : '앱에 통계 표시하기'}</span>
            </button>

            {/* 관리자 테이블 접기 / 펼치기 버튼 */}
            <button
              onClick={() => setShowAdminTable(!showAdminTable)}
              className="px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              {showAdminTable ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>관리자 상세내역 접기</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>관리자 상세내역 펼치기</span>
                </>
              )}
            </button>
          </div>
        </div>

        {showAdminTable ? (
          <>
            {/* Tab & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-stone-200/80 p-1 rounded-2xl self-start">
            <button
              onClick={() => setActiveTab('invitations')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'invitations'
                  ? 'bg-white text-stone-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              초대장 발송 ({filteredInvitations.length})
            </button>
            <button
              onClick={() => setActiveTab('gifts')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'gifts'
                  ? 'bg-white text-stone-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              선물 다운로드 ({filteredGifts.length})
            </button>
            <button
              onClick={() => setActiveTab('visits')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'visits'
                  ? 'bg-white text-stone-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              방문 기록 ({filteredVisits.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이름으로 검색..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-stone-300 focus:border-stone-900 text-xs sm:text-sm font-medium outline-none"
            />
          </div>
        </div>

        {/* Main Table Container */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-sm text-stone-500 font-medium">
              데이터를 불러오는 중입니다...
            </div>
          ) : activeTab === 'invitations' ? (
            /* Tab 1: 초대장 발송 목록 */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 text-xs font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4 w-14 text-center">번호</th>
                    <th className="py-3 px-4">발송 일시</th>
                    <th className="py-3 px-4 font-bold text-stone-900">초대하는 분 (발송자)</th>
                    <th className="py-3 px-4 font-bold text-stone-900">초대받는 분 (수신자)</th>
                    <th className="py-3 px-4 text-stone-400">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {filteredInvitations.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-stone-50/70 transition">
                      <td className="py-3 px-4 text-center text-stone-400 font-mono text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 text-stone-600 text-xs">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-950">
                        {item.inviter}
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-950">
                        {item.invitee}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          <span>발송완료</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredInvitations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-stone-400 text-xs">
                        {searchQuery ? '검색 결과가 없습니다.' : '아직 발송된 초대장이 없습니다.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'gifts' ? (
            /* Tab 2: 선물 다운로드 목록 */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 text-xs font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4 w-14 text-center">번호</th>
                    <th className="py-3 px-4">다운로드 일시</th>
                    <th className="py-3 px-4 font-bold text-stone-900">초대한 분 (선물 발송자)</th>
                    <th className="py-3 px-4 font-bold text-stone-900">다운로드한 분 (받는이)</th>
                    <th className="py-3 px-4 text-stone-600">관계</th>
                    <th className="py-3 px-4 text-stone-400">금액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {filteredGifts.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-stone-50/70 transition">
                      <td className="py-3 px-4 text-center text-stone-400 font-mono text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 text-stone-600 text-xs">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-950">
                        {item.inviter}
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-950">
                        {item.invitee}
                      </td>
                      <td className="py-3 px-4 text-stone-600 text-xs">
                        {item.relation || '이웃'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-stone-900 text-xs">
                        20,000원
                      </td>
                    </tr>
                  ))}
                  {filteredGifts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-400 text-xs">
                        {searchQuery ? '검색 결과가 없습니다.' : '아직 다운로드된 선물이 없습니다.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Tab 3: 방문 기록 */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 text-xs font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4 w-14 text-center">번호</th>
                    <th className="py-3 px-4">접속 일시</th>
                    <th className="py-3 px-4 text-stone-900 font-bold">초대한 분 링크 파라미터</th>
                    <th className="py-3 px-4 text-stone-900 font-bold">초대받는 분 링크 파라미터</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {filteredVisits.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-stone-50/70 transition">
                      <td className="py-3 px-4 text-center text-stone-400 font-mono text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 text-stone-600 text-xs">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-stone-950">
                        {item.from || '-'}
                      </td>
                      <td className="py-3 px-4 text-stone-950">
                        {item.to || '-'}
                      </td>
                    </tr>
                  ))}
                  {filteredVisits.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-stone-400 text-xs">
                        방문 기록이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    ) : (
      <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border border-dashed border-stone-300 space-y-3 shadow-xs">
        <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
          <EyeOff className="w-6 h-6 stroke-[1.8]" />
        </div>
        <div>
          <h4 className="text-sm sm:text-base font-extrabold text-stone-900">
            관리자 상세내역 테이블이 닫혀(숨김) 있습니다.
          </h4>
          <p className="text-xs text-stone-500 mt-1">
            위의 '관리자 테이블 펼치기' 또는 아래 버튼을 누르면 상세 테이블이 표시됩니다.
          </p>
        </div>
        <button
          onClick={() => setShowAdminTable(true)}
          className="mt-1 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer active:scale-98"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>상세내역 테이블 펼치기</span>
        </button>
      </div>
    )}

        {/* Footer */}
        <footer className="pt-4 text-center text-xs text-stone-400">
          행복한 마산회원교회 2026 사랑한 Day 관리자 시스템
        </footer>

      </div>
    </div>
  );
};
