'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { games, getSteamHeader } from '@/lib/data';

// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────
type SaleEvent = {
  name: string;
  period: string;          // 예상 기간 텍스트
  startDate: string;       // YYYY-MM-DD
  endDate: string;
  daysUntil: number;       // 오늘 기준 D-day
  avgDiscount: number;     // 평균 할인율 %
  confidence: 'high' | 'medium' | 'low';
  description: string;
  tags: string[];
};

type GameSalePrediction = {
  slug: string;
  lastSaleDate: string;    // 마지막 할인일
  lastDiscountRate: number;
  avgCycleDays: number;    // 평균 할인 주기 (일)
  nextPredictedDate: string;
  nextDaysUntil: number;
  expectedDiscount: number;
  confidence: 'high' | 'medium' | 'low';
  saleTrend: 'frequent' | 'occasional' | 'rare'; // 할인 빈도
};

// ─────────────────────────────────────────────
// 더미 데이터 — DB/크롤링 연결 시 교체
// ─────────────────────────────────────────────
const SALE_EVENTS: SaleEvent[] = [
  {
    name: '스팀 봄 세일',
    period: '2026년 3월 중순 ~ 4월 초',
    startDate: '2026-03-19',
    endDate: '2026-03-26',
    daysUntil: -25,  // 이미 지남
    avgDiscount: 50,
    confidence: 'high',
    description: '매년 3~4월에 진행되는 봄 프로모션. 인디 및 AAA 타이틀 대부분 포함.',
    tags: ['인디 강세', 'AAA 포함', '번들 할인'],
  },
  {
    name: '스팀 여름 세일',
    period: '2026년 6월 말 ~ 7월 중순 예상',
    startDate: '2026-06-26',
    endDate: '2026-07-10',
    daysUntil: 66,
    avgDiscount: 75,
    confidence: 'high',
    description: '연간 최대 규모 세일. 대부분의 게임이 역대 최저가를 기록하는 시기.',
    tags: ['역대 최저가', '최대 규모', '위시리스트 필수'],
  },
  {
    name: '스팀 할로윈 세일',
    period: '2026년 10월 말 예상',
    startDate: '2026-10-28',
    endDate: '2026-11-01',
    daysUntil: 190,
    avgDiscount: 40,
    confidence: 'medium',
    description: '공포/서바이벌 장르 위주로 할인. 기간이 짧아 빠른 결정이 필요.',
    tags: ['공포 장르', '단기 세일', '서바이벌'],
  },
  {
    name: '스팀 추수감사절 세일',
    period: '2026년 11월 말 예상',
    startDate: '2026-11-25',
    endDate: '2026-12-02',
    daysUntil: 218,
    avgDiscount: 60,
    confidence: 'high',
    description: '블랙프라이데이와 연계. AAA 신작 포함 여부에 따라 할인폭이 달라짐.',
    tags: ['블랙프라이데이', 'AAA 신작', '대형 세일'],
  },
  {
    name: '스팀 겨울 세일',
    period: '2026년 12월 말 ~ 1월 초 예상',
    startDate: '2026-12-22',
    endDate: '2027-01-05',
    daysUntil: 245,
    avgDiscount: 70,
    confidence: 'high',
    description: '연말 최대 할인 이벤트. 여름 세일과 함께 연간 2대 세일 중 하나.',
    tags: ['연말 결산', '역대 최저가', '기프트 시즌'],
  },
  {
    name: '스팀 개발자/퍼블리셔 세일',
    period: '수시 진행 (월 2~4회)',
    startDate: '2026-05-01',
    endDate: '2026-05-07',
    daysUntil: 10,
    avgDiscount: 35,
    confidence: 'low',
    description: '특정 개발사/퍼블리셔 단위로 진행. 캡콤, EA, 소니 등이 자주 참여.',
    tags: ['퍼블리셔별', '수시 진행', '예측 어려움'],
  },
];

