'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Game, getSteamHeader, getSteamStoreUrl, statPanels } from '@/lib/data';
import { GameCard } from './game-card';

const API_BASE = 'http://localhost:8000';

const accentClass = {
  purple: 'from-[#9f6fff] to-[#5d33d6]',
  pink: 'from-[#ff73e2] to-[#b93cff]',
  cyan: 'from-[#57f0ff] to-[#2a7fff]',
  amber: 'from-[#ffd76d] to-[#ff8a3d]',
} as const;

// ── 타입 ──────────────────────────────────────────────────
type ReviewData = {
  positive: number;
  negative: number;
  totalReviews: number;
  topPositive: { content: string; playtime_hours: number }[];
  topNegative: { content: string; playtime_hours: number }[];
};

type PredictionData = {
  isOnSale: boolean;
  currentDiscount: number;
  currentPrice: number;
  regularPrice: number;
  avgCycleDays: number | null;
  lastSaleDate: string | null;
  nextPredictedDate: string | null;
  history: { date: string; discount: number; price: number }[];
};

// ── 탭 콘텐츠 컴포넌트 ────────────────────────────────────
function TabReview({ gameId }: { gameId: number }) {
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/game/${gameId}/reviews`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => setError('리뷰 데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [gameId]);

  if (loading) return <div className="flex h-20 items-center justify-center"><div className="h-5 w-5 animate-spin rounded-full border-2 border-[#c084fc] border-t-transparent" /></div>;
  if (error)   return <p className="text-xs text-red-400">{error}</p>;
  if (!data)   return null;

  return (
    <div className="space-y-4">
      {/* 긍정/부정 비율 */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="mb-1 flex justify-between text-xs text-white/60">
            <span>긍정 {data.positive}%</span>
            <span>부정 {data.negative}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${data.positive}%` }} />
          </div>
        </div>
        <span className="text-xs text-white/40">총 {data.totalReviews.toLocaleString()}개</span>
      </div>

      {/* 긍정 리뷰 */}
      {data.topPositive.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-semibold text-emerald-400">👍 추천 리뷰</div>
          <div className="space-y-2">
            {data.topPositive.map((r, i) => (
              <div key={i} className="rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-3 text-xs leading-5 text-white/70">
                {r.content}
                <span className="ml-2 text-white/30">{r.playtime_hours}시간</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 부정 리뷰 */}
      {data.topNegative.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-semibold text-red-400">👎 비추천 리뷰</div>
          <div className="space-y-2">
            {data.topNegative.map((r, i) => (
              <div key={i} className="rounded-xl border border-red-400/15 bg-red-400/5 p-3 text-xs leading-5 text-white/70">
                {r.content}
                <span className="ml-2 text-white/30">{r.playtime_hours}시간</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TabPrediction({ gameId }: { gameId: number }) {
  const [data, setData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/game/${gameId}/discount-prediction`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => setError('할인 예측 데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [gameId]);

  if (loading) return <div className="flex h-20 items-center justify-center"><div className="h-5 w-5 animate-spin rounded-full border-2 border-[#c084fc] border-t-transparent" /></div>;
  if (error)   return <p className="text-xs text-red-400">{error}</p>;
  if (!data)   return null;

  return (
    <div className="space-y-4">
      {/* 현재 상태 */}
      <div className={`rounded-xl border p-3 text-sm ${data.isOnSale ? 'border-emerald-400/30 bg-emerald-400/8 text-emerald-300' : 'border-white/10 bg-white/5 text-white/60'}`}>
        {data.isOnSale
          ? `🎉 현재 ${data.currentDiscount}% 할인 중! ₩${data.currentPrice.toLocaleString()}`
          : `💤 현재 할인 없음 — 정가 ₩${data.regularPrice.toLocaleString()}`}
      </div>

      {/* 예측 정보 */}
      <div className="space-y-2 text-sm">
        {data.avgCycleDays && (
          <div className="flex justify-between text-white/65">
            <span>평균 할인 주기</span>
            <span className="font-semibold text-[#c084fc]">약 {data.avgCycleDays}일</span>
          </div>
        )}
        {data.lastSaleDate && (
          <div className="flex justify-between text-white/65">
            <span>마지막 할인일</span>
            <span>{data.lastSaleDate}</span>
          </div>
        )}
        {data.nextPredictedDate && (
          <div className="flex justify-between text-white/65">
            <span>다음 예상 할인</span>
            <span className="font-semibold text-amber-400">{data.nextPredictedDate} 예상</span>
          </div>
        )}
      </div>

      {/* 최근 할인 이력 */}
      {data.history.length > 0 && (
        <div>
          <div className="mb-2 text-xs text-white/45">최근 할인 이력</div>
          <div className="space-y-1">
            {data.history.map((h, i) => (
              <div key={i} className="flex justify-between rounded-lg bg-white/4 px-3 py-1.5 text-xs text-white/60">
                <span>{h.date}</span>
                <span className="text-emerald-400">-{h.discount}%</span>
                <span>₩{h.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link href={`/predict/${gameId}`} className="block rounded-xl border border-white/10 bg-white/5 py-2 text-center text-xs text-white/60 hover:border-[#c084fc]/50 hover:text-white/80 transition">
        할인 예측 캘린더 전체 보기 →
      </Link>
    </div>
  );
}

// ── 메인 DetailPage ───────────────────────────────────────
export function DetailPage({ game, related }: { game: Game; related: Game[] }) {
  const [activeTab, setActiveTab] = useState<'intro' | 'review' | 'timing'>('intro');
  const [expandedStat, setExpandedStat] = useState<string | null>(null);

  const tabs = [
    { key: 'intro',   label: '게임 소개' },
    { key: 'review',  label: '리뷰 요약' },
    { key: 'timing',  label: '구매 타이밍' },
  ] as const;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.38fr_0.88fr]">
      <div className="space-y-6">
        <section className="panel overflow-hidden p-5 md:p-6">
          <div className="mb-3 flex items-center justify-between text-xs text-white/50">
            <span>상세 분석 · Steam game detail</span>
            <span>{game.genre.join(' · ')}</span>
          </div>
          <div className="grid gap-5 lg:grid-cols-[1.35fr_0.78fr] lg:items-stretch">
            {/* 왼쪽 컬럼 */}
            <div className="flex flex-col gap-3">
              <img src={getSteamHeader(game.steamAppId)} alt={game.title} className="h-[260px] w-full rounded-[22px] object-cover shadow-neon" />
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-xl border border-white/10 bg-[#2a124d]" />)}
              </div>

              {/* ── 탭 — flex-1로 환율 박스와 높이 맞춤 ── */}
              <div className="panel-soft flex flex-1 flex-col p-4" style={{ minHeight: 0 }}>
                <div className="mb-3 flex items-center gap-3 border-b border-white/8 pb-3">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`text-sm transition ${activeTab === tab.key ? 'font-semibold text-white' : 'text-white/50 hover:text-white/80'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto">
                  {activeTab === 'intro' && (
                    <>
                      <p className="text-sm leading-6 text-white/72">{game.summary}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {game.tags.map((tag) => <span key={tag} className="pill">#{tag}</span>)}
                      </div>
                    </>
                  )}
                  {activeTab === 'review' && <TabReview gameId={game.steamAppId} />}
                  {activeTab === 'timing' && <TabPrediction gameId={game.steamAppId} />}
                </div>
              </div>
            </div>

            {/* 오른쪽 컬럼 — 할인박스(고정) + 환율(고정) + 이유(flex-1 늘어남) */}
            <div className="flex flex-col gap-4">
              {/* ── 맨 위 박스: 할인/가격/버튼 (고정 높이) ── */}
              <div className="rounded-[24px] border border-line/60 bg-[#241047] p-5 shadow-glow">
                <div className="text-emerald-400 text-3xl font-bold">-{game.discountRate}%</div>
                <div className="mt-1 text-2xl font-bold text-mint">{game.prices.kr}</div>
                <div className="mt-1 text-sm text-white/35 line-through">₩{game.originalKRW.toLocaleString()}</div>
                <div className="mt-2 text-sm text-white/70">{game.reviewLabel} · {game.score}점</div>
                <div className="mt-4 flex gap-2">
                  <a href={getSteamStoreUrl(game.steamAppId)} target="_blank" rel="noreferrer" className="flex-1 rounded-xl bg-[#55d58a] px-4 py-3 text-center text-sm font-semibold text-black">지금 구매</a>
                  <Link href={`/predict/${game.steamAppId}`} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">할인 예측</Link>
                </div>
                <div className="mt-4 space-y-2 text-xs text-white/55">
                  <div>플랫폼: {game.platforms.join(', ')}</div>
                  <div>평균 플레이타임: {game.playtime}</div>
                  <div>스트리밍 지표: {game.streamStatus}</div>
                </div>
              </div>

              {/* ── 중간 박스: 환율 (고정 높이 — 왼쪽 탭박스와 top 맞춤) ── */}
              <div className="panel-soft p-4">
                <div className="mb-3 text-sm font-semibold">환율</div>
                <div className="space-y-2 text-sm text-white/65">
                  <div className="flex justify-between"><span>한화</span><span className="font-semibold text-mint">{game.prices.kr}</span></div>
                  <div className="flex justify-between"><span>엔화</span><span>{game.prices.jp}</span></div>
                  <div className="flex justify-between"><span>달러</span><span>{game.prices.us}</span></div>
                </div>
              </div>

              {/* ── 하단 박스: 게임 사도 되는 이유? — flex-1로 바닥까지 꽉 채움 ── */}
              <div className="panel-soft flex flex-1 flex-col p-4">
                <div className="mb-4 text-sm font-semibold">게임 사도 되는 이유?</div>
                <div className="flex flex-1 flex-col justify-around">
                  {game.reason.map((item, idx) => (
                    <div key={item}>
                      <div className="mb-1 flex items-center justify-between text-xs text-white/60">
                        <span>{item}</span><span>{90 - idx * 10}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-2 rounded-full bg-gradient-to-r from-[#64ffc8] to-[#ff70ea]" style={{ width: `${90 - idx * 10}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          {/* 추천 이유 요약 — 태그 버튼 제거 */}
          <div className="panel p-5 md:p-6">
            <div className="mb-4 section-title">추천 이유 요약</div>
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
            <p className="mt-4 text-xs leading-6 text-white/50">환율 기반 비교에서는 한국 가격이 가장 직관적이며, 시즌성 할인 주기도 비교적 뚜렷합니다.</p>
          </div>
        </section>

        {/* ── 게임 소식 — more 버튼 → 게임 소식 페이지로 이동 ── */}
        <section className="panel p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="section-title">게임 소식</div>
            <Link
              href={`/games/${game.steamAppId}/news`}
              className="text-xs text-white/45 hover:text-white/70 transition"
            >
              more →
            </Link>
          </div>
          <div className="space-y-4">
            {game.news.slice(0, 2).map((news, idx) => (
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

        {/* ── 바로가기 — 게임 소식 아래로 이동 ── */}
        <section className="panel p-5">
          <div className="mb-4 section-title">바로가기</div>
          <div className="space-y-3 text-sm text-white/70">
            <Link href={`/predict/${game.steamAppId}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#1d0d39] px-4 py-3 hover:border-[#c084fc]/50 transition">할인예측 페이지 <ExternalLink className="h-4 w-4" /></Link>
            <Link href="/rankings" className="flex items-center justify-between rounded-xl border border-white/10 bg-[#1d0d39] px-4 py-3 hover:border-[#c084fc]/50 transition">게임 순위 페이지 <ExternalLink className="h-4 w-4" /></Link>
            <Link href="/recommend" className="flex items-center justify-between rounded-xl border border-white/10 bg-[#1d0d39] px-4 py-3 hover:border-[#c084fc]/50 transition">추천 결과 페이지 <ExternalLink className="h-4 w-4" /></Link>
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
            {related.map((item) => <GameCard key={item.steamAppId} game={item} compact />)}
          </div>
        </section>

        {/* ── 통계 요약 ── */}
        <section className="panel p-5">
          <div className="mb-4 section-title">통계 요약</div>
          <div className="space-y-4">
            {statPanels.map((panel) => (
              <div key={panel.title} className="rounded-2xl border border-white/8 bg-[#241141] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">{panel.title}</h3>
                  <button
                    onClick={() => setExpandedStat(expandedStat === panel.title ? null : panel.title)}
                    className="text-xs text-white/45 hover:text-white/70 transition"
                  >
                    {expandedStat === panel.title ? '접기 ▲' : '더보기 ▼'}
                  </button>
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
                {expandedStat === panel.title && (
                  <div className="mt-3 rounded-xl border border-white/8 bg-white/4 p-3 text-xs text-white/55 leading-5">
                    {panel.title} 관련 상세 데이터입니다. 추후 실데이터 연결 시 업데이트됩니다.
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
