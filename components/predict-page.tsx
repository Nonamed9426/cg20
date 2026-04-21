import Link from 'next/link';
import { CalendarDays, ChevronRight, ShoppingCart } from 'lucide-react';
import { Game, getSteamHeader, statPanels } from '@/lib/data';
import { GameCard } from './game-card';

const accentClass = {
  purple: 'from-[#9f6fff] to-[#5d33d6]',
  pink: 'from-[#ff73e2] to-[#b93cff]',
  cyan: 'from-[#57f0ff] to-[#2a7fff]',
  amber: 'from-[#ffd76d] to-[#ff8a3d]',
} as const;

export function PredictPage({ game, related }: { game: Game; related: Game[] }) {
  return (
    <div className="space-y-6">
      <section className="panel overflow-hidden p-5 md:p-6">
        <div className="mb-3 flex items-center justify-between text-xs text-white/50">
          <span>예상 할인 타이밍 · Steam analysis</span>
          <span>{new Date().toLocaleDateString('ko-KR')}</span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.78fr]">
          <div>
            <img
              src={getSteamHeader(game.steamAppId)}
              alt={game.title}
              className="h-[260px] w-full rounded-[22px] object-cover shadow-neon"
            />

            <div className="mt-4 panel-soft p-4">
              <div className="mb-3 flex items-center gap-3 border-b border-white/8 pb-3 text-sm text-white/65">
                <span className="text-white">간단 리뷰와 구매 포인트</span>
              </div>

              <p className="text-sm leading-6 text-white/72">{game.summary}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {game.tags.map((tag) => (
                  <span key={tag} className="pill">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="panel-soft p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <CalendarDays className="h-4 w-4 text-accent2" /> 추천 이유 요약
                </div>
                <div className="space-y-2 text-sm text-white/68">
                  {game.reason.map((reason) => (
                    <div key={reason} className="rounded-xl border border-white/6 bg-white/[0.03] px-3 py-2">
                      {reason}
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel-soft p-4">
                <div className="mb-3 text-sm font-semibold">환율 비교 후 추천</div>
                <div className="space-y-3 text-sm text-white/70">
                  <div className="flex justify-between"><span>한화</span><strong className="text-mint">{game.prices.kr}</strong></div>
                  <div className="flex justify-between"><span>일본</span><strong>{game.prices.jp}</strong></div>
                  <div className="flex justify-between"><span>미국</span><strong>{game.prices.us}</strong></div>
                  <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs text-emerald-200">
                    현재 기준으로 한국 가격 메리트가 크고, 시즌 이벤트성 할인 확률도 높아 지금 구매 또는 1주일 내 할인 확인 전략이 적합합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-line/60 bg-[#241047] p-5 shadow-glow">
              <div className="text-3xl font-bold text-emerald-400">-{game.discountRate}%</div>
              <div className="mt-1 text-2xl font-bold text-mint">{game.prices.kr}</div>
              <div className="mt-1 text-sm text-white/35 line-through">₩{game.originalKRW.toLocaleString()}</div>
              <div className="mt-2 text-sm text-white/70">{game.reviewLabel}</div>

              <div className="mt-4 flex gap-2">
                <Link href={`/games/${game.slug}`} className="flex-1 rounded-xl bg-[#55d58a] px-4 py-3 text-center text-sm font-semibold text-black">상세페이지 보기</Link>
                <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">찜</button>
              </div>

              <div className="mt-4 space-y-2 text-xs text-white/55">
                <div>예상 할인 폭: -30% ~ -50%</div>
                <div>업데이트 영향: {game.updateStatus}</div>
                <div>추천 우선순위: 중상</div>
              </div>
            </div>

            <div className="panel-soft p-4">
              <div className="mb-3 text-sm font-semibold">예상 할인 캘린더</div>

              <div className="rounded-[28px] border border-[#7b55d0]/60 bg-[radial-gradient(circle_at_50%_10%,rgba(189,132,255,0.18),transparent_38%),linear-gradient(180deg,#2b124c_0%,#22103e_100%)] p-5 shadow-[inset_0_0_40px_rgba(197,147,255,0.08)]">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">할인 예측 캘린더</h3>
                  <button className="text-sm text-white/50">more 〉</button>
                </div>

                <div className="rounded-[22px] border border-white/10 p-4">
                  <div className="flex items-center justify-between text-2xl font-semibold tracking-tight text-white">
                    <button className="text-white/70">‹</button>
                    <span>2026년 4월</span>
                    <button className="text-white/70">›</button>
                  </div>

                  <div className="mt-5 grid grid-cols-7 border-b border-white/10 pb-3 text-center text-sm text-white/50">
                    {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
                      <div key={d}>{d}</div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-7 gap-y-3 text-center text-lg text-white/76">
                    {Array.from({ length: 30 }).map((_, index) => {
                      const day = index + 1;
                      let cls = 'border-white/5 bg-white/[0.02] text-white/55';

                      if (day === 14) cls = 'border-[#9b66ff] bg-[#4a2274] text-white';
                      if (day === 18) cls = 'border-[#84ffc9] bg-[#7dffbf2e] text-[#c6ffe6] shadow-[0_0_18px_rgba(111,255,203,0.35)]';
                      if (day === 22) cls = 'border-[#ff7fd9] bg-[#ff7fd91d] text-[#ffc0eb]';
                      if (day === 25) cls = 'border-[#ffd7ab] bg-[#ffd7ab12] text-[#ffe4c7]';

                      return (
                        <div key={day} className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl border ${cls}`}>
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.02] p-5 text-base">
                  <div className="space-y-3 text-white/90">
                    <div>🔥 <span className="font-semibold text-[#bcffd7]">18일</span>(예상 할인 시작)</div>
                    <div>💸 <span className="font-semibold text-[#ffc1eb]">22일</span>(최대 할인 예상)</div>
                    <div>⏳ <span className="font-semibold text-[#ffd7ab]">25일</span>(할인 종료 예상)</div>
                  </div>

                  <div className="mt-4 border-t border-white/10 pt-4 text-xl font-semibold text-white">
                    예상 할인율: <span className="text-[#7dffbf]">-30% ~ 50%</span>
                  </div>

                  <div className="mt-2 text-sm text-white/80">신뢰도: 높음 🔵</div>
                </div>
              </div>
            </div>

            {statPanels.map((panel) => (
              <div key={panel.title} className="panel-soft p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold">{panel.title}</div>
                  <span className="text-xs text-white/45">더보기 〉</span>
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

            <div className="panel-soft p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <ShoppingCart className="h-4 w-4" /> 구매 맥락
              </div>
              <div className="rounded-xl border border-white/8 bg-black/15 p-3 text-sm text-white/70">
                할인예측 페이지에서는 구매 시점과 가격 메리트를 먼저 보고, 자세한 정보는 상세 페이지로 이동하도록 설계했습니다.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="section-title">조금 더 기다리면 좋은 게임</div>
          <Link href="/recommend" className="flex items-center gap-1 text-sm text-white/55">추천 더 보기 <ChevronRight className="h-4 w-4" /></Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {related.map((item) => (
            <GameCard key={item.slug} game={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
