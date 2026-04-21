import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Game, getSteamHeader, getSteamStoreUrl, statPanels } from '@/lib/data';
import { GameCard } from './game-card';

const accentClass = {
  purple: 'from-[#9f6fff] to-[#5d33d6]',
  pink: 'from-[#ff73e2] to-[#b93cff]',
  cyan: 'from-[#57f0ff] to-[#2a7fff]',
  amber: 'from-[#ffd76d] to-[#ff8a3d]',
} as const;

export function DetailPage({ game, related }: { game: Game; related: Game[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.38fr_0.88fr]">
      <div className="space-y-6">
        <section className="panel overflow-hidden p-5 md:p-6">
          <div className="mb-3 flex items-center justify-between text-xs text-white/50">
            <span>상세 분석 · Steam game detail</span>
            <span>{game.genre.join(' · ')}</span>
          </div>
          <div className="grid gap-5 lg:grid-cols-[1.35fr_0.78fr]">
            <div>
              <img src={getSteamHeader(game.steamAppId)} alt={game.title} className="h-[260px] w-full rounded-[22px] object-cover shadow-neon" />
              <div className="mt-3 grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-xl border border-white/10 bg-[#2a124d]" />)}
              </div>
              <div className="mt-4 panel-soft p-4">
                <div className="mb-3 flex items-center gap-3 border-b border-white/8 pb-3 text-sm text-white/65">
                  <span className="text-white">게임 소개</span>
                  <span>리뷰 요약</span>
                  <span>구매 타이밍</span>
                </div>
                <p className="text-sm leading-6 text-white/72">{game.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {game.tags.map((tag) => <span key={tag} className="pill">#{tag}</span>)}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-[24px] border border-line/60 bg-[#241047] p-5 shadow-glow">
                <div className="text-emerald-400 text-3xl font-bold">-{game.discountRate}%</div>
                <div className="mt-1 text-2xl font-bold text-mint">{game.prices.kr}</div>
                <div className="mt-1 text-sm text-white/35 line-through">₩{game.originalKRW.toLocaleString()}</div>
                <div className="mt-2 text-sm text-white/70">{game.reviewLabel} · {game.score}점</div>
                <div className="mt-4 flex gap-2">
                  <a href={getSteamStoreUrl(game.steamAppId)} target="_blank" rel="noreferrer" className="flex-1 rounded-xl bg-[#55d58a] px-4 py-3 text-center text-sm font-semibold text-black">지금 구매</a>
                  <Link href={`/predict/${game.slug}`} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">할인 예측</Link>
                </div>
                <div className="mt-4 space-y-2 text-xs text-white/55">
                  <div>플랫폼: {game.platforms.join(', ')}</div>
                  <div>평균 플레이타임: {game.playtime}</div>
                  <div>스트리밍 지표: {game.streamStatus}</div>
                </div>
              </div>
              <div className="panel-soft p-4">
                <div className="mb-3 text-sm font-semibold">환율</div>
                <div className="space-y-2 text-sm text-white/65">
                  <div className="flex justify-between"><span>한화</span><span className="font-semibold text-mint">{game.prices.kr}</span></div>
                  <div className="flex justify-between"><span>엔화</span><span>{game.prices.jp}</span></div>
                  <div className="flex justify-between"><span>달러</span><span>{game.prices.us}</span></div>
                </div>
              </div>
              <div className="panel-soft p-4">
                <div className="mb-3 text-sm font-semibold">게임 사도 되는 이유?</div>
                <div className="space-y-3">
                  {game.reason.map((item, idx) => (
                    <div key={item}>
                      <div className="mb-1 flex items-center justify-between text-xs text-white/60"><span>{item}</span><span>{90 - idx * 10}%</span></div>
                      <div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-gradient-to-r from-[#64ffc8] to-[#ff70ea]" style={{ width: `${90 - idx * 10}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="panel p-5 md:p-6">
            <div className="mb-4 section-title">추천 이유 요약</div>
            <div className="mb-4 flex flex-wrap gap-2">
              {['태그', '장르', '최근 업데이트', '평점', '할인 정보'].map((t, i) => (
                <span key={t} className={`rounded-full px-3 py-1 text-xs ${i === 0 ? 'bg-[#52d88e1a] text-[#73f0b2]' : 'bg-white/5 text-white/60'}`}>{t}</span>
              ))}
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-[#2f4879] p-4 text-sm text-white/80">
              지금 사도 무난한 편입니다. 최근 업데이트와 높은 사용자 평가, 긴 플레이타임 덕분에 할인 폭이 크지 않아도 만족도가 높습니다.
            </div>
          </div>
          <div className="panel p-5 md:p-6">
            <div className="mb-4 section-title">할인 비교 후 추천</div>
            <div className="space-y-2 text-sm text-white/65">
              <div className="flex justify-between"><span>한화</span><span className="font-semibold text-mint">{game.prices.kr}</span></div>
              <div className="flex justify-between"><span>일본</span><span>{game.prices.jp}</span></div>
              <div className="flex justify-between"><span>미국</span><span>{game.prices.us}</span></div>
            </div>
            <p className="mt-4 text-xs leading-6 text-white/50">환율 기반 비교에서는 한국 가격이 가장 직관적이며, 시즌성 할인 주기도 비교적 뚜렷합니다. 고정 환율 기준으로 계산된 UI 자리입니다.</p>
          </div>
        </section>

        <section className="panel p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="section-title">게임 소식</div>
            <span className="text-xs text-white/45">more</span>
          </div>
          <div className="space-y-4">
            {game.news.map((news, idx) => (
              <div key={news.title} className="grid gap-4 rounded-2xl border border-white/6 bg-white/[0.03] p-3 md:grid-cols-[180px_1fr]">
                <div className={`h-[96px] rounded-xl ${idx % 2 === 0 ? 'bg-[#5a3f2d]' : 'bg-[#7b6a4a]'}`} />
                <div>
                  <div className="text-sm text-white/45">{news.date}</div>
                  <div className="mt-1 text-base font-semibold">{news.title}</div>
                  <p className="mt-2 text-sm leading-6 text-white/65">{news.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="section-title">비슷한 게임 추천</div>
            <span className="text-xs text-white/50">태그 기반</span>
          </div>
          <div className="space-y-4">
            {related.map((item) => <GameCard key={item.slug} game={item} compact />)}
          </div>
        </section>

        <section className="panel p-5">
          <div className="mb-4 section-title">통계 요약</div>
          <div className="space-y-4">
            {statPanels.map((panel) => (
              <div key={panel.title} className="rounded-2xl border border-white/8 bg-[#241141] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">{panel.title}</h3>
                  <button className="text-xs text-white/45">더보기 〉</button>
                </div>
                <div className="mb-3 h-14 rounded-lg bg-[#1a0d2f] p-2">
                  <div className="flex h-full items-end gap-2">
                    {panel.bars.map((bar, i) => (
                      <div key={i} className={`flex-1 rounded-t-md bg-gradient-to-t ${accentClass[panel.accent]}`} style={{ height: `${bar}%` }} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>{panel.leftLabel}</span>
                  <span>{panel.rightLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-5">
          <div className="mb-4 section-title">바로가기</div>
          <div className="space-y-3 text-sm text-white/70">
            <Link href={`/predict/${game.slug}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#1d0d39] px-4 py-3">할인예측 페이지 <ExternalLink className="h-4 w-4" /></Link>
            <Link href="/rankings" className="flex items-center justify-between rounded-xl border border-white/10 bg-[#1d0d39] px-4 py-3">게임 순위 페이지 <ExternalLink className="h-4 w-4" /></Link>
            <Link href="/recommend" className="flex items-center justify-between rounded-xl border border-white/10 bg-[#1d0d39] px-4 py-3">추천 결과 페이지 <ExternalLink className="h-4 w-4" /></Link>
          </div>
        </section>
      </aside>
    </div>
  );
}
