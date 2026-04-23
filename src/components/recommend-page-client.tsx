'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { API_BASE } from '@/lib/api';

// ── 타입 ──────────────────────────────────────────────────
type RecommendGame = {
  gameId:      number;
  name:        string;
  headerImage: string | null;
  isFree:      boolean;
  price:       number;
  genres:      string[];
};

// ── 게임 카드 ──────────────────────────────────────────────
function RecommendGameCard({ game }: { game: RecommendGame }) {
  return (
    <Link
      href={`/games/${game.gameId}`}
      className="group overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] transition hover:border-[#8d60ff]/60"
    >
      <div className="relative h-40 w-full overflow-hidden bg-[#2a124d]">
        <img
          src={game.headerImage ?? `https://cdn.akamai.steamstatic.com/steam/apps/${game.gameId}/header.jpg`}
          alt={game.name}
          className="h-full w-full object-cover transition group-hover:scale-105"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0 -z-10 animate-pulse bg-[#2a124d]" />
        {game.isFree ? (
          <div className="absolute left-2 top-2 rounded-lg bg-[#6e35dc]/90 px-2 py-0.5 text-xs font-bold text-white">
            무료
          </div>
        ) : game.price > 0 ? (
          <div className="absolute left-2 top-2 rounded-lg bg-emerald-500/90 px-2 py-0.5 text-xs font-bold text-white">
            ₩{game.price.toLocaleString()}
          </div>
        ) : null}
      </div>
      <div className="p-3">
        <div className="truncate text-sm font-semibold text-white">{game.name}</div>
        <div className="mt-1 truncate text-xs text-white/40">{game.genres.slice(0, 3).join(' · ')}</div>
      </div>
    </Link>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────
export function RecommendPageClient() {
  const [budget, setBudget]   = useState(30000);
  const [genre, setGenre]     = useState('전체');
  const [genres, setGenres]   = useState<string[]>(['전체']);
  const [results, setResults] = useState<RecommendGame[]>([]);
  const [loading, setLoading] = useState(false);

  // ── 장르 목록 로드 ────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/search/genres`)
      .then((r) => r.json())
      .then((data: string[]) => setGenres(data))
      .catch(() => {});
  }, []);

  // ── 추천 API 호출 ─────────────────────────────────────────
  const fetchRecommend = useCallback(async (g: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '60' });
      if (g !== '전체') params.set('genre', g);

      const res  = await fetch(`${API_BASE}/search?${params.toString()}`);
      const json = await res.json();

      if (json.status === 'success') {
        // 예산 필터는 프론트에서 처리 (API에 price 필터 없음)
        setResults(json.data ?? []);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── 초기 로드 + 장르 변경 시 ──────────────────────────────
  useEffect(() => {
    fetchRecommend(genre);
  }, [genre]);

  // ── 예산 필터 (프론트에서 처리) ───────────────────────────
  const filtered = results.filter((game) =>
    game.isFree || game.price === 0 || game.price <= budget
  );

  return (
    <section className="space-y-6">
      <div className="panel p-5 md:p-6">
        <div className="mb-4 section-title">게임 추천 페이지</div>
        <div className="grid gap-5 md:grid-cols-2">
          {/* 예산 슬라이더 */}
          <div className="panel-soft p-4">
            <label className="mb-3 block text-sm text-white/70">
              예산: ₩{budget.toLocaleString()}
            </label>
            <input
              type="range"
              min="5000"
              max="100000"
              step="1000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full"
            />
            <div className="mt-1 flex justify-between text-xs text-white/30">
              <span>₩5,000</span>
              <span>₩100,000</span>
            </div>
          </div>

          {/* 장르 선택 */}
          <div className="panel-soft p-4">
            <label className="mb-3 block text-sm text-white/70">태그 / 장르</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="h-12 w-full rounded-xl border border-white/10 bg-[#1a1033] px-4 text-sm outline-none"
            >
              {genres.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 결과 수 */}
      {!loading && (
        <div className="text-sm text-white/40">
          {filtered.length > 0
            ? `예산 ₩${budget.toLocaleString()} 이하 · ${filtered.length}개 게임`
            : '조건에 맞는 게임이 없습니다.'}
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div className="flex h-40 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#c084fc] border-t-transparent" />
        </div>
      )}

      {/* 결과 그리드 */}
      {!loading && (
        <div className="grid gap-4 md:grid-cols-3">
          {filtered.map((game) => (
            <RecommendGameCard key={game.gameId} game={game} />
          ))}
        </div>
      )}
    </section>
  );
}