const GAME_PREDICTIONS: GameSalePrediction[] = [
  {
    slug: 'monster-hunter-world',
    lastSaleDate: '2026-03-15',
    lastDiscountRate: 50,
    avgCycleDays: 42,
    nextPredictedDate: '2026-04-26',
    nextDaysUntil: 5,
    expectedDiscount: 50,
    confidence: 'high',
    saleTrend: 'frequent',
  },
  {
    slug: 'stardew-valley',
    lastSaleDate: '2026-03-19',
    lastDiscountRate: 40,
    avgCycleDays: 55,
    nextPredictedDate: '2026-05-13',
    nextDaysUntil: 22,
    expectedDiscount: 40,
    confidence: 'high',
    saleTrend: 'frequent',
  },
  {
    slug: 'helldivers-2',
    lastSaleDate: '2026-02-20',
    lastDiscountRate: 20,
    avgCycleDays: 60,
    nextPredictedDate: '2026-05-21',
    nextDaysUntil: 30,
    expectedDiscount: 25,
    confidence: 'medium',
    saleTrend: 'occasional',
  },
  {
    slug: 'elden-ring',
    lastSaleDate: '2026-01-10',
    lastDiscountRate: 10,
    avgCycleDays: 90,
    nextPredictedDate: '2026-06-26',
    nextDaysUntil: 66,
    expectedDiscount: 20,
    confidence: 'medium',
    saleTrend: 'occasional',
  },
  {
    slug: 'ea-fc-24',
    lastSaleDate: '2026-04-01',
    lastDiscountRate: 70,
    avgCycleDays: 30,
    nextPredictedDate: '2026-05-01',
    nextDaysUntil: 10,
    expectedDiscount: 70,
    confidence: 'high',
    saleTrend: 'frequent',
  },
  {
    slug: 'dark-and-darker',
    lastSaleDate: '2026-02-01',
    lastDiscountRate: 20,
    avgCycleDays: 120,
    nextPredictedDate: '2026-07-15',
    nextDaysUntil: 85,
    expectedDiscount: 20,
    confidence: 'low',
    saleTrend: 'rare',
  },
  {
    slug: 'spiritfarer',
    lastSaleDate: '2026-03-19',
    lastDiscountRate: 75,
    avgCycleDays: 45,
    nextPredictedDate: '2026-05-03',
    nextDaysUntil: 12,
    expectedDiscount: 75,
    confidence: 'high',
    saleTrend: 'frequent',
  },
  {
    slug: 'sun-haven',
    lastSaleDate: '2026-03-10',
    lastDiscountRate: 20,
    avgCycleDays: 50,
    nextPredictedDate: '2026-05-29',
    nextDaysUntil: 38,
    expectedDiscount: 25,
    confidence: 'medium',
    saleTrend: 'occasional',
  },
];

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
function confidenceLabel(c: 'high' | 'medium' | 'low') {
  if (c === 'high') return { text: '예측 신뢰도 높음', cls: 'bg-[#1a3d2b] text-[#3fd09d]' };
  if (c === 'medium') return { text: '예측 신뢰도 보통', cls: 'bg-[#3d330a] text-[#f0c040]' };
  return { text: '예측 신뢰도 낮음', cls: 'bg-[#3d1a22] text-[#ff7eb3]' };
}

function trendLabel(t: GameSalePrediction['saleTrend']) {
  if (t === 'frequent') return { text: '자주 할인', cls: 'text-[#3fd09d]' };
  if (t === 'occasional') return { text: '간헐적 할인', cls: 'text-[#f0c040]' };
  return { text: '할인 드묾', cls: 'text-[#ff7eb3]' };
}

function ddayText(days: number) {
  if (days < 0) return `${Math.abs(days)}일 전 종료`;
  if (days === 0) return 'D-day';
  return `D-${days}`;
}

function ddayColor(days: number) {
  if (days < 0) return 'text-white/30';
  if (days <= 7) return 'text-[#3fd09d]';
  if (days <= 30) return 'text-[#f0c040]';
  return 'text-white/60';
}

