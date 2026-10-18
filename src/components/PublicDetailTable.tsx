import React, { useState, useEffect } from 'react';
import {
  Send,
  Gift,
  Search,
  RefreshCw,
  CheckCircle,
  Table,
} from 'lucide-react';
import {
  fetchPublicRecords,
  InvitationRecord,
  GiftDownloadRecord,
} from '../services/analytics';

export const PublicDetailTable: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<InvitationRecord[]>([]);
  const [gifts, setGifts] = useState<GiftDownloadRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'invitations' | 'gifts'>('invitations');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const records = await fetchPublicRecords();
      setInvitations(records.invitations);
      setGifts(records.giftDownloads);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (isoString: string) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return isoString;
    }
  };

  const filteredInvitations = invitations.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.inviter?.toLowerCase().includes(q) ||
      item.invitee?.toLowerCase().includes(q)
    );
  });

  const filteredGifts = gifts.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.inviter?.toLowerCase().includes(q) ||
      item.invitee?.toLowerCase().includes(q) ||
      item.relation?.toLowerCase().includes(q)
    );
  });

  return (
    <section className="py-8 sm:py-12 px-3 sm:px-6 relative font-gothic">
      <div className="max-w-2xl mx-auto space-y-4">
        
        {/* Header Card */}
        <div className="text-center space-y-1.5 pb-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 text-white text-[11px] font-bold shadow-xs">
            <Table className="w-3 h-3" />
            <span>사랑한 Day 참여 현황</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
            실시간 초대 및 선물 상세내역
          </h3>
          <p className="text-xs text-stone-500 font-medium">
            함께 사랑을 전하는 따뜻한 이웃들의 참여 내역입니다.
          </p>
        </div>

        {/* Tab & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-stone-200/90 p-1 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('invitations')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'invitations'
                  ? 'bg-white text-stone-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Send className="w-3 h-3" />
              <span>초대장 ({filteredInvitations.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('gifts')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'gifts'
                  ? 'bg-white text-stone-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Gift className="w-3 h-3" />
              <span>선물 ({filteredGifts.length})</span>
            </button>
          </div>

          {/* Search & Refresh */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="이름 검색..."
                className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-medium outline-none focus:border-stone-900"
              />
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 shadow-xs transition cursor-pointer"
              title="새로고침"
              aria-label="새로고침"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-14 text-center text-xs text-stone-400 font-medium">
              내역을 불러오는 중입니다...
            </div>
          ) : activeTab === 'invitations' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 font-bold">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">번호</th>
                    <th className="py-2.5 px-3 font-bold text-stone-800">초대하는 분</th>
                    <th className="py-2.5 px-3 font-bold text-stone-800">초대받는 분</th>
                    <th className="py-2.5 px-3 text-stone-400">일시</th>
                    <th className="py-2.5 px-3 text-right">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {filteredInvitations.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-stone-50/70 transition">
                      <td className="py-2.5 px-3 text-center text-stone-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-stone-950">
                        {item.inviter}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-stone-950">
                        {item.invitee}
                      </td>
                      <td className="py-2.5 px-3 text-stone-500 text-[11px]">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle className="w-2.5 h-2.5" />
                          <span>발송완료</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredInvitations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-stone-400 text-xs">
                        {searchQuery ? '검색 결과가 없습니다.' : '아직 발송된 초대장이 없습니다.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 font-bold">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">번호</th>
                    <th className="py-2.5 px-3 font-bold text-stone-800">초대한 분</th>
                    <th className="py-2.5 px-3 font-bold text-stone-800">받는 분</th>
                    <th className="py-2.5 px-3 text-stone-500">관계</th>
                    <th className="py-2.5 px-3 text-stone-400">일시</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {filteredGifts.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-stone-50/70 transition">
                      <td className="py-2.5 px-3 text-center text-stone-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-stone-950">
                        {item.inviter}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-stone-950">
                        {item.invitee}
                      </td>
                      <td className="py-2.5 px-3 text-stone-600 text-[11px]">
                        {item.relation || '이웃'}
                      </td>
                      <td className="py-2.5 px-3 text-stone-500 text-[11px]">
                        {formatDate(item.createdAt)}
                      </td>
                    </tr>
                  ))}
                  {filteredGifts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-stone-400 text-xs">
                        {searchQuery ? '검색 결과가 없습니다.' : '아직 다운로드된 선물이 없습니다.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
