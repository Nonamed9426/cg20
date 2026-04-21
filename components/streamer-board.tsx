'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { getGame, getSteamHeader } from '@/lib/data';

// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────
type Platform = 'all' | 'chzzk' | 'twitch';
type SortKey = 'viewers' | 'streams' | 'trend';

type GameStreamStat = {
  slug: string;
  chzzkViewers: number;   // 치지직 평균 동시 시청자 수
  chzzkStreams: number;   // 치지직 동시 방송 수
  twitchViewers: number;  // Twitch 평균 동시 시청자 수
  twitchStreams: number;  // Twitch 동시 방송 수
  trend: 'up' | 'down' | 'stable';
  trendPct: number;       // 전주 대비 변화율 %
  tags: string[];         // 방송 분위기 태그
};

// ─────────────────────────────────────────────
// 더미 데이터 — DB 연결 시 STREAM_STATS를 API fetch로 교체
// ─────────────────────────────────────────────
const STREAM_STATS: GameStreamStat[] = [
  {
    slug: 'counter-strike-2',
    chzzkViewers: 42800, chzzkStreams: 312,
    twitchViewers: 198000, twitchStreams: 1840,
    trend: 'up', trendPct: 18,
    tags: ['대회 시즌', 'e스포츠', '경쟁전'],
  },
  {
    slug: 'dark-and-darker',
    chzzkViewers: 31200, chzzkStreams: 228,
    twitchViewers: 54000, twitchStreams: 410,
    trend: 'up', trendPct: 34,
    tags: ['시즌 업데이트', '하드코어', '화제성'],
  },
  {
    slug: 'helldivers-2',
    chzzkViewers: 18700, chzzkStreams: 174,
    twitchViewers: 87000, twitchStreams: 620,
    trend: 'up', trendPct: 12,
    tags: ['이벤트 미션', '협동', '라이브서비스'],
  },
  {
    slug: 'elden-ring',
    chzzkViewers: 12400, chzzkStreams: 98,
    twitchViewers: 61000, twitchStreams: 490,
    trend: 'stable', trendPct: 2,
    tags: ['DLC 복귀', '도전', '탐험'],
  },
  {
    slug: 'monster-hunter-world',
    chzzkViewers: 9800, chzzkStreams: 86,
    twitchViewers: 43000, twitchStreams: 370,
    trend: 'up', trendPct: 8,
    tags: ['이벤트 퀘스트', '파티플레이', '장비파밍'],
  },
  {
    slug: 'ea-fc-24',
    chzzkViewers: 22100, chzzkStreams: 195,
    twitchViewers: 38000, twitchStreams: 280,
    trend: 'down', trendPct: 11,
    tags: ['스포츠 시즌', '리그', 'FUT'],
  },
  {
    slug: 'stardew-valley',
    chzzkViewers: 7200, chzzkStreams: 124,
    twitchViewers: 21000, twitchStreams: 310,
    trend: 'up', trendPct: 6,
    tags: ['봄 시즌', '힐링', '협동'],
  },
  {
    slug: 'sun-haven',
    chzzkViewers: 4100, chzzkStreams: 68,
    twitchViewers: 9800, twitchStreams: 140,
    trend: 'stable', trendPct: 1,
    tags: ['힐링', '인디', '농장'],
  },
  {
    slug: 'spiritfarer',
    chzzkViewers: 2900, chzzkStreams: 44,
    twitchViewers: 7200, twitchStreams: 98,
    trend: 'down', trendPct: 5,
    tags: ['감성', '스토리', '인디'],
  },
  {
    slug: 'turbo-golf-racing',
    chzzkViewers: 1800, chzzkStreams: 31,
    twitchViewers: 5400, twitchStreams: 72,
    trend: 'down', trendPct: 9,
    tags: ['파티', '캐주얼', '멀티'],
  },
];

// ─────────────────────────────────────────────
// 유틸 함수
// ─────────────────────────────────────────────
function fmtNum(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}

