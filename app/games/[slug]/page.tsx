import { AppShell } from '@/components/app-shell';
import { DetailPage } from '@/components/detail-page';
import { games, getGame } from '@/lib/data';

export default function GameDetailPage({ params }: { params: { slug: string } }) {
  const game = getGame(params.slug);
  const related = games.filter((item) => item.slug !== game.slug).slice(0, 3);

  return (
    <AppShell>
      <DetailPage game={game} related={related} />
    </AppShell>
  );
}
