'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { games, getRankingEntries, getSteamHeader } from '@/lib/data';
import { StreamerBoard } from '@/components/streamer-board';

const tabs = [
  { key: 'localTop',    label: '국내 top100' },
  { key: 'globalTop',   label: '미국 top100' },
  { key: 'japanTop',    label: '일본 top100' },
  { key: 'streamerTop', label: '스트리머 top10' },
  { key: 'bestWorst',   label: 'best/worst top10' },
  { key: 'genreTop',    label: '장르별 top100' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

const GENRES = ['전체', '액션', 'RPG', '시뮬레이션', 'FPS', '스포츠', '협동', '인디'];
const PAGE_SIZE = 10;

export function RankingBoard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabKey) || 'localTop';
  const initialPage = Math.max(1, Number(searchParams.get('page') || '1'));

  const [active, setActive]             = useState<TabKey>(initialTab);
  const [page, setPage]                 = useState(initialPage);
  const [genre, setGenre]               = useState('전체');
  const [bestWorstSub, setBestWorstSub] = useState<'best' | 'worst'>('best');

  useEffect(() => { setActive(initialTab); }, [initialTab]);
  useEffect(() => { setPage(initialPage); }, [initialPage]);

  // ── 일본 top100 ───────────────────────────────────────────
  const japanEntries = useMemo(() =>
    [...games]
      .sort((a, b) => b.score - a.score)
      .map((g, idx) => ({
        rank: idx + 1,
        game: g,
        scoreText: `종합 점수 ${g.score}.0`,
        badge: g.discountRate > 0 ? `${g.discountRate}% 할인 중` : '할인 없음',
      }))
  , []);

  // ── best top10 (평점 높은 순) ─────────────────────────────
  const bestEntries = useMemo(() =>
    [...games]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((g, idx) => ({
        rank: idx + 1,
        game: g,
        scoreText: `종합 점수 ${g.score}.0`,
        badge: '갓겜 🎮',
      }))
  , []);

  // ── worst top10 (평점 낮은 순) ────────────────────────────
  const worstEntries = useMemo(() =>
    [...games]
      .sort((a, b) => a.score - b.score)
      .slice(0, 10)
      .map((g, idx) => ({
        rank: idx + 1,
        game: g,
        scoreText: `종합 점수 ${g.score}.0`,
        badge: '똥겜 💩',
      }))
  , []);

  // ── 장르별 ────────────────────────────────────────────────
  const genreEntries = useMemo(() => {
    const filtered = genre === '전체'
      ? games
      : games.filter((g) => g.genre.includes(genre) || g.tags.includes(genre));
    return filtered
      .sort((a, b) => b.score - a.score)
      .map((g, idx) => ({
        rank: idx + 1,
        game: g,
        scoreText: `종합 점수 ${g.score}.0`,
        badge: g.discountRate > 0 ? `${g.discountRate}% 할인 중` : '할인 없음',
      }));
  }, [genre]);

  // ── 일반 탭 ──────────────────────────────────────────────
  const allEntries = useMemo(() => {
    if (['genreTop', 'japanTop', 'bestWorst'].includes(active)) return [];
    return getRankingEntries(active as Exclude<TabKey, 'genreTop' | 'japanTop' | 'bestWorst'>);
  }, [active]);

  // ── 현재 탭 엔트리 ────────────────────────────────────────
  const currentEntries = useMemo(() => {
    if (active === 'genreTop')  return genreEntries;
    if (active === 'japanTop')  return japanEntries;
    if (active === 'bestWorst') return bestWorstSub === 'best' ? bestEntries : worstEntries;
    return allEntries;
  }, [active, genreEntries, japanEntries, bestEntries, worstEntries, allEntries, bestWorstSub]);

  const totalPages = Math.ceil(currentEntries.length / PAGE_SIZE);
  const visible = useMemo(() =>
    currentEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  , [currentEntries, page]);

  const syncQuery = (tab: TabKey, nextPage: number) => {
    router.replace(`/rankings?tab=${tab}&page=${nextPage}`);
  };
  const handleTab = (tab: TabKey) => { setActive(tab); setPage(1); syncQuery(tab, 1); };
  const handlePage = (nextPage: number) => { setPage(nextPage); syncQuery(active, nextPage); };

  return (
    <section className="panel p-5 md:p-6">
      {/* 헤더 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">게임 순위</div>
          <div className="mt-1 text-sm text-white/50">
            대한민국은 실구매 선호, 미국은 글로벌 화제성, 스트리머는 치지직/Twitch Top 10 기준 더미 데이터입니다.
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/active" className="rounded-xl border border-[#8d60ff]/30 bg-[#2a1452] px-4 py-2 font-semibold text-white/90 transition hover:border-[#b28cff] hover:text-white">
            활성 게임 추천
          </Link>
          <Link href="/recommend" className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 font-semibold text-white/75 transition hover:border-white/20 hover:text-white">
            추천 받기
          </Link>
        </div>
      </div>

      {/* 메인 탭 */}
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`top-tab ${active === tab.key ? 'top-tab-active' : ''}`}
            onClick={() => handleTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* best/worst 서브 탭 */}
      {active === 'bestWorst' && (
        <div className="mb-5 flex gap-2">
          <button
            onClick={() => { setBestWorstSub('best'); setPage(1); }}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              bestWorstSub === 'best'
                ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-300'
                : 'border-white/10 bg-white/[0.03] text-white/50 hover:text-white/80'
            }`}
          >
            🎮 best — 평점 TOP 10
          </button>
          <button
            onClick={() => { setBestWorstSub('worst'); setPage(1); }}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              bestWorstSub === 'worst'
                ? 'border-red-400/60 bg-red-400/15 text-red-300'
                : 'border-white/10 bg-white/[0.03] text-white/50 hover:text-white/80'
            }`}
          >
            💩 worst — 평점 BOTTOM 10
          </button>
        </div>
      )}

      {/* 장르 필터 */}
      {active === 'genreTop' && (
        <div className="mb-5 flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => { setGenre(g); setPage(1); }}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                genre === g
                  ? 'border-[#ff70ea] bg-[#3d0f35] text-[#ffb3f0]'
                  : 'border-white/10 bg-white/[0.03] text-white/50 hover:text-white/80'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* 스트리머 탭 */}
      {active === 'streamerTop' ? (
        <StreamerBoard />
      ) : (
        <>
          {/* 탭별 안내 메시지 */}
          {active === 'japanTop' && (
            <div className="mb-4 rounded-xl border border-[#c084fc]/20 bg-[#c084fc]/8 px-4 py-2 text-xs text-[#e9d5ff]">
              💡 일본 Steam DB 기준 점수 순위 — JPY 가격 기준 (더미 데이터)
            </div>
          )}
          {active === 'bestWorst' && (
            <div className={`mb-4 rounded-xl border px-4 py-2 text-xs ${
              bestWorstSub === 'best'
                ? 'border-emerald-400/20 bg-emerald-400/8 text-emerald-300'
                : 'border-red-400/20 bg-red-400/8 text-red-300'
            }`}>
              {bestWorstSub === 'best'
                ? '🎮 유저 평점 기준 상위 10개 게임'
                : '💩 유저 평점 기준 하위 10개 게임'}
            </div>
          )}

          {/* 목록 */}
          <div className="space-y-3">
            {visible.map((entry) => (
              <Link
                key={`${active}-${entry.rank}-${entry.game.slug}`}
                href={`/games/${entry.game.steamAppId}`}
                className="grid grid-cols-[42px_132px_1fr_120px] items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3 transition hover:border-accent/70"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${
                  active === 'bestWorst' && bestWorstSub === 'best'  ? 'bg-emerald-600' :
                  active === 'bestWorst' && bestWorstSub === 'worst' ? 'bg-red-700' :
                  'bg-[#6e35dc]'
                }`}>
                  {entry.rank}
                </div>
                <img
                  src={getSteamHeader(entry.game.steamAppId)}
                  alt={entry.game.title}
                  className="h-16 w-full rounded-lg object-cover"
                />
                <div>
                  <div className="text-sm font-semibold">{entry.game.title}</div>
                  <div className="mt-1 text-xs text-white/55">
                    -{entry.game.discountRate}% ·{' '}
                    {active === 'japanTop' ? entry.game.prices.jp : entry.game.prices.kr}
                  </div>
                  <div className="mt-1 text-xs text-[#d3bcff]">{entry.scoreText}</div>
                </div>
                <div className={`justify-self-end rounded-lg border px-3 py-2 text-xs ${
                  active === 'bestWorst' && bestWorstSub === 'best'
                    ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                    : active === 'bestWorst' && bestWorstSub === 'worst'
                    ? 'border-red-400/20 bg-red-400/10 text-red-300'
                    : 'border-white/10 bg-[#29134f] text-white/70'
                }`}>
                  {entry.badge}
                </div>
              </Link>
            ))}
          </div>

          {/* 페이지네이션 — best/worst는 10개 고정이라 숨김 */}
          {active !== 'bestWorst' && totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const num = idx + 1;
                return (
                  <button
                    key={num}
                    onClick={() => handlePage(num)}
                    className={`flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm ${
                      page === num
                        ? 'border-[#8d60ff] bg-[#6e35dc] text-white'
                        : 'border-white/10 bg-white/[0.03] text-white/60'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