function getViewers(stat: GameStreamStat, platform: Platform) {
  if (platform === 'chzzk') return stat.chzzkViewers;
  if (platform === 'twitch') return stat.twitchViewers;
  return stat.chzzkViewers + stat.twitchViewers;
}

function getStreams(stat: GameStreamStat, platform: Platform) {
  if (platform === 'chzzk') return stat.chzzkStreams;
  if (platform === 'twitch') return stat.twitchStreams;
  return stat.chzzkStreams + stat.twitchStreams;
}

function trendScore(t: GameStreamStat['trend']) {
  return t === 'up' ? 2 : t === 'stable' ? 1 : 0;
}

// ─────────────────────────────────────────────
// 트렌드 뱃지
// ─────────────────────────────────────────────
function TrendBadge({ trend, pct }: { trend: GameStreamStat['trend']; pct: number }) {
  if (trend === 'up')
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-[#1a3d2b] px-2 py-0.5 text-xs font-semibold text-[#3fd09d]">
        ▲ {pct}%
      </span>
    );
  if (trend === 'down')
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-[#3d1a22] px-2 py-0.5 text-xs font-semibold text-[#ff7eb3]">
        ▼ {pct}%
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/40">
      — 보합
    </span>
  );
}

// ─────────────────────────────────────────────
// 치지직 vs Twitch 비율 바
// ─────────────────────────────────────────────
function PlatformBar({ chzzk, twitch }: { chzzk: number; twitch: number }) {
  const total = chzzk + twitch || 1;
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
    platform === 'chzzk' ? 'bg-[#9b5cff]' :
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
  const medals = ['🥇', '🥈', '🥉'];
  const borderColors = ['border-[#9b5cff]/50', 'border-[#ff70ea]/30', 'border-white/10'];
  const bgColors = ['bg-[#1e0f3f]', 'bg-[#1a0a33]', 'bg-white/[0.02]'];

  return (
    <div className="mb-6 grid grid-cols-3 gap-3">
      {top3.map((stat, idx) => {
        const game = getGame(stat.slug);
        const viewers = getViewers(stat, platform);
        const streams = getStreams(stat, platform);
        return (
          <Link
            key={stat.slug}
            href={`/games/${stat.slug}`}
            className={`relative overflow-hidden rounded-2xl border ${borderColors[idx]} ${bgColors[idx]} p-4 transition hover:border-accent/70`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xl">{medals[idx]}</span>
              <TrendBadge trend={stat.trend} pct={stat.trendPct} />
            </div>
            <img
              src={getSteamHeader(game.steamAppId)}
              alt={game.title}
              className="mb-3 h-16 w-full rounded-xl object-cover"
            />
            <div className="truncate text-sm font-bold text-white">{game.title}</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg bg-white/[0.05] px-2 py-2">
                <div className="mb-0.5 text-[10px] text-white/40">시청자</div>
                <div className="text-sm font-black text-[#d3bcff]">{fmtNum(viewers)}</div>
              </div>
              <div className="rounded-lg bg-white/[0.05] px-2 py-2">
                <div className="mb-0.5 text-[10px] text-white/40">방송 수</div>
                <div className="text-sm font-black text-[#ffd6f5]">{streams}</div>
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
  const [sortKey, setSortKey] = useState<SortKey>('viewers');

  const sorted = useMemo(() => {
    return [...STREAM_STATS].sort((a, b) => {
      if (sortKey === 'viewers') return getViewers(b, platform) - getViewers(a, platform);
      if (sortKey === 'streams') return getStreams(b, platform) - getStreams(a, platform);
      const diff = trendScore(b.trend) - trendScore(a.trend);
      return diff !== 0 ? diff : b.trendPct - a.trendPct;
    });
  }, [platform, sortKey]);

  const maxViewers = useMemo(
    () => Math.max(...sorted.map((s) => getViewers(s, platform))),
    [sorted, platform]
  );

  const PLATFORM_TABS: { key: Platform; label: string; activeClass: string }[] = [
    { key: 'all', label: '전체', activeClass: 'top-tab-active' },
    { key: 'chzzk', label: '치지직', activeClass: '!border-[#9b5cff] !bg-[#2a1060] !text-[#c49fff]' },
    { key: 'twitch', label: 'Twitch', activeClass: '!border-[#ff70ea] !bg-[#3d0f35] !text-[#ffb3f0]' },
  ];

  const SORT_TABS: { key: SortKey; label: string }[] = [
    { key: 'viewers', label: '시청자 순' },
    { key: 'streams', label: '방송 수 순' },
    { key: 'trend', label: '급상승 순' },
  ];

  return (
    <section className="panel p-5 md:p-6">

      {/* 헤더 */}
      <div className="mb-5">
        <div className="text-lg font-semibold">스트리밍 인기 게임</div>
        <div className="mt-1 text-sm text-white/50">
          치지직(한국) · Twitch(글로벌) 기준 — 어떤 게임이 가장 많이 방송되고, 시청자를 가장 많이 모으는지 확인합니다.
        </div>
      </div>

      {/* 컨트롤 바 */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
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
        <div className="flex gap-2">
          {SORT_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setSortKey(t.key)}
              className={`rounded-xl border px-3 py-1.5 text-xs transition ${
                sortKey === t.key
                  ? 'border-[#8d60ff] bg-[#6e35dc] text-white'
                  : 'border-white/10 bg-white/[0.03] text-white/50 hover:text-white/80'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 범례 (전체 탭) */}
      {platform === 'all' && (
        <div className="mb-5 flex items-center gap-5 text-xs text-white/50">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-5 rounded-full bg-[#9b5cff]" />
            치지직 (한국)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-5 rounded-full bg-[#ff70ea]" />
            Twitch (글로벌)
          </span>
        </div>
      )}

      {/* Top 3 카드 */}
      <TopThreeCards entries={sorted} platform={platform} />

      {/* 전체 순위 목록 */}
      <div className="space-y-2">
        {sorted.map((stat, idx) => {
          const game = getGame(stat.slug);
          const viewers = getViewers(stat, platform);
          const streams = getStreams(stat, platform);

          return (
            <Link
              key={`${platform}-${stat.slug}`}
              href={`/games/${stat.slug}`}
              className="grid grid-cols-[36px_100px_1fr_72px_64px_100px] items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3 transition hover:border-accent/70"
            >
              {/* 순위 번호 */}
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#6e35dc] text-sm font-bold">
                {idx + 1}
              </div>

              {/* 게임 썸네일 */}
              <img
                src={getSteamHeader(game.steamAppId)}
                alt={game.title}
                className="h-14 w-full flex-shrink-0 rounded-lg object-cover"
              />

              {/* 게임 정보 + 바 */}
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{game.title}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {stat.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {/* 시청자 비율 바 */}
                <div className="mt-2">
                  <ViewerBar value={viewers} max={maxViewers} platform={platform} />
                </div>
                {/* 플랫폼 분포 (전체 탭만) */}
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

              {/* 방송 수 */}
              <div className="flex-shrink-0 text-right">
                <div className="mb-0.5 text-[10px] text-white/40">방송</div>
                <div className="text-sm font-bold text-[#ffd6f5]">{streams}</div>
              </div>

              {/* 트렌드 */}
              <div className="flex flex-shrink-0 items-center justify-end">
                <TrendBadge trend={stat.trend} pct={stat.trendPct} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* DB 연결 안내 */}
      <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 text-xs leading-6 text-white/35">
        현재 더미 데이터입니다. DB 연결 시 <code className="text-white/50">STREAM_STATS</code> 배열을
        API fetch로 교체하세요.{' '}
        <code className="text-white/50">chzzkViewers / chzzkStreams</code> →{' '}
        <code className="text-white/50">twitchViewers / twitchStreams</code> 필드를 그대로 사용합니다.
      </div>
    </section>
  );
}
