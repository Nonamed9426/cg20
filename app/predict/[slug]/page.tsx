import { AppShell } from '@/components/app-shell';
import { PredictPage } from '@/components/predict-page';
import { games, getGame } from '@/lib/data';

export default function PredictGamePage({ params }: { params: { slug: string } }) {
  const game = getGame(params.slug);
  const related = games.filter((item) => item.slug !== game.slug).slice(0, 3);

  return (
    <AppShell>
      <PredictPage game={game} related={related} />
    </AppShell>
  );
}
