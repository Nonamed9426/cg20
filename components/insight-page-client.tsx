'use client';

import { useState, useMemo } from 'react';
import { games, getSteamHeader } from '@/lib/data';
import type { Game } from '@/lib/data';

// ─── 더미 데이터 (FastAPI 연결 후 교체) ──────────────────────────────────────

type PriceHistory = { date: string; price: number; regularPrice: number; discount: number };
type ReviewStat = { positive: number; negative: number; playtimeDist: { label: string; count: number }[] };
type LangSupport = { name: string; hasVoice: boolean };

const DUMMY_PRICE_HISTORY: Record<number, PriceHistory[]> = {
  413150: [
    { date: '2025-10', price: 12800, regularPrice: 12800, discount: 0 },
    { date: '2025-11', price: 12800, regularPrice: 12800, discount: 0 },
    { date: '2025-12', price: 6400,  regularPrice: 12800, discount: 50 },
    { date: '2026-01', price: 12800, regularPrice: 12800, discount: 0 },
    { date: '2026-02', price: 12800, regularPrice: 12800, discount: 0 },
    { date: '2026-03', price: 7680,  regularPrice: 12800, discount: 40 },
    { date: '2026-04', price: 7680,  regularPrice: 12800, discount: 40 },
  ],
  1245620: [
    { date: '2025-10', price: 72000, regularPrice: 72000, discount: 0 },
    { date: '2025-11', price: 72000, regularPrice: 72000, discount: 0 },
    { date: '2025-12', price: 57600, regularPrice: 72000, discount: 20 },
    { date: '2026-01', price: 72000, regularPrice: 72000, discount: 0 },
    { date: '2026-02', price: 72000, regularPrice: 72000, discount: 0 },
    { date: '2026-03', price: 64800, regularPrice: 72000, discount: 10 },
    { date: '2026-04', price: 64800, regularPrice: 72000, discount: 10 },
  ],
  582010: [
    { date: '2025-10', price: 32000, regularPrice: 32000, discount: 0 },
    { date: '2025-11', price: 16000, regularPrice: 32000, discount: 50 },
    { date: '2025-12', price: 9600,  regularPrice: 32000, discount: 70 },
    { date: '2026-01', price: 32000, regularPrice: 32000, discount: 0 },
    { date: '2026-02', price: 32000, regularPrice: 32000, discount: 0 },
    { date: '2026-03', price: 16000, regularPrice: 32000, discount: 50 },
    { date: '2026-04', price: 16000, regularPrice: 32000, discount: 50 },
  ],
};

const DUMMY_REVIEWS: Record<number, ReviewStat> = {
  413150: {
    positive: 96, negative: 4,
    playtimeDist: [
      { label: '~10h', count: 8 },
      { label: '10~30h', count: 15 },
      { label: '30~100h', count: 38 },
      { label: '100~300h', count: 28 },
      { label: '300h+', count: 11 },
    ],
  },
  1245620: {
    positive: 94, negative: 6,
    playtimeDist: [
      { label: '~10h', count: 5 },
      { label: '10~30h', count: 12 },
      { label: '30~100h', count: 32 },
      { label: '100~300h', count: 35 },
      { label: '300h+', count: 16 },
    ],
  },
  582010: {
    positive: 90, negative: 10,
    playtimeDist: [
      { label: '~10h', count: 6 },
      { label: '10~30h', count: 18 },
      { label: '30~100h', count: 36 },
      { label: '100~300h', count: 30 },
      { label: '300h+', count: 10 },
    ],
  },
};

const DUMMY_LANGS: Record<number, LangSupport[]> = {
  413150: [
    { name: '한국어', hasVoice: false },
    { name: '영어', hasVoice: true },
    { name: '일본어', hasVoice: false },
    { name: '중국어(간체)', hasVoice: false },
    { name: '프랑스어', hasVoice: false },
    { name: '독일어', hasVoice: false },
  ],
  1245620: [
    { name: '한국어', hasVoice: false },
    { name: '영어', hasVoice: true },
    { name: '일본어', hasVoice: true },
    { name: '중국어(간체)', hasVoice: false },
  ],
  582010: [
    { name: '한국어', hasVoice: false },
    { name: '영어', hasVoice: true },
    { name: '일본어', hasVoice: true },
    { name: '프랑스어', hasVoice: false },
    { name: '독일어', hasVoice: false },
    { name: '스페인어', hasVoice: false },
  ],
};

