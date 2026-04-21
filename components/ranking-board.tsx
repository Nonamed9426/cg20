'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getRankingEntries, getSteamHeader } from '@/lib/data';
import { StreamerBoard } from '@/components/streamer-board';

const tabs = [
  { key: 'localTop', label: '국내 top100' },
  { key: 'globalTop', label: '미국 top100' },
  { key: 'streamerTop', label: '스트리머 top100' },
  { key: 'bestWorst', label: 'best/worst top100' },
] as const;

const PAGE_SIZE = 10;

export function RankingBoard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as (typeof tabs)[number]['key']) || 'localTop';
  const initialPage = Math.max(1, Number(searchParams.get('page') || '1'));

  const [active, setActive] = useState<(typeof tabs)[number]['key']>(initialTab);
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    setActive(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  const allEntries = useMemo(() => getRankingEntries(active), [active]);
  const totalPages = Math.ceil(allEntries.length / PAGE_SIZE);
  const visible = useMemo(() => allEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [allEntries, page]);

  const syncQuery = (tab: (typeof tabs)[number]['key'], nextPage: number) => {
    router.replace(`/rankings?tab=${tab}&page=${nextPage}`);
  };

  const handleTab = (tab: (typeof tabs)[number]['key']) => {
    setActive(tab);
    setPage(1);
    syncQuery(tab, 1);
  };

  const handlePage = (nextPage: number) => {
    setPage(nextPage);
    syncQuery(active, nextPage);
  };

  return (
    <section className="panel p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">게임 순위</div>
          <div className="mt-1 text-sm text-white/50">
            대한민국은 실구매 선호, 미국은 글로벌 화제성, 스트리머는 방송 노출을 반영한 더미 데이터입니다.
          </div>
        </div>
      </div>

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

      {/* streamerTop 탭이면 StreamerBoard, 나머지는 기존 목록 */}
      {active === 'streamerTop' ? (
        <StreamerBoard />
      ) : (
        <>
          <div className="space-y-3">
            {visible.map((entry) => (
              <Link
                key={`${active}-${entry.rank}-${entry.game.slug}`}
                href={`/games/${entry.game.slug}`}
                className="grid grid-cols-[42px_132px_1fr_120px] items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3 transition hover:border-accent/70"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6e35dc] text-sm font-bold">
                  {entry.rank}
                </div>
                <img src={getSteamHeader(entry.game.steamAppId)} alt={entry.game.title} className="h-16 w-full rounded-lg object-cover" />
                <div>
                  <div className="text-sm font-semibold">{entry.game.title}</div>
                  <div className="mt-1 text-xs text-white/55">-{entry.game.discountRate}% · {entry.game.prices.kr}</div>
                  <div className="mt-1 text-xs text-[#d3bcff]">{entry.scoreText}</div>
                </div>
                <div className="justify-self-end rounded-lg border border-white/10 bg-[#29134f] px-3 py-2 text-xs text-white/70">
                  {entry.badge}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const num = idx + 1;
              return (
                <button
                  key={num}
                  onClick={() => handlePage(num)}
                  className={`flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm ${
                    page === num ? 'border-[#8d60ff] bg-[#6e35dc] text-white' : 'border-white/10 bg-white/[0.03] text-white/60'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
