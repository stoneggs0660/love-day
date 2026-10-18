/**
 * Realtime Database Analytics Service for Love-Day
 * Database: https://church-hw-default-rtdb.firebaseio.com/
 */

const DB_BASE_URL = 'https://church-hw-default-rtdb.firebaseio.com';

export interface InvitationRecord {
  id: string;
  inviter: string;
  invitee: string;
  createdAt: string;
  userAgent?: string;
}

export interface GiftDownloadRecord {
  id: string;
  inviter: string;
  invitee: string;
  relation?: string;
  createdAt: string;
  userAgent?: string;
}

export interface VisitRecord {
  id: string;
  from?: string;
  to?: string;
  createdAt: string;
  userAgent?: string;
}

export interface SummaryCounts {
  invitationCount: number;
  giftCount: number;
  visitCount: number;
}

// 1. 초대장 발송 기록 저장 (카카오톡 친구에게 보내기 클릭 시)
export async function recordInvitation(inviter: string, invitee: string): Promise<boolean> {
  try {
    const payload = {
      inviter: inviter.trim() || '행복한 이웃',
      invitee: invitee.trim() || '소중한 이웃',
      createdAt: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    const res = await fetch(`${DB_BASE_URL}/invitations.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (err) {
    console.warn('Failed to record invitation:', err);
    return false;
  }
}

// 2. 선물 다운로드 기록 저장 (선물다운로드 버튼 클릭 시)
export async function recordGiftDownload(
  inviter: string,
  invitee: string,
  relation: string = '이웃'
): Promise<boolean> {
  try {
    const payload = {
      inviter: inviter.trim() || '행복한 이웃',
      invitee: invitee.trim() || '이웃',
      relation: relation.trim() || '이웃',
      createdAt: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    const res = await fetch(`${DB_BASE_URL}/gift_downloads.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (err) {
    console.warn('Failed to record gift download:', err);
    return false;
  }
}

// 3. 방문 기록 저장
export async function recordVisit(from?: string, to?: string): Promise<void> {
  try {
    // 세션당 1회만 중복 없이 기록
    if (typeof sessionStorage !== 'undefined') {
      if (sessionStorage.getItem('masan_visit_logged')) return;
      sessionStorage.setItem('masan_visit_logged', 'true');
    }

    const payload = {
      from: from || '',
      to: to || '',
      createdAt: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    await fetch(`${DB_BASE_URL}/visits.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // ignore
  }
}

// 4. 총 카운트 요약 조회
export async function fetchSummaryCounts(): Promise<SummaryCounts> {
  try {
    const [invRes, giftRes, visitRes] = await Promise.all([
      fetch(`${DB_BASE_URL}/invitations.json?shallow=true`),
      fetch(`${DB_BASE_URL}/gift_downloads.json?shallow=true`),
      fetch(`${DB_BASE_URL}/visits.json?shallow=true`),
    ]);

    const invData = invRes.ok ? await invRes.json() : null;
    const giftData = giftRes.ok ? await giftRes.json() : null;
    const visitData = visitRes.ok ? await visitRes.json() : null;

    const invitationCount = invData ? Object.keys(invData).length : 0;
    const giftCount = giftData ? Object.keys(giftData).length : 0;
    const visitCount = visitData ? Object.keys(visitData).length : 0;

    return {
      invitationCount,
      giftCount,
      visitCount,
    };
  } catch (err) {
    console.warn('Failed to fetch summary counts:', err);
    return {
      invitationCount: 0,
      giftCount: 0,
      visitCount: 0,
    };
  }
}

// 5. 관리자 페이지용 전체 데이터 조회
export async function fetchAdminRecords(): Promise<{
  invitations: InvitationRecord[];
  giftDownloads: GiftDownloadRecord[];
  visits: VisitRecord[];
}> {
  try {
    const [invRes, giftRes, visitRes] = await Promise.all([
      fetch(`${DB_BASE_URL}/invitations.json`),
      fetch(`${DB_BASE_URL}/gift_downloads.json`),
      fetch(`${DB_BASE_URL}/visits.json`),
    ]);

    const invJson = invRes.ok ? await invRes.json() : null;
    const giftJson = giftRes.ok ? await giftRes.json() : null;
    const visitJson = visitRes.ok ? await visitRes.json() : null;

    const parseList = <T>(obj: Record<string, any> | null): T[] => {
      if (!obj) return [];
      return Object.entries(obj)
        .map(([id, val]) => ({ id, ...val }))
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    };

    return {
      invitations: parseList<InvitationRecord>(invJson),
      giftDownloads: parseList<GiftDownloadRecord>(giftJson),
      visits: parseList<VisitRecord>(visitJson),
    };
  } catch (err) {
    console.error('Failed to fetch admin records:', err);
    return {
      invitations: [],
      giftDownloads: [],
      visits: [],
    };
  }
}

export interface AppSettings {
  showStatsInApp: boolean;
}

// 6. 앱 설정 조회 (관리자가 메인 앱에 총 발송수/다운로드수 끄고 켜기)
export async function fetchAppSettings(): Promise<AppSettings> {
  try {
    const res = await fetch(`${DB_BASE_URL}/settings.json`);
    if (res.ok) {
      const data = await res.json();
      return {
        showStatsInApp: data?.showStatsInApp !== false, // 기본값 true (표시)
      };
    }
  } catch (err) {
    console.warn('Failed to fetch app settings:', err);
  }
  return { showStatsInApp: true };
}

// 7. 앱 설정 저장
export async function updateAppSettings(settings: Partial<AppSettings>): Promise<boolean> {
  try {
    const res = await fetch(`${DB_BASE_URL}/settings.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to update app settings:', err);
    return false;
  }
}

// 8. 사용자 화면용 공개 목록 조회 (불필요한 visits.json 대용량 다운로드 방지)
export async function fetchPublicRecords(): Promise<{
  invitations: InvitationRecord[];
  giftDownloads: GiftDownloadRecord[];
}> {
  try {
    const [invRes, giftRes] = await Promise.all([
      fetch(`${DB_BASE_URL}/invitations.json`),
      fetch(`${DB_BASE_URL}/gift_downloads.json`),
    ]);

    const invJson = invRes.ok ? await invRes.json() : null;
    const giftJson = giftRes.ok ? await giftRes.json() : null;

    const parseList = <T>(obj: Record<string, any> | null): T[] => {
      if (!obj) return [];
      return Object.entries(obj)
        .map(([id, val]) => ({ id, ...val }))
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    };

    return {
      invitations: parseList<InvitationRecord>(invJson),
      giftDownloads: parseList<GiftDownloadRecord>(giftJson),
    };
  } catch (err) {
    console.error('Failed to fetch public records:', err);
    return {
      invitations: [],
      giftDownloads: [],
    };
  }
}


