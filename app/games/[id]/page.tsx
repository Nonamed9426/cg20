import { AppShell } from '@/components/app-shell';
import { DetailPage } from '@/components/detail-page';
import { games, getGameById } from '@/lib/data';

export default function GameDetailPage({ params }: { params: { id: string } }) {
  const game = getGameById(Number(params.id));
  const related = games.filter((item) => item.steamAppId !== game.steamAppId).slice(0, 3);

  return (
    <AppShell>
      <DetailPage game={game} related={related} />
    </AppShell>
  );
}