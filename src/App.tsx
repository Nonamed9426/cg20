import { AppShell } from '@/components/app-shell';
import ActivePageClient from '@/components/active-page-client';
import { DetailPage } from '@/components/detail-page';
import { HomePage } from '@/components/home-page';
import InsightPageClient from '@/components/insight-page-client';
import { PredictPage } from '@/components/predict-page';
import { RankingBoard } from '@/components/ranking-board';
import { RecommendPageClient } from '@/components/recommend-page-client';
import { SearchPageClient } from '@/components/search-page-client';
import { RouterProvider, matchPath, useRouterContext } from '@/compat/router';
import { games, resolveGame } from '@/lib/data';

function RoutedPage() {
  const { pathname } = useRouterContext();

  const gameParams = matchPath('/games/:id', pathname);
  if (gameParams) {
    const game = resolveGame(gameParams.id);
    const related = games.filter((item) => item.steamAppId !== game.steamAppId).slice(0, 3);
    return <AppShell><DetailPage game={game} related={related} /></AppShell>;
  }

  const predictParams = matchPath('/predict/:id', pathname);
  if (predictParams) {
    const game = resolveGame(predictParams.id);
    return <AppShell><PredictPage game={game} /></AppShell>;
  }

  switch (pathname) {
    case '/':
      return <AppShell><HomePage /></AppShell>;
    case '/active':
      return <AppShell><ActivePageClient /></AppShell>;
    case '/rankings':
      return <AppShell><RankingBoard /></AppShell>;
    case '/recommend':
      return <AppShell><RecommendPageClient /></AppShell>;
    case '/insight':
      return <AppShell><InsightPageClient /></AppShell>;
    case '/search':
      return <AppShell><SearchPageClient /></AppShell>;
    default:
      return <AppShell><HomePage /></AppShell>;
  }
}

export default function App() {
  return <RouterProvider><RoutedPage /></RouterProvider>;
}
