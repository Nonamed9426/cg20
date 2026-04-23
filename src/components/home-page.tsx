'use client';

import Link from 'next/link';
import {
  Game,
  games,
  getDailyRecommendedGame,
  getGame,
  getSteamHeader,
  rankingGroups,
  saleNews,
} from '@/lib/data';
import { GameCard } from './game-card';
import { useExchange } from '@/lib/exchange-context';

function SummaryColumn({ title, items }: { title: string; items: Game[] }) {
  return (
    <div className="rounded-[24px] border border-white/6 bg-[#21103d] p-4">
      <div className="mb-3 text-lg font-semibold text-white">{title}</div>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <Link
            key={`${title}-${item.slug}`}
            href={`/games/${item.steamAppId}`}
            className="block rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition hover:border-accent/60"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">
                  {idx + 1}. {item.title}
                </div>
                <div className="mt-2 line-clamp-3 text-sm leading-6 text-white/58">{item.summary}</div>
              </div>
              <div className="flex-shrink-0 text-lg font-semibold text-[#d9c2ff]">{item.score}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function HomePage() {
  const rates = useExchange();
  const game = getDailyRecommendedGame();
  const buyNow   = [getGame('stardew-valley'), getGame('monster-hunter-world'), getGame('helldivers-2'), getGame('dark-and-darker')];
  const buyLater = [getGame('turbo-golf-racing'), getGame('sun-haven'), getGame('helldivers-2'), getGame('dark-and-darker')];
  const similar  = [getGame('travellers-rest'), getGame('sun-haven'), getGame('spiritfarer'), getGame('monster-hunter-world')];

  const krwBase = game.priceKRW;
  const usKrw = Math.round(parseFloat(game.prices.us.replace('$', '').replace('Free', '0')) * rates.usd);
  const jpKrw = Math.round(parseFloat(game.prices.jp.replace('¥', '').replace(',', '').replace('무료', '0')) * rates.jpy);

  return (
    <div className="space-y-6">

      {/* ── 상단: 오늘의 추천 + 환율/빠른이동 ── */}
      <div className="grid gap-6 lg:grid-cols-[1.38fr_0.88fr]">
        <section className="panel overflow-hidden p-5 md:p-6">
          {/* ── URL 옆으로 꽉 채우는 상단 바 ── */}
          <div className="mb-4 flex items-center justify-between text-xs text-white/50">
            <span>Today&apos;s one-pick Steam recommendation</span>
            <span>{new Date().toLocaleDateString('ko-KR')}</span>
          </div>

          <div className="space-y-4">
          {/* ── 1계층: 이미지 + 태그 (가로 꽉 채움, 짤리지 않게) ── */}
          <div className="relative w-full overflow-hidden rounded-[22px] bg-[#1a0d39]">
            <img
              src={getSteamHeader(game.steamAppId)}
              alt={game.title}
              className="w-full object-contain shadow-neon"
              style={{ maxHeight: '280px', minHeight: '160px' }}
            />
            <div className="absolute bottom-3 left-4 flex flex-wrap gap-2">
              {game.tags.map((tag) => (
                <span key={tag} className="pill">{tag}</span>
              ))}
            </div>
          </div>

          {/* ── 2계층: 추천 이유 (가로 꽉 채움) ── */}
          <div className="panel-soft p-4">
            <div className="mb-2 border-b border-white/8 pb-2 text-sm font-semibold text-white">추천 이유</div>
            <p className="text-sm leading-6 text-white/72">{game.summary}</p>
          </div>

          {/* ── 3계층: 할인/가격/버튼 (가로 꽉 채움) ── */}
          <div className="rounded-[24px] border border-line/60 bg-[#241047] p-5 shadow-glow">
            <div className="flex items-center justify-between">
              <div className="rounded-full bg-[#1cff8e1a] px-3 py-1 text-lg font-semibold text-[#72f7bb]">
                -{game.discountRate}%
              </div>
              <div className="text-sm text-white/70">{game.reviewLabel}</div>
            </div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xl font-black tracking-tight text-white md:text-2xl">{game.title}</div>
                <p className="mt-1 text-xs leading-5 text-white/60">
                  {game.reason.join(', ')} 흐름을 종합해 추천한 오늘의 1픽입니다.
                </p>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-xl font-black text-mint">{game.prices.kr}</div>
                <div className="text-xs text-white/35 line-through">₩{game.originalKRW.toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Link href={`/games/${game.steamAppId}`} className="flex-1 rounded-xl bg-[#3fd09d] px-4 py-3 text-center text-sm font-bold text-[#120821]">
                상세 보기
              </Link>
              <Link href={`/predict/${game.steamAppId}`} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-bold text-white">
                할인 예측 보기
              </Link>
            </div>
            <div className="mt-3 space-y-1 text-xs text-white/45">
              <div>오늘의 추천은 날짜 기준으로 하루 1개씩 자동으로 바뀝니다.</div>
              <div>유저 평점, 할인율, 업데이트 흐름, 플레이타임을 함께 반영했습니다.</div>
            </div>
          </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="panel p-5">
            <div className="text-xl font-black text-white md:text-2xl">오늘의 환율</div>
            <div className="mt-2 text-sm text-white/55 md:text-base">하나은행 매매기준율 · 5분마다 자동 갱신</div>
            <div className="mt-5 space-y-4">
              <div className="rounded-[20px] bg-white/[0.04] p-5">
                <div className="text-sm text-white/55">USD → KRW</div>
                <div className="mt-2 text-2xl font-black text-white md:text-3xl">
                  {rates.loading ? '로딩 중...' : `₩${rates.usd.toLocaleString()}`}
                </div>
              </div>
              <div className="rounded-[20px] bg-white/[0.04] p-5">
                <div className="text-sm text-white/55">JPY → KRW</div>
                <div className="mt-2 text-2xl font-black text-white md:text-3xl">
                  {rates.loading ? '로딩 중...' : `₩${rates.jpy}`}
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-white/45">
              업데이트 시각: {rates.loading ? '-' : rates.updatedAt}
            </div>
          </section>

          <section className="panel p-5">
            <div className="text-xl font-black text-white md:text-2xl">빠른 이동</div>
            <div className="mt-2 text-sm text-white/55 md:text-base">순위, 스트리머, 활성 게임 추천으로 바로 이동</div>
            <div className="mt-5 space-y-3 text-sm">
              <Link href="/active" className="block rounded-2xl border border-[#8d60ff]/30 bg-[#2a1452] px-5 py-4 font-semibold text-white/95 transition hover:border-[#b28cff] hover:bg-[#331764]">
                활성 게임 추천 바로 보기
              </Link>
              <Link href="/rankings?tab=streamerTop" className="block rounded-2xl bg-white/[0.05] px-5 py-4 font-semibold text-white/90 transition hover:bg-white/[0.09]">
                스트리밍 인기 Top 10
              </Link>
              <Link href="/rankings?tab=localTop" className="block rounded-2xl bg-white/[0.05] px-5 py-4 font-semibold text-white/90 transition hover:bg-white/[0.09]">
                최고 평점 Top 100
              </Link>
              <Link href="/rankings?tab=globalTop" className="block rounded-2xl bg-white/[0.05] px-5 py-4 font-semibold text-white/90 transition hover:bg-white/[0.09]">
                가성비 Top 100
              </Link>
              <Link href="/rankings?tab=bestWorst" className="block rounded-2xl bg-white/[0.05] px-5 py-4 font-semibold text-white/90 transition hover:bg-white/[0.09]">
                호불호 주의 Top 100
              </Link>
            </div>
          </section>
        </aside>
      </div>

      {/* ── 중단: 게임 추천 섹션 + 국가별 구매 비교/할인 뉴스 ── */}
      <div className="grid items-start gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <section>
            <div className="mb-4">
              <div className="text-2xl font-black tracking-tight text-white md:text-[36px]">지금 사도 되는 게임</div>
              <div className="mt-1 text-base text-white/58">할인율, 평점, 업데이트 흐름을 같이 반영한 추천</div>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {buyNow.map((item) => (
                <GameCard key={item.slug} game={item} />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4">
              <div className="text-2xl font-black tracking-tight text-white md:text-[36px]">조금 더 기다려야 하는 게임</div>
              <div className="mt-1 text-base text-white/58">다음 할인 이벤트를 기다리면 더 유리한 후보</div>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {buyLater.map((item) => (
                <GameCard key={item.slug} game={item} />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4">
              <div className="text-2xl font-black tracking-tight text-white md:text-[36px]">비슷한 게임 추천</div>
              <div className="mt-1 text-base text-white/58">오늘의 추천 게임을 좋아하면 이어서 볼만한 게임</div>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {similar.map((item) => (
                <GameCard key={item.slug} game={item} />
              ))}
            </div>
          </section>
        </div>

        {/* aside — sticky 제거해서 왼쪽과 높이 자연스럽게 맞춤 */}
        <aside className="space-y-6">
          <section className="panel p-5">
            <div className="text-sm font-semibold text-[#f0b5ff]">환율 비교 추천</div>
            <div className="mt-1 text-2xl font-black tracking-tight text-white md:text-[36px]">국가별 구매 비교</div>
            <div className="mt-2 text-sm text-white/45">
              기준: {rates.loading ? '-' : rates.updatedAt}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-[20px] bg-white/[0.04] p-4">
                <div className="text-sm text-white/55">한국</div>
                <div className="mt-3 text-xl font-black text-white md:text-2xl">₩{krwBase.toLocaleString()}</div>
                <div className="mt-2 text-xs text-white/45">기본 비교 기준</div>
              </div>
              <div className="rounded-[20px] bg-white/[0.04] p-4">
                <div className="text-sm text-white/55">미국</div>
                <div className="mt-3 text-xl font-black text-white md:text-2xl">{game.prices.us}</div>
                <div className="mt-2 text-xs text-white/45">약 ₩{usKrw.toLocaleString()}</div>
              </div>
              <div className="rounded-[20px] bg-white/[0.04] p-4">
                <div className="text-sm text-white/55">일본</div>
                <div className="mt-3 text-xl font-black text-white md:text-2xl">{game.prices.jp}</div>
                <div className="mt-2 text-xs text-white/45">약 ₩{jpKrw.toLocaleString()}</div>
              </div>
            </div>

            <div className="mt-5 rounded-[18px] border border-[#59d6b9]/25 bg-[#12333f] px-4 py-4 text-sm leading-7 text-[#d7fff3]">
              현재 한국 ₩{krwBase.toLocaleString()} / 미국 환산 ₩{usKrw.toLocaleString()} / 일본 환산 ₩{jpKrw.toLocaleString()} 기준,{' '}
              <span className="font-bold">
                {Math.min(krwBase, usKrw, jpKrw) === jpKrw ? '일본' : Math.min(krwBase, usKrw, jpKrw) === usKrw ? '미국' : '한국'}
              </span>{' '}
              가격이 가장 낮습니다.
            </div>
          </section>

          {/* 할인 뉴스 — 3개만 표시 */}
          <section className="panel p-5">
            <div className="text-2xl font-black tracking-tight text-white md:text-[36px]">할인 뉴스</div>
            <div className="mt-1 text-base text-white/58">게임 언론/프로모션 카드 UI</div>
            <div className="mt-5 space-y-4">
              {saleNews.slice(0, 3).map((item) => (
                <div key={item.title} className="rounded-[22px] border border-white/6 bg-white/[0.03] p-4">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0 text-base font-bold leading-snug text-white line-clamp-2">
                      {item.title}
                    </div>
                    <span className="flex-shrink-0 rounded-full border border-white/10 bg-[#322054] px-3 py-1 text-xs text-white/70">
                      {item.label}
                    </span>
                  </div>
                  <div className="text-sm leading-6 text-white/66">{item.text}</div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {/* ── 하단: 랭킹 미리보기 (별도 풀 너비 섹션) ── */}
      <section className="panel p-5 md:p-6">
        <div className="mb-5">
          <div className="text-2xl font-black tracking-tight text-white md:text-[36px]">랭킹 미리보기</div>
          <div className="mt-1 text-base text-white/58">스트리밍/최고 평점/가성비/호불호 섹션 일부</div>
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          <SummaryColumn title="스트리밍 Top" items={rankingGroups.streamerTop.slice(0, 3).map(getGame)} />
          <SummaryColumn title="최고 평점 Top" items={[getGame('stardew-valley'), getGame('elden-ring'), getGame('spiritfarer')]} />
          <SummaryColumn title="가성비 Top" items={[getGame('spiritfarer'), getGame('stardew-valley'), getGame('monster-hunter-world')]} />
          <SummaryColumn title="호불호 주의 Top" items={[getGame('ea-fc-24'), getGame('dark-and-darker'), getGame('counter-strike-2')]} />
        </div>
      </section>
    </div>
  );
}
