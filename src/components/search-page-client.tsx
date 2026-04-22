'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { games } from '@/lib/data';
import { GameCard } from './game-card';

export function SearchPageClient() {
  const params = useSearchParams();
  const [keyword, setKeyword] = useState('');
  const [genre, setGenre] = useState('전체');

  useEffect(() => {
    setKeyword(params.get('q') ?? '');
  }, [params]);

  const filtered = useMemo(() => {
    return games.filter((game) => {
      const matchesKeyword = !keyword || `${game.title} ${game.tags.join(' ')} ${game.genre.join(' ')}`.toLowerCase().includes(keyword.toLowerCase());
      const matchesGenre = genre === '전체' || game.genre.includes(genre);
      return matchesKeyword && matchesGenre;
    });
  }, [keyword, genre]);

  return (
    <section className="space-y-6">
      <div className="panel p-5 md:p-6">
        <div className="mb-4 section-title">검색 {keyword ? `· ${keyword}` : ''}</div>
        <div className="grid gap-4 md:grid-cols-[1fr_180px]">
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="게임명, 태그, 장르 검색" className="h-12 rounded-xl border border-white/10 bg-[#1a1033] px-4 text-sm outline-none ring-0 placeholder:text-white/30" />
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className="h-12 rounded-xl border border-white/10 bg-[#1a1033] px-4 text-sm outline-none">
            {['전체', '시뮬레이션', '농장', '액션', '액션 RPG', '스포츠', 'PvPvE'].map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {filtered.map((game) => <GameCard key={game.slug} game={game} />)}
      </div>
    </section>
  );
}