// ─────────────────────────────────────────────
// 세일 이벤트 카드
// ─────────────────────────────────────────────
function SaleEventCard({ event }: { event: SaleEvent }) {
  const conf = confidenceLabel(event.confidence);
  const isPast = event.daysUntil < 0;
  const isClose = event.daysUntil >= 0 && event.daysUntil <= 14;

  return (
    <div className={`rounded-2xl border p-4 transition ${
      isPast
        ? 'border-white/5 bg-white/[0.02] opacity-50'
        : isClose
        ? 'border-[#9b5cff]/50 bg-[#1e0f3f]'
        : 'border-white/8 bg-white/[0.03]'
    }`}>
      {/* 상단 */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {isClose && !isPast && (
              <span className="rounded-full bg-[#9b5cff]/20 px-2 py-0.5 text-[10px] font-bold text-[#c49fff]">
                임박
              </span>
            )}
            <span className="text-sm font-bold text-white">{event.name}</span>
          </div>
          <div className="mt-1 text-xs text-white/45">{event.period}</div>
        </div>
        <div className={`text-right text-lg font-black ${ddayColor(event.daysUntil)}`}>
          {ddayText(event.daysUntil)}
        </div>
      </div>

      {/* 평균 할인율 바 */}
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-[10px] text-white/40">
          <span>평균 할인율</span>
          <span className="font-semibold text-white/70">최대 -{event.avgDiscount}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            style={{ width: `${event.avgDiscount}%` }}
            className={`h-full rounded-full transition-all duration-700 ${
              isPast ? 'bg-white/20' : 'bg-gradient-to-r from-[#9b5cff] to-[#ff70ea]'
            }`}
          />
        </div>
      </div>

      {/* 설명 */}
      <p className="mb-3 text-xs leading-5 text-white/55">{event.description}</p>

      {/* 태그 + 신뢰도 */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${conf.cls}`}>
          {conf.text}
        </span>
        {event.tags.map((tag) => (
          <span key={tag} className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/45">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 게임별 할인 예측 행
// ─────────────────────────────────────────────
function GamePredictionRow({ pred, rank }: { pred: GameSalePrediction; rank: number }) {
  const game = games.find((g) => g.slug === pred.slug) ?? games[0];
  const conf = confidenceLabel(pred.confidence);
  const trend = trendLabel(pred.saleTrend);

  return (
    <Link
      href={`/predict/${pred.slug}`}
      className="grid grid-cols-[36px_100px_1fr_80px_80px_100px] items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3 transition hover:border-accent/70"
    >
      {/* 순위 */}
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#6e35dc] text-sm font-bold">
        {rank}
      </div>

      {/* 썸네일 */}
      <img
        src={getSteamHeader(game.steamAppId)}
        alt={game.title}
        className="h-14 w-full flex-shrink-0 rounded-lg object-cover"
      />

      {/* 게임 정보 */}
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">{game.title}</div>
        <div className="mt-1 flex items-center gap-2 text-xs text-white/45">
          <span>마지막 할인: {pred.lastSaleDate}</span>
          <span>·</span>
          <span>주기 약 {pred.avgCycleDays}일</span>
        </div>
        {/* 신뢰도 + 빈도 */}
        <div className="mt-1.5 flex flex-wrap gap-1">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${conf.cls}`}>
            {conf.text}
          </span>
          <span className={`text-[10px] font-semibold ${trend.cls}`}>
            {trend.text}
          </span>
        </div>
      </div>

      {/* 예상 할인율 */}
      <div className="flex-shrink-0 text-right">
        <div className="mb-0.5 text-[10px] text-white/40">예상 할인</div>
        <div className="text-sm font-black text-[#d3bcff]">-{pred.expectedDiscount}%</div>
        <div className="text-[10px] text-white/35 line-through">
          -{pred.lastDiscountRate}%
        </div>
      </div>

      {/* 예상 할인일 */}
      <div className="flex-shrink-0 text-right">
        <div className="mb-0.5 text-[10px] text-white/40">예상 할인일</div>
        <div className="text-xs font-semibold text-white/80">{pred.nextPredictedDate}</div>
      </div>

      {/* D-day */}
      <div className="flex-shrink-0 text-right">
        <div className={`text-xl font-black ${ddayColor(pred.nextDaysUntil)}`}>
          D-{pred.nextDaysUntil}
        </div>
        <Link
          href={`/predict/${pred.slug}`}
          className="mt-1 inline-block rounded-lg border border-white/10 bg-[#29134f] px-2 py-1 text-[10px] text-white/60 hover:border-accent/50"
          onClick={(e) => e.stopPropagation()}
        >
          상세 예측
        </Link>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────
type GameSortKey = 'dday' | 'discount' | 'confidence';

export function SalePredictPage() {
  const [gameSortKey, setGameSortKey] = useState<GameSortKey>('dday');

  const sortedPredictions = useMemo(() => {
    return [...GAME_PREDICTIONS].sort((a, b) => {
      if (gameSortKey === 'dday') return a.nextDaysUntil - b.nextDaysUntil;
      if (gameSortKey === 'discount') return b.expectedDiscount - a.expectedDiscount;
      // confidence: high > medium > low
      const score = (c: GameSalePrediction['confidence']) =>
        c === 'high' ? 3 : c === 'medium' ? 2 : 1;
      return score(b.confidence) - score(a.confidence);
    });
  }, [gameSortKey]);

  const upcomingEvents = SALE_EVENTS.filter((e) => e.daysUntil >= 0).slice(0, 3);
  const pastEvents = SALE_EVENTS.filter((e) => e.daysUntil < 0);

  const GAME_SORT_TABS: { key: GameSortKey; label: string }[] = [
    { key: 'dday', label: '할인 임박순' },
    { key: 'discount', label: '예상 할인율 순' },
    { key: 'confidence', label: '신뢰도 순' },
  ];

  return (
    <div className="space-y-6">

      {/* ── 섹션 1: 스팀 정기 세일 이벤트 ── */}
      <section className="panel p-5 md:p-6">
        <div className="mb-1 text-sm font-semibold text-[#f0b5ff]">Steam 정기 이벤트</div>
        <div className="mb-1 text-[28px] font-black tracking-tight text-white">
          세일 일정 예측
        </div>
        <div className="mb-6 text-sm text-white/50">
          과거 스팀 세일 패턴을 분석해 예상 일정을 제공합니다. 실제 일정은 Valve 공식 발표 기준입니다.
        </div>

        {/* 임박한 세일 */}
        <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/35">
          예정된 세일
        </div>
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          {upcomingEvents.map((event) => (
            <SaleEventCard key={event.name} event={event} />
          ))}
        </div>

        {/* 연간 세일 타임라인 */}
        <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/35">
          연간 세일 타임라인
        </div>
        <div className="relative mb-6 overflow-x-auto pb-2">
          {/* 타임라인 바 */}
          <div className="relative h-10 min-w-[600px]">
            <div className="absolute inset-y-[18px] left-0 right-0 h-0.5 bg-white/10" />
            {SALE_EVENTS.filter((e) => e.daysUntil >= 0).map((event) => {
              // 1월~12월 기준 월별 위치 계산
              const month = parseInt(event.startDate.split('-')[1]) - 1; // 0~11
              const pct = (month / 11) * 100;
              return (
                <div
                  key={event.name}
                  style={{ left: `${pct}%` }}
                  className="absolute -translate-x-1/2"
                >
                  <div className={`h-4 w-4 rounded-full border-2 ${
                    event.daysUntil <= 14
                      ? 'border-[#9b5cff] bg-[#9b5cff]'
                      : event.confidence === 'high'
                      ? 'border-[#3fd09d] bg-[#1a3d2b]'
                      : event.confidence === 'medium'
                      ? 'border-[#f0c040] bg-[#3d330a]'
                      : 'border-white/30 bg-white/10'
                  }`} />
                  <div className="mt-1 -translate-x-1/4 whitespace-nowrap text-[9px] text-white/40">
                    {event.name.replace('스팀 ', '')}
                  </div>
                </div>
              );
            })}
          </div>
          {/* 월 라벨 */}
          <div className="mt-4 flex min-w-[600px] justify-between text-[10px] text-white/25">
            {['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        {/* 지난 세일 */}
        {pastEvents.length > 0 && (
          <>
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/25">
              지난 세일
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {pastEvents.map((event) => (
                <SaleEventCard key={event.name} event={event} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── 섹션 2: 게임별 할인 시점 예측 ── */}
      <section className="panel p-5 md:p-6">
        <div className="mb-1 text-sm font-semibold text-[#f0b5ff]">게임별 분석</div>
        <div className="mb-1 text-[28px] font-black tracking-tight text-white">
          다음 할인 시점 예측
        </div>
        <div className="mb-5 text-sm text-white/50">
          각 게임의 과거 할인 주기와 패턴을 분석해 다음 할인 예상 시점을 보여줍니다.
        </div>

        {/* 정렬 탭 */}
        <div className="mb-5 flex flex-wrap gap-2">
          {GAME_SORT_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setGameSortKey(t.key)}
              className={`rounded-xl border px-3 py-1.5 text-xs transition ${
                gameSortKey === t.key
                  ? 'border-[#8d60ff] bg-[#6e35dc] text-white'
                  : 'border-white/10 bg-white/[0.03] text-white/50 hover:text-white/80'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 게임 목록 */}
        <div className="space-y-2">
          {sortedPredictions.map((pred, idx) => (
            <GamePredictionRow key={pred.slug} pred={pred} rank={idx + 1} />
          ))}
        </div>

        {/* 안내 */}
        <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 text-xs leading-6 text-white/35">
          현재 더미 데이터입니다. DB 연결 시 <code className="text-white/50">SALE_EVENTS</code>는 크롤링한 Steam 세일 뉴스로,{' '}
          <code className="text-white/50">GAME_PREDICTIONS</code>는 게임별 할인 이력 분석 결과로 교체하세요.
        </div>
      </section>
    </div>
  );
}
