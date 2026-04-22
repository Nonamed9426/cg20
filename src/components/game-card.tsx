import Link from 'next/link';
import { Game, getSteamHeader } from '@/lib/data';

export function GameCard({ game, compact = false }: { game: Game; compact?: boolean }) {
  return (
    <Link href={`/games/${game.steamAppId}`} className="panel-soft block overflow-hidden p-2 transition hover:-translate-y-1 hover:border-accent/70">
      <img src={getSteamHeader(game.steamAppId)} alt={game.title} className={`w-full rounded-xl object-cover ${compact ? 'h-24' : 'h-32'}`} />
      <div className="p-2">
        <div className="line-clamp-1 text-sm font-semibold text-white">{game.title}</div>
        <div className="mt-1 flex items-center gap-2 text-xs text-white/55">
          <span className="rounded bg-[#1cff8e1a] px-1.5 py-0.5 text-[#73f0b2]">-{game.discountRate}%</span>
          <span>{game.prices.kr}</span>
        </div>
      </div>
    </Link>
  );
}
