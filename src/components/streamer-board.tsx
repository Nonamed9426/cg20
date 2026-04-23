'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { API_BASE } from '@/lib/api';

// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────
type Platform = 'all' | 'chzzk' | 'twitch';
type SortKey  = 'viewers';

// API 응답 타입
type ApiStreamItem = {
  appid:       number;
  name:        string;
  headerImage: string | null;
  viewers:     number;
};

// 내부 통합 타입
type GameStreamStat = {
  appid:         number;
  name:          string;
  headerImage:   string | null;
  chzzkViewers:  number;
  twitchViewers: number;
};

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
function fmtNum(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  if (n >= 1000)  return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}

function getViewers(stat: GameStreamStat, platform: Platform) {
  if (platform === 'chzzk')  return stat.chzzkViewers;
  if (platform === 'twitch') return stat.twitchViewers;
  return stat.chzzkViewers + stat.twitchViewers;
}

// ─────────────────────────────────────────────
// 치지직 vs Twitch 비율 바
// ─────────────────────────────────────────────
function PlatformBar({ chzzk, twitch }: { chzzk: number; twitch: number }) {
  const total    = chzzk + twitch || 1;
  const chzzkPct = Math.round((chzzk / total) * 100);
  return (
    <div className="w-full">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div style={{ width: `${chzzkPct}%` }} className="bg-[#9b5cff] transition-all duration-500" />
        <div style={{ width: `${100 - chzzkPct}%` }} className="bg-[#ff70ea] transition-all duration-500" />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-white/35">
        <span>치지직 {chzzkPct}%</span>
        <span>Twitch {100 - chzzkPct}%</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 시청자 수 상대 막대
// ─────────────────────────────────────────────
function ViewerBar({ value, max, platform }: { value: number; max: number; platform: Platform }) {
  const pct = Math.round((value / (max || 1)) * 100);
  const colorClass =
    platform === 'chzzk'  ? 'bg-[#9b5cff]' :
    platform === 'twitch' ? 'bg-[#ff70ea]' :
    'bg-gradient-to-r from-[#9b5cff] to-[#ff70ea]';
  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div style={{ width: `${pct}%` }} className={`${colorClass} transition-all duration-700`} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Top 3 하이라이트 카드
// ─────────────────────────────────────────────
function TopThreeCards({ entries, platform }: { entries: GameStreamStat[]; platform: Platform }) {
  const top3 = entries.slice(0, 3);
  const medals       = ['🥇', '🥈', '🥉'];
  const borderColors = ['border-[#9b5cff]/50', 'border-[#ff70ea]/30', 'border-white/10'];
  const bgColors     = ['bg-[#1e0f3f]', 'bg-[#1a0a33]', 'bg-white/[0.02]'];

  return (
    <div className="mb-6 grid grid-cols-3 gap-3">
      {top3.map((stat, idx) => {
        const viewers = getViewers(stat, platform);
        return (
          <Link
            key={stat.appid}
            href={`/games/${stat.appid}`}
            className={`relative overflow-hidden rounded-2xl border ${borderColors[idx]} ${bgColors[idx]} p-4 transition hover:border-accent/70`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xl">{medals[idx]}</span>
            </div>
            <img
              src={stat.headerImage ?? `https://cdn.akamai.steamstatic.com/steam/apps/${stat.appid}/header.jpg`}
              alt={stat.name}
              className="mb-3 h-16 w-full rounded-xl object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="truncate text-sm font-bold text-white">{stat.name}</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg bg-white/[0.05] px-2 py-2">
                <div className="mb-0.5 text-[10px] text-white/40">시청자</div>
                <div className="text-sm font-black text-[#d3bcff]">{fmtNum(viewers)}</div>
              </div>
              <div className="rounded-lg bg-white/[0.05] px-2 py-2">
                <div className="mb-0.5 text-[10px] text-white/40">플랫폼</div>
                <div className="text-xs font-bold text-[#ffd6f5]">
                  {platform === 'chzzk' ? '치지직' : platform === 'twitch' ? 'Twitch' : '통합'}
                </div>
              </div>
            </div>
            {platform === 'all' && (
              <div className="mt-3">
                <PlatformBar chzzk={stat.chzzkViewers} twitch={stat.twitchViewers} />
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────
export function StreamerBoard() {
  const [platform, setPlatform] = useState<Platform>('all');

  // ── API 상태 ──────────────────────────────────
  const [chzzkData,  setChzzkData]  = useState<ApiStreamItem[]>([]);
  const [twitchData, setTwitchData] = useState<ApiStreamItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [updatedAt,  setUpdatedAt]  = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/streamer-rank/chzzk`).then((r) => r.json()),
      fetch(`${API_BASE}/streamer-rank/twitch`).then((r) => r.json()),
    ])
      .then(([chzzk, twitch]) => {
        if (chzzk.status === 'success')  setChzzkData(chzzk.data ?? []);
        if (twitch.status === 'success') setTwitchData(twitch.data ?? []);
        setUpdatedAt(chzzk.last_updated ?? twitch.last_updated ?? '');
      })
      .catch(() => setError('스트리머 데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  // ── 두 플랫폼 데이터 합치기 ────────────────────
  const merged = useMemo<GameStreamStat[]>(() => {
    const map = new Map<number, GameStreamStat>();

    chzzkData.forEach((item) => {
      map.set(item.appid, {
        appid: item.appid, name: item.name, headerImage: item.headerImage,
        chzzkViewers: item.viewers, twitchViewers: 0,
      });
    });

    twitchData.forEach((item) => {
      const existing = map.get(item.appid);
      if (existing) {
        existing.twitchViewers = item.viewers;
        if (!existing.headerImage && item.headerImage) existing.headerImage = item.headerImage;
      } else {
        map.set(item.appid, {
          appid: item.appid, name: item.name, headerImage: item.headerImage,
          chzzkViewers: 0, twitchViewers: item.viewers,
        });
      }
    });

    return Array.from(map.values());
  }, [chzzkData, twitchData]);

  // ── 정렬 ──────────────────────────────────────
  const sorted = useMemo(() =>
    [...merged].sort((a, b) => getViewers(b, platform) - getViewers(a, platform))
  , [merged, platform]);

  const maxViewers = useMemo(
    () => Math.max(...sorted.map((s) => getViewers(s, platform)), 1),
    [sorted, platform]
  );

  const PLATFORM_TABS: { key: Platform; label: string; activeClass: string }[] = [
    { key: 'all',    label: '전체',    activeClass: 'top-tab-active' },
    { key: 'chzzk',  label: '치지직',  activeClass: '!border-[#9b5cff] !bg-[#2a1060] !text-[#c49fff]' },
    { key: 'twitch', label: 'Twitch', activeClass: '!border-[#ff70ea] !bg-[#3d0f35] !text-[#ffb3f0]' },
  ];

  return (
    <section className="panel p-5 md:p-6">
      {/* 헤더 */}
      <div className="mb-5">
        <div className="text-lg font-semibold">스트리밍 인기 게임</div>
        <div className="mt-1 text-sm text-white/50">
          치지직(한국) · Twitch(글로벌) 실시간 시청자 수 기준
          {updatedAt && <span className="ml-2 text-white/30">· {updatedAt} 기준</span>}
        </div>
      </div>

      {/* 컨트롤 바 */}
      <div className="mb-5 flex flex-wrap gap-2">
        {PLATFORM_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setPlatform(t.key)}
            className={`top-tab ${platform === t.key ? t.activeClass : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 범례 */}
      {platform === 'all' && (
        <div className="mb-5 flex items-center gap-5 text-xs text-white/50">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-5 rounded-full bg-[#9b5cff]" />치지직 (한국)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-5 rounded-full bg-[#ff70ea]" />Twitch (글로벌)
          </span>
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div className="flex h-40 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#c084fc] border-t-transparent" />
        </div>
      )}

      {/* 에러 */}
      {!loading && error && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-300">
          ⚠️ {error}
        </div>
      )}

      {/* pending (서버 수집 중) */}
      {!loading && !error && sorted.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-white/40">
          스트리밍 데이터를 수집 중입니다. 잠시 후 다시 확인해주세요.
        </div>
      )}

      {/* 데이터 있을 때 */}
      {!loading && !error && sorted.length > 0 && (
        <>
          {/* Top 3 카드 */}
          <TopThreeCards entries={sorted} platform={platform} />

          {/* 전체 순위 목록 */}
          <div className="space-y-2">
            {sorted.map((stat, idx) => {
              const viewers = getViewers(stat, platform);
              return (
                <Link
                  key={`${platform}-${stat.appid}`}
                  href={`/games/${stat.appid}`}
                  className="grid grid-cols-[36px_100px_1fr_72px_100px] items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3 transition hover:border-accent/70"
                >
                  {/* 순위 */}
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#6e35dc] text-sm font-bold">
                    {idx + 1}
                  </div>

                  {/* 썸네일 */}
                  <img
                    src={stat.headerImage ?? `https://cdn.akamai.steamstatic.com/steam/apps/${stat.appid}/header.jpg`}
                    alt={stat.name}
                    className="h-14 w-full flex-shrink-0 rounded-lg object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />

                  {/* 게임 정보 */}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{stat.name}</div>
                    <div className="mt-2">
                      <ViewerBar value={viewers} max={maxViewers} platform={platform} />
                    </div>
                    {platform === 'all' && (
                      <div className="mt-1.5">
                        <PlatformBar chzzk={stat.chzzkViewers} twitch={stat.twitchViewers} />
                      </div>
                    )}
                  </div>

                  {/* 시청자 수 */}
                  <div className="flex-shrink-0 text-right">
                    <div className="mb-0.5 text-[10px] text-white/40">시청자</div>
                    <div className="text-sm font-bold text-[#d3bcff]">{fmtNum(viewers)}</div>
                  </div>

                  {/* 플랫폼별 수치 */}
                  {platform === 'all' ? (
                    <div className="flex-shrink-0 text-right text-xs text-white/50 space-y-0.5">
                      <div><span className="text-[#9b5cff] font-semibold">{fmtNum(stat.chzzkViewers)}</span> 치지직</div>
                      <div><span className="text-[#ff70ea] font-semibold">{fmtNum(stat.twitchViewers)}</span> Twitch</div>
                    </div>
                  ) : (
                    <div className="flex-shrink-0 text-right">
                      <div className="mb-0.5 text-[10px] text-white/40">{platform === 'chzzk' ? '치지직' : 'Twitch'}</div>
                      <div className="text-sm font-bold text-[#ffd6f5]">{fmtNum(viewers)}</div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
