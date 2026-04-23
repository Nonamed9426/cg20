'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { games, getSteamHeader } from '@/lib/data';
import { StreamerBoard } from '@/components/streamer-board';
import { API_BASE } from '@/lib/api';

const tabs = [
  { key: 'localTop',    label: '국내 top100' },
  { key: 'globalTop',   label: '미국 top100' },
  { key: 'japanTop',    label: '일본 top100' },
  { key: 'streamerTop', label: '스트리머 top10' },
  { key: 'bestWorst',   label: 'best/worst top10' },
  { key: 'genreTop',    label: '장르별 top100' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

const TAB_TO_COUNTRY: Partial<Record<TabKey, string>> = {
  localTop:  'KR',
  globalTop: 'US',
  japanTop:  'JP',
};

const GENRES = ['전체', '액션', 'RPG', '시뮬레이션', 'FPS', '스포츠', '협동', '인디'];
const PAGE_SIZE = 10;

// ── 타입 ──────────────────────────────────────────────────
type RankEntry = {
  rank: number;
  steamAppId: number;
  title: string;
  headerImage: string | null;
  scoreText: string;
  badge: string;
  priceKr: string;
  priceJp: string;
  discountRate: number;
};

// 백엔드 API 응답 타입
type ApiRankItem = {
  rank: number;
  appid: number;
  name: string;
  headerImage: string | null;
};

export function RankingBoard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab  = (searchParams.get('tab') as TabKey) || 'localTop';
  const initialPage = Math.max(1, Number(searchParams.get('page') || '1'));

  const [active, setActive]             = useState<TabKey>(initialTab);
  const [page, setPage]                 = useState(initialPage);
  const [genre, setGenre]               = useState('전체');
  const [bestWorstSub, setBestWorstSub] = useState<'best' | 'worst'>('best');

  const [apiEntries, setApiEntries]     = useState<RankEntry[]>([]);
  const [apiLoading, setApiLoading]     = useState(false);
  const [apiError, setApiError]         = useState(false);
  const [apiUpdatedAt, setApiUpdatedAt] = useState('');

  useEffect(() => { setActive(initialTab); }, [initialTab]);
  useEffect(() => { setPage(initialPage); }, [initialPage]);

  // ── API 호출 ──────────────────────────────────────────────
  const fetchRanking = useCallback(async (tab: TabKey) => {
    const country = TAB_TO_COUNTRY[tab];
    if (!country) return;

    setApiLoading(true);
    setApiError(false);
    setApiEntries([]);

    try {
      const res  = await fetch(`${API_BASE}/steam-ranks/${country}/1/100`);
      const json = await res.json();

      if (json.status === 'success' && Array.isArray(json.data)) {
        // 💡 API가 {rank, appid, name, headerImage} 객체 배열 반환
        const entries: RankEntry[] = json.data.map((item: ApiRankItem) => {
          const dummy = games.find((g) => g.steamAppId === item.appid);
          return {
            rank:         item.rank,
            steamAppId:   item.appid,
            title:        item.name,
            headerImage:  item.headerImage,
            scoreText:    dummy ? `종합 점수 ${dummy.score}.0` : '-',
            badge:        dummy?.discountRate ? `${dummy.discountRate}% 할인 중` : '할인 없음',
            priceKr:      dummy?.prices.kr ?? '-',
            priceJp:      dummy?.prices.jp ?? '-',
            discountRate: dummy?.discountRate ?? 0,
          };
        });
        setApiEntries(entries);
        setApiUpdatedAt(json.updated_at ?? '');
      } else {
        setApiError(true);
      }
    } catch {
      setApiError(true);
    } finally {
      setApiLoading(false);
    }
  }, []);

  useEffect(() => {
    if (TAB_TO_COUNTRY[active]) fetchRanking(active);
  }, [active, fetchRanking]);

  // ── best/worst (더미) ──────────────────────────────────────
  const bestEntries = useMemo(() =>
    [...games].sort((a, b) => b.score - a.score).slice(0, 10)
      .map((g, idx) => ({
        rank: idx + 1, steamAppId: g.steamAppId, title: g.title, headerImage: null,
        scoreText: `종합 점수 ${g.score}.0`, badge: '갓겜 🎮',
        priceKr: g.prices.kr, priceJp: g.prices.jp, discountRate: g.discountRate,
      })), []);

  const worstEntries = useMemo(() =>
    [...games].sort((a, b) => a.score - b.score).slice(0, 10)
      .map((g, idx) => ({
        rank: idx + 1, steamAppId: g.steamAppId, title: g.title, headerImage: null,
        scoreText: `종합 점수 ${g.score}.0`, badge: '똥겜 💩',
        priceKr: g.prices.kr, priceJp: g.prices.jp, discountRate: g.discountRate,
      })), []);

  const genreEntries = useMemo(() => {
    const filtered = genre === '전체'
      ? games
      : games.filter((g) => g.genre.includes(genre) || g.tags.includes(genre));
    return filtered.sort((a, b) => b.score - a.score).map((g, idx) => ({
      rank: idx + 1, steamAppId: g.steamAppId, title: g.title, headerImage: null,
      scoreText: `종합 점수 ${g.score}.0`,
      badge: g.discountRate > 0 ? `${g.discountRate}% 할인 중` : '할인 없음',
      priceKr: g.prices.kr, priceJp: g.prices.jp, discountRate: g.discountRate,
    }));
  }, [genre]);

  const currentEntries = useMemo(() => {
    if (TAB_TO_COUNTRY[active])      return apiEntries;
    if (active === 'genreTop')       return genreEntries;
    if (active === 'bestWorst')      return bestWorstSub === 'best' ? bestEntries : worstEntries;
    return [];
  }, [active, apiEntries, genreEntries, bestEntries, worstEntries, bestWorstSub]);

  const totalPages = Math.ceil(currentEntries.length / PAGE_SIZE);
  const visible = useMemo(() =>
    currentEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  , [currentEntries, page]);

  const syncQuery = (tab: TabKey, nextPage: number) => router.replace(`/rankings?tab=${tab}&page=${nextPage}`);
  const handleTab  = (tab: TabKey) => { setActive(tab); setPage(1); syncQuery(tab, 1); };
  const handlePage = (n: number)   => { setPage(n); syncQuery(active, n); };

  const isApiTab = !!TAB_TO_COUNTRY[active];

  return (
    <section className="panel p-5 md:p-6">
      {/* 헤더 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">게임 순위</div>
          <div className="mt-1 text-sm text-white/50">
            {isApiTab && apiUpdatedAt
              ? `업데이트: ${apiUpdatedAt}`
              : '대한민국은 실구매 선호, 미국은 글로벌 화제성, 스트리머는 치지직/Twitch Top 10 기준입니다.'}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/active" className="rounded-xl border border-[#8d60ff]/30 bg-[#2a1452] px-4 py-2 font-semibold text-white/90 transition hover:border-[#b28cff] hover:text-white">활성 게임 추천</Link>
          <Link href="/recommend" className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 font-semibold text-white/75 transition hover:border-white/20 hover:text-white">추천 받기</Link>
        </div>
      </div>

      {/* 메인 탭 */}
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button key={tab.key} className={`top-tab ${active === tab.key ? 'top-tab-active' : ''}`} onClick={() => handleTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* best/worst 서브 탭 */}
      {active === 'bestWorst' && (
        <div className="mb-5 flex gap-2">
          <button onClick={() => { setBestWorstSub('best'); setPage(1); }}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${bestWorstSub === 'best' ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-300' : 'border-white/10 bg-white/[0.03] text-white/50 hover:text-white/80'}`}>
            🎮 best — 평점 TOP 10
          </button>
          <button onClick={() => { setBestWorstSub('worst'); setPage(1); }}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${bestWorstSub === 'worst' ? 'border-red-400/60 bg-red-400/15 text-red-300' : 'border-white/10 bg-white/[0.03] text-white/50 hover:text-white/80'}`}>
            💩 worst — 평점 BOTTOM 10
          </button>
        </div>
      )}

      {/* 장르 필터 */}
      {active === 'genreTop' && (
        <div className="mb-5 flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <button key={g} onClick={() => { setGenre(g); setPage(1); }}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${genre === g ? 'border-[#ff70ea] bg-[#3d0f35] text-[#ffb3f0]' : 'border-white/10 bg-white/[0.03] text-white/50 hover:text-white/80'}`}>
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
          {isApiTab && apiLoading && (
            <div className="flex h-40 items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#c084fc] border-t-transparent" />
            </div>
          )}
          {isApiTab && apiError && (
            <div className="mb-4 rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-300">
              ⚠️ 랭킹 데이터를 불러오지 못했습니다.
              <button onClick={() => fetchRanking(active)} className="ml-3 underline">재시도</button>
            </div>
          )}
          {!apiLoading && !apiError && active === 'bestWorst' && (
            <div className={`mb-4 rounded-xl border px-4 py-2 text-xs ${bestWorstSub === 'best' ? 'border-emerald-400/20 bg-emerald-400/8 text-emerald-300' : 'border-red-400/20 bg-red-400/8 text-red-300'}`}>
              {bestWorstSub === 'best' ? '🎮 유저 평점 기준 상위 10개 게임' : '💩 유저 평점 기준 하위 10개 게임'}
            </div>
          )}

          {!apiLoading && (
            <div className="space-y-3">
              {visible.map((entry) => (
                <Link
                  key={`${active}-${entry.rank}-${entry.steamAppId}`}
                  href={`/games/${entry.steamAppId}`}
                  className="grid grid-cols-[42px_132px_1fr_120px] items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3 transition hover:border-accent/70"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${
                    active === 'bestWorst' && bestWorstSub === 'best'  ? 'bg-emerald-600' :
                    active === 'bestWorst' && bestWorstSub === 'worst' ? 'bg-red-700' : 'bg-[#6e35dc]'
                  }`}>{entry.rank}</div>

                  {/* 썸네일 — API headerImage 우선, 없으면 Steam CDN fallback */}
                  <div className="relative h-16 w-full overflow-hidden rounded-lg bg-[#2a124d]">
                    <img
                      src={entry.headerImage ?? getSteamHeader(entry.steamAppId)}
                      alt={entry.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        if (!img.src.includes('cdn.akamai')) {
                          img.src = getSteamHeader(entry.steamAppId);
                        } else {
                          img.style.display = 'none';
                        }
                      }}
                    />
                    <div className="absolute inset-0 -z-10 animate-pulse bg-[#2a124d]" />
                  </div>

                  <div>
                    <div className="text-sm font-semibold">
                      {entry.title === '정보 수집 중...' ? (
                        <span className="inline-block h-4 w-32 animate-pulse rounded bg-white/10" />
                      ) : entry.title}
                    </div>
                    <div className="mt-1 text-xs text-white/55">
                      {entry.discountRate > 0 ? `-${entry.discountRate}%` : ''}{' '}
                      {active === 'japanTop' ? entry.priceJp : entry.priceKr}
                    </div>
                    <div className="mt-1 text-xs text-[#d3bcff]">{entry.scoreText}</div>
                  </div>

                  <div className={`justify-self-end rounded-lg border px-3 py-2 text-xs ${
                    active === 'bestWorst' && bestWorstSub === 'best'  ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' :
                    active === 'bestWorst' && bestWorstSub === 'worst' ? 'border-red-400/20 bg-red-400/10 text-red-300' :
                    'border-white/10 bg-[#29134f] text-white/70'
                  }`}>{entry.badge}</div>
                </Link>
              ))}
            </div>
          )}

          {!apiLoading && active !== 'bestWorst' && totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const num = idx + 1;
                return (
                  <button key={num} onClick={() => handlePage(num)}
                    className={`flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm ${
                      page === num ? 'border-[#8d60ff] bg-[#6e35dc] text-white' : 'border-white/10 bg-white/[0.03] text-white/60'
                    }`}>{num}</button>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