// 기본 더미 (등록 안 된 게임)
function getDefaultHistory(game: Game): PriceHistory[] {
  return [
    { date: '2025-10', price: game.originalKRW, regularPrice: game.originalKRW, discount: 0 },
    { date: '2025-11', price: game.originalKRW, regularPrice: game.originalKRW, discount: 0 },
    { date: '2025-12', price: Math.round(game.originalKRW * 0.7), regularPrice: game.originalKRW, discount: 30 },
    { date: '2026-01', price: game.originalKRW, regularPrice: game.originalKRW, discount: 0 },
    { date: '2026-02', price: game.originalKRW, regularPrice: game.originalKRW, discount: 0 },
    { date: '2026-03', price: game.priceKRW, regularPrice: game.originalKRW, discount: game.discountRate },
    { date: '2026-04', price: game.priceKRW, regularPrice: game.originalKRW, discount: game.discountRate },
  ];
}

function getDefaultReview(game: Game): ReviewStat {
  return {
    positive: game.score,
    negative: 100 - game.score,
    playtimeDist: [
      { label: '~10h', count: 10 },
      { label: '10~30h', count: 20 },
      { label: '30~100h', count: 35 },
      { label: '100~300h', count: 25 },
      { label: '300h+', count: 10 },
    ],
  };
}

function getDefaultLangs(): LangSupport[] {
  return [
    { name: '영어', hasVoice: true },
    { name: '한국어', hasVoice: false },
    { name: '일본어', hasVoice: false },
  ];
}

// ─── 유틸 ────────────────────────────────────────────────────────────────────
function formatKRW(n: number) {
  return `₩${n.toLocaleString()}`;
}

// ─── 섹션 컴포넌트들 ──────────────────────────────────────────────────────────

