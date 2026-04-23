'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { API_BASE } from '@/lib/api';

// ── 타입 ──────────────────────────────────────────────────
type SearchGame = {
  gameId:      number;
  name:        string;
  headerImage: string | null;
  isFree:      boolean;
  price:       number;
  genres:      string[];
};

// ── 게임 카드 ──────────────────────────────────────────────
function SearchGameCard({ game }: { game: SearchGame }) {
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
        {!game.isFree && game.price > 0 && (
          <div className="absolute left-2 top-2 rounded-lg bg-emerald-500/90 px-2 py-0.5 text-xs font-bold text-white">
            ₩{game.price.toLocaleString()}
          </div>
        )}
        {game.isFree && (
          <div className="absolute left-2 top-2 rounded-lg bg-[#6e35dc]/90 px-2 py-0.5 text-xs font-bold text-white">
            무료
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="truncate text-sm font-semibold text-white">{game.name}</div>
        <div className="mt-1 truncate text-xs text-white/40">{game.genres.slice(0, 3).join(' · ')}</div>
      </div>
    </Link>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────
export function SearchPageClient() {
  const params = useSearchParams();

  const [keyword, setKeyword]         = useState(params.get('q') ?? '');
  const [genre, setGenre]             = useState('전체');
  const [genres, setGenres]           = useState<string[]>(['전체']);
  const [results, setResults]         = useState<SearchGame[]>([]);
  const [loading, setLoading]         = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // ── 장르 목록 로드 ────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/search/genres`)
      .then((r) => r.json())
      .then((data: string[]) => setGenres(data))
      .catch(() => {});
  }, []);

  // ── 검색 API 호출 ─────────────────────────────────────────
  const search = useCallback(async (q: string, g: string) => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams({ limit: '60' });
      if (q.trim()) searchParams.set('q', q.trim());
      if (g !== '전체') searchParams.set('genre', g);

      const res  = await fetch(`${API_BASE}/search?${searchParams.toString()}`);
      const json = await res.json();

      if (json.status === 'success') {
        setResults(json.data ?? []);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  // ── 초기 로드 ─────────────────────────────────────────────
  useEffect(() => {
    search(keyword, genre);
  }, []);

  // ── 검색어/장르 변경 시 디바운스 검색 ─────────────────────
  useEffect(() => {
    if (initialLoad) return;
    const timer = setTimeout(() => search(keyword, genre), 400);
    return () => clearTimeout(timer);
  }, [keyword, genre]);

  return (
    <section className="space-y-6">
      {/* 검색창 */}
      <div className="panel p-5 md:p-6">
        <div className="mb-4 section-title">
          검색 {keyword ? `· ${keyword}` : ''}
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_180px]">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="게임명, 태그, 장르 검색"
            className="h-12 rounded-xl border border-white/10 bg-[#1a1033] px-4 text-sm outline-none ring-0 placeholder:text-white/30"
          />
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="h-12 rounded-xl border border-white/10 bg-[#1a1033] px-4 text-sm outline-none"
          >
            {genres.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {/* 결과 수 */}
      {!loading && !initialLoad && (
        <div className="text-sm text-white/40">
          {results.length > 0
            ? `${results.length}개 게임 검색됨`
            : keyword || genre !== '전체' ? '검색 결과가 없습니다.' : ''}
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
          {results.map((game) => (
            <SearchGameCard key={game.gameId} game={game} />
          ))}
        </div>
      )}
    </section>
  );
}
