'use client';

import { useMemo, useState } from 'react';
import { games } from '@/lib/data';
import { GameCard } from './game-card';

export function RecommendPageClient() {
  const [budget, setBudget] = useState(30000);
  const [tag, setTag] = useState('힐링');

  const recommended = useMemo(() => {
    return games
      .filter((game) => game.priceKRW <= budget && (tag === '전체' || game.tags.includes(tag) || game.genre.includes(tag)))
      .sort((a, b) => b.score - a.score || b.discountRate - a.discountRate);
  }, [budget, tag]);

  return (
    <section className="space-y-6">
      <div className="panel p-5 md:p-6">
        <div className="mb-4 section-title">게임 추천 페이지</div>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="panel-soft p-4">
            <label className="mb-3 block text-sm text-white/70">예산: ₩{budget.toLocaleString()}</label>
            <input type="range" min="10000" max="70000" step="1000" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full" />
          </div>
          <div className="panel-soft p-4">
            <label className="mb-3 block text-sm text-white/70">태그 / 장르</label>
            <select value={tag} onChange={(e) => setTag(e.target.value)} className="h-12 w-full rounded-xl border border-white/10 bg-[#1a1033] px-4 text-sm outline-none">
              {['전체', '힐링', '농장', '협동', '액션', '스포츠', '소울라이크', 'PvPvE'].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {recommended.map((game) => <GameCard key={game.slug} game={game} />)}
      </div>
    </section>
  );
}