// 1. 가격 변동 추이
function PriceChart({ history, game }: { history: PriceHistory[]; game: Game }) {
  const maxPrice = Math.max(...history.map((h) => h.regularPrice));
  const minPrice = Math.min(...history.map((h) => h.price));
  const currentPrice = history[history.length - 1].price;
  const isLowest = currentPrice === minPrice;

  const chartH = 120;
  const chartW = 100;
  const points = history.map((h, i) => {
    const x = (i / (history.length - 1)) * chartW;
    const y = chartH - ((h.price / maxPrice) * chartH * 0.85) - 8;
    return { x, y, ...h };
  });
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartH} L 0 ${chartH} Z`;

  return (
    <div className="panel-soft p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-white">가격 변동 추이</div>
        {isLowest && (
          <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs font-bold text-emerald-400">
            🏷 역대 최저가
          </span>
        )}
      </div>

      <div className="mb-4 flex gap-4">
        <div>
          <div className="text-xs text-white/45">현재가</div>
          <div className="text-xl font-black text-mint">{formatKRW(currentPrice)}</div>
        </div>
        <div>
          <div className="text-xs text-white/45">역대 최저</div>
          <div className="text-xl font-black text-emerald-400">{formatKRW(minPrice)}</div>
        </div>
        <div>
          <div className="text-xs text-white/45">정가</div>
          <div className="text-xl font-black text-white/60">{formatKRW(maxPrice)}</div>
        </div>
      </div>

      {/* SVG 차트 */}
      <div className="relative">
        <svg viewBox={`0 0 100 ${chartH}`} className="w-full" style={{ height: 140 }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#64ffc8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#64ffc8" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#priceGrad)" />
          <path d={pathD} fill="none" stroke="#64ffc8" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2" fill={p.discount > 0 ? '#ff70ea' : '#64ffc8'} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        {/* X축 레이블 */}
        <div className="mt-1 flex justify-between text-[10px] text-white/35">
          {history.map((h) => <span key={h.date}>{h.date.slice(5)}</span>)}
        </div>
      </div>
    </div>
  );
}

// 2. 가짜 할인 추적 + 할인 주기
function FakeDiscountTracker({ history }: { history: PriceHistory[] }) {
  const suspiciousMonths = history.filter((h, i) => {
    if (i === 0) return false;
    return h.regularPrice > history[i - 1].regularPrice;
  });
  const isSuspicious = suspiciousMonths.length > 0;
  const discountMonths = history.filter((h) => h.discount > 0);

  return (
    <div className="panel-soft p-5">
      <div className="mb-4 text-sm font-semibold text-white">가짜 할인 추적</div>
      <div className={`mb-4 rounded-xl border p-3 ${isSuspicious ? 'border-red-400/30 bg-red-400/10' : 'border-emerald-400/30 bg-emerald-400/10'}`}>
        <div className={`text-sm font-bold ${isSuspicious ? 'text-red-400' : 'text-emerald-400'}`}>
          {isSuspicious ? '⚠️ 정가 인상 후 할인 의심' : '✅ 정상적인 할인 패턴'}
        </div>
        <div className="mt-1 text-xs text-white/55">
          {isSuspicious
            ? `${suspiciousMonths.length}회 정가 인상 감지됨`
            : '정가 변동 없이 일관된 할인'}
        </div>
      </div>

      <div className="mb-3 text-xs font-semibold text-white/60">할인 주기</div>
      <div className="flex gap-1">
        {history.map((h) => (
          <div key={h.date} className="flex-1 text-center">
            <div
              className={`mx-auto mb-1 h-8 w-full rounded-md ${h.discount > 0 ? 'bg-[#ff70ea]/60' : 'bg-white/8'}`}
              style={{ opacity: h.discount > 0 ? 0.4 + h.discount / 100 : 0.3 }}
            />
            <div className="text-[9px] text-white/30">{h.date.slice(5)}</div>
            {h.discount > 0 && (
              <div className="text-[9px] text-[#ff70ea]">-{h.discount}%</div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-white/40">
        최근 {history.length}개월 중 {discountMonths.length}회 할인
      </div>
    </div>
  );
}

// 3. 리뷰 인사이트
function ReviewInsight({ review }: { review: ReviewStat }) {
  const maxCount = Math.max(...review.playtimeDist.map((d) => d.count));
  const circumference = 2 * Math.PI * 36;
  const positiveDash = (review.positive / 100) * circumference;

  return (
    <div className="panel-soft p-5">
      <div className="mb-4 text-sm font-semibold text-white">리뷰 인사이트</div>
      <div className="grid grid-cols-2 gap-4">
        {/* 도넛 차트 */}
        <div className="flex flex-col items-center">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90">
              <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              <circle
                cx="40" cy="40" r="36" fill="none"
                stroke="#64ffc8" strokeWidth="8"
                strokeDasharray={`${positiveDash} ${circumference}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center">
              <div className="text-lg font-black text-emerald-400">{review.positive}%</div>
              <div className="text-[9px] text-white/40">긍정</div>
            </div>
          </div>
          <div className="mt-2 flex gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />긍정 {review.positive}%</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-white/20" />부정 {review.negative}%</span>
          </div>
        </div>

        {/* 플레이타임 분포 */}
        <div>
          <div className="mb-2 text-xs text-white/50">플레이타임 분포</div>
          <div className="space-y-1.5">
            {review.playtimeDist.map((d) => (
              <div key={d.label} className="flex items-center gap-2">
                <div className="w-12 text-right text-[10px] text-white/40">{d.label}</div>
                <div className="flex-1 rounded-full bg-white/8">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#9b5cff] to-[#ff70ea]"
                    style={{ width: `${(d.count / maxCount) * 100}%` }}
                  />
                </div>
                <div className="w-6 text-[10px] text-white/40">{d.count}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. 국가별 가격 비교
function CountryPriceCompare({ game }: { game: Game }) {
  const krw = game.priceKRW;
  const usdKrw = Math.round(parseFloat(game.prices.us.replace('$', '').replace('Free', '0')) * 1376);
  const jpyKrw = Math.round(parseFloat(game.prices.jp.replace('¥', '').replace(',', '').replace('무료', '0')) * 9.12);

  const isFree = game.priceKRW === 0;
  const prices = [
    { country: '🇰🇷 한국', price: krw, raw: game.prices.kr, krwEquiv: krw },
    { country: '🇺🇸 미국', price: usdKrw, raw: game.prices.us, krwEquiv: usdKrw },
    { country: '🇯🇵 일본', price: jpyKrw, raw: game.prices.jp, krwEquiv: jpyKrw },
  ];
  const minPrice = Math.min(...prices.map((p) => p.krwEquiv));
  const maxKrw = Math.max(...prices.map((p) => p.krwEquiv)) || 1;

  return (
    <div className="panel-soft p-5">
      <div className="mb-4 text-sm font-semibold text-white">국가별 가격 비교</div>
      {isFree ? (
        <div className="text-center text-sm text-emerald-400 font-bold py-4">무료 게임입니다</div>
      ) : (
        <div className="space-y-3">
          {prices.map((p) => (
            <div key={p.country}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-white/70">{p.country}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white/50">{p.raw}</span>
                  <span className={`font-bold ${p.krwEquiv === minPrice ? 'text-emerald-400' : 'text-white/70'}`}>
                    {formatKRW(p.krwEquiv)}
                    {p.krwEquiv === minPrice && ' 🏆'}
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-white/8">
                <div
                  className={`h-2 rounded-full ${p.krwEquiv === minPrice ? 'bg-emerald-400' : 'bg-[#9b5cff]'}`}
                  style={{ width: `${(p.krwEquiv / maxKrw) * 100}%` }}
                />
              </div>
            </div>
          ))}
          <div className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/8 p-3 text-xs text-emerald-300">
            {prices.find((p) => p.krwEquiv === minPrice)?.country} 구매가 가장 저렴해요
            {' '}(환율 기준 {formatKRW(minPrice)})
          </div>
        </div>
      )}
    </div>
  );
}

// 5. 언어 지원 현황
function LanguageSupport({ langs }: { langs: LangSupport[] }) {
  const hasKorean = langs.some((l) => l.name === '한국어');
  const voiceCount = langs.filter((l) => l.hasVoice).length;

  return (
    <div className="panel-soft p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-white">언어 지원 현황</div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${hasKorean ? 'bg-[#ff70ea]/15 text-[#ff70ea]' : 'bg-white/8 text-white/40'}`}>
          {hasKorean ? '🇰🇷 한국어 지원' : '한국어 미지원'}
        </span>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {langs.map((l) => (
          <span
            key={l.name}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs ${
              l.name === '한국어'
                ? 'border-[#ff70ea]/30 bg-[#ff70ea]/10 text-[#ff70ea]'
                : 'border-white/10 bg-white/5 text-white/60'
            }`}
          >
            {l.name}
            {l.hasVoice && <span className="text-[#c084fc]">🎙</span>}
          </span>
        ))}
      </div>
      <div className="text-xs text-white/40">
        총 {langs.length}개 언어 지원 · 음성 지원 {voiceCount}개
      </div>
    </div>
  );
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────────────────────
export default function InsightPageClient() {
  const [selectedId, setSelectedId] = useState<number>(games[0].steamAppId);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredGames = useMemo(() =>
    games.filter((g) => g.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery]
  );

  const selectedGame = useMemo(() =>
    games.find((g) => g.steamAppId === selectedId) ?? games[0],
    [selectedId]
  );

  const priceHistory = DUMMY_PRICE_HISTORY[selectedId] ?? getDefaultHistory(selectedGame);
  const reviewStat = DUMMY_REVIEWS[selectedId] ?? getDefaultReview(selectedGame);
  const langs = DUMMY_LANGS[selectedId] ?? getDefaultLangs();

  return (
    <div className="space-y-6">
      {/* ── 헤더 ── */}
      <div>
        <div className="flex items-center gap-2">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c084fc', boxShadow: '0 0 10px #c084fc' }} />
          <h1
            style={{
              fontSize: 'clamp(1.4rem, 4vw, 2rem)',
              fontWeight: 800,
              background: 'linear-gradient(90deg, #c084fc, #f472b6, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
            }}
          >
            데이터 인사이트
          </h1>
        </div>
        <p className="mt-1 text-sm text-white/50">
          가격 변동 · 할인 패턴 · 리뷰 분석 · 국가별 가격 · 언어 지원을 한눈에
        </p>
      </div>

      {/* ── 게임 선택 ── */}
      <div className="panel p-5">
        <div className="mb-3 text-sm font-semibold text-white">게임 선택</div>
        <div className="relative">
          <div
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-[#1a1033] p-3 transition hover:border-[#c084fc]/50"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <img
              src={getSteamHeader(selectedGame.steamAppId)}
              alt={selectedGame.title}
              className="h-10 w-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">{selectedGame.title}</div>
              <div className="text-xs text-white/45">{selectedGame.genre.join(' · ')}</div>
            </div>
            <span className="text-white/40">{dropdownOpen ? '▲' : '▼'}</span>
          </div>

          {dropdownOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-white/10 bg-[#1a0d39] shadow-2xl">
              <div className="p-2">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="게임 검색..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredGames.map((g) => (
                  <div
                    key={g.steamAppId}
                    className={`flex cursor-pointer items-center gap-3 px-3 py-2 transition hover:bg-white/5 ${selectedId === g.steamAppId ? 'bg-[#c084fc]/10' : ''}`}
                    onClick={() => { setSelectedId(g.steamAppId); setDropdownOpen(false); setSearchQuery(''); }}
                  >
                    <img src={getSteamHeader(g.steamAppId)} alt={g.title} className="h-8 w-12 rounded object-cover" />
                    <div>
                      <div className="text-sm text-white">{g.title}</div>
                      <div className="text-xs text-white/40">{g.genre.join(' · ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 인사이트 그리드 ── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 1. 가격 변동 추이 — 넓게 */}
        <div className="md:col-span-2">
          <PriceChart history={priceHistory} game={selectedGame} />
        </div>

        {/* 2. 가짜 할인 추적 */}
        <FakeDiscountTracker history={priceHistory} />

        {/* 3. 리뷰 인사이트 */}
        <ReviewInsight review={reviewStat} />

        {/* 4. 국가별 가격 비교 */}
        <CountryPriceCompare game={selectedGame} />

        {/* 5. 언어 지원 현황 */}
        <LanguageSupport langs={langs} />
      </div>

      {/* DB 연결 안내 */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 text-xs leading-6 text-white/35">
        현재 더미 데이터입니다. FastAPI 연결 후{' '}
        <code className="text-white/50">game_price_history</code>,{' '}
        <code className="text-white/50">game_reviews</code>,{' '}
        <code className="text-white/50">game_languages</code> 테이블을 API fetch로 교체하세요.
      </div>
    </div>
  );
}
