'use client';

import { useState, useMemo } from 'react';
import { games, getSteamHeader } from '@/lib/data';
import type { Game } from '@/lib/data';

// ═══════════════════════════════════════════════════════════════════
//  더미 데이터 (FastAPI 연결 후 각 주석의 endpoint로 교체)
// ═══════════════════════════════════════════════════════════════════

// ── 1. 연도별 장르 트렌드 히트맵 ──────────────────────────────────
// 교체: GET /api/insight/genre-trend  →  { years, genres, matrix }
const GENRE_YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
const GENRE_LABELS = ['액션', 'RPG', '인디', '전략', '시뮬', '어드벤처', '스포츠', '공포', '퍼즐', '캐주얼'];
// matrix[genre][year] = 해당 연도 전체 대비 해당 장르 출시 비율 (%)
const GENRE_MATRIX: number[][] = [
  [18, 20, 22, 21, 19, 17, 18, 20, 22, 21], // 액션
  [10, 11, 13, 15, 14, 12, 13, 14, 15, 13], // RPG
  [20, 22, 25, 27, 28, 30, 32, 33, 31, 29], // 인디
  [9,  8,  7,  8,  9,  8,  7,  6,  7,  8],  // 전략
  [7,  8,  9,  8,  7,  9, 10, 11, 10,  9],  // 시뮬
  [8,  9, 10, 10,  9, 10,  9,  8,  9, 10],  // 어드벤처
  [5,  5,  4,  4,  5,  4,  3,  3,  4,  5],  // 스포츠
  [4,  4,  5,  5,  6,  7,  6,  5,  5,  6],  // 공포
  [6,  5,  4,  5,  6,  5,  4,  4,  5,  6],  // 퍼즐
  [8,  7,  8,  8,  7,  8,  7,  6,  7,  8],  // 캐주얼
];

// ── 2. 출시연도 × 평균 할인율 산점도 ──────────────────────────────
// 교체: GET /api/insight/release-discount  →  { year, avgDiscount, gameCount }[]
type YearDiscount = { year: number; avgDiscount: number; gameCount: number };
const DUMMY_RELEASE_DISCOUNT: YearDiscount[] = [
  { year: 2010, avgDiscount: 62.4, gameCount: 120 },
  { year: 2011, avgDiscount: 59.8, gameCount: 198 },
  { year: 2012, avgDiscount: 57.3, gameCount: 312 },
  { year: 2013, avgDiscount: 55.1, gameCount: 487 },
  { year: 2014, avgDiscount: 52.7, gameCount: 892 },
  { year: 2015, avgDiscount: 49.2, gameCount: 1423 },
  { year: 2016, avgDiscount: 45.8, gameCount: 2187 },
  { year: 2017, avgDiscount: 41.3, gameCount: 3241 },
  { year: 2018, avgDiscount: 36.9, gameCount: 4102 },
  { year: 2019, avgDiscount: 31.4, gameCount: 5231 },
  { year: 2020, avgDiscount: 25.8, gameCount: 6891 },
  { year: 2021, avgDiscount: 19.2, gameCount: 7234 },
  { year: 2022, avgDiscount: 13.6, gameCount: 8102 },
  { year: 2023, avgDiscount: 8.1,  gameCount: 9341 },
  { year: 2024, avgDiscount: 3.2,  gameCount: 7823 },
];

// ── 3. 가짜 할인 의심 게임 순위 ────────────────────────────────────
// 교체: GET /api/insight/fake-discount-ranking  →  { name, score, grade, reason }[]
type FakeGame = { name: string; score: number; grade: '🔴' | '🟠' | '🟡' | '🟢'; reason: string };
const DUMMY_FAKE_GAMES: FakeGame[] = [
  { name: 'Cyberpunk 2077',     score: 82, grade: '🔴', reason: '출시 후 정가 2회 인상 후 할인' },
  { name: 'ELDEN RING',         score: 71, grade: '🔴', reason: '상시 20% 할인 (출시 후 600일+)' },
  { name: 'GTA V',              score: 68, grade: '🟠', reason: '요요 가격 패턴 4회 감지' },
  { name: 'Dead by Daylight',   score: 55, grade: '🟠', reason: 'DLC 묶음 정가 인상 패턴' },
  { name: 'Stardew Valley',     score: 28, grade: '🟡', reason: '할인 빈도 높으나 정가 유지' },
  { name: 'PUBG',               score: 19, grade: '🟡', reason: '정기 세일만 적용됨' },
  { name: 'Hollow Knight',      score: 5,  grade: '🟢', reason: '정상 할인 패턴' },
  { name: 'Deep Rock Galactic', score: 3,  grade: '🟢', reason: '정상 할인 패턴' },
];

// ── 5. 리뷰 감성분석 ──────────────────────────────────────────────
// 교체: GET /api/insight/review-sentiment?gameId={id}  →  { positive, negative, keywords }
type ReviewStat = { positive: number; negative: number; keywords: { text: string; weight: number; isPos: boolean }[] };
const DUMMY_REVIEWS: Record<number, ReviewStat> = {
  413150: {
    positive: 96, negative: 4,
    keywords: [
      { text: '힐링', weight: 9, isPos: true }, { text: '명작', weight: 8, isPos: true },
      { text: '중독성', weight: 8, isPos: true }, { text: '귀여움', weight: 7, isPos: true },
      { text: '음악', weight: 7, isPos: true }, { text: '반복', weight: 5, isPos: false },
      { text: '느린속도', weight: 4, isPos: false }, { text: '가격', weight: 6, isPos: true },
      { text: '업데이트', weight: 6, isPos: true }, { text: '멀티', weight: 5, isPos: true },
    ],
  },
  1245620: {
    positive: 94, negative: 6,
    keywords: [
      { text: '갓겜', weight: 9, isPos: true }, { text: '난이도', weight: 7, isPos: false },
      { text: '전투', weight: 8, isPos: true }, { text: '오픈월드', weight: 8, isPos: true },
      { text: '보스', weight: 7, isPos: true }, { text: '버그', weight: 5, isPos: false },
      { text: '스토리', weight: 6, isPos: true }, { text: '그래픽', weight: 7, isPos: true },
    ],
  },
  582010: {
    positive: 90, negative: 10,
    keywords: [
      { text: '멀티', weight: 9, isPos: true }, { text: '협력', weight: 8, isPos: true },
      { text: '핵유저', weight: 6, isPos: false }, { text: '스킨', weight: 5, isPos: false },
      { text: '배틀로얄', weight: 7, isPos: true }, { text: '최적화', weight: 6, isPos: false },
      { text: '긴장감', weight: 8, isPos: true }, { text: '무료', weight: 7, isPos: true },
    ],
  },
};
function getDefaultReview(game: Game): ReviewStat {
  return {
    positive: game.score, negative: 100 - game.score,
    keywords: [
      { text: '재미', weight: 8, isPos: true }, { text: '추천', weight: 7, isPos: true },
      { text: '그래픽', weight: 6, isPos: true }, { text: '스토리', weight: 6, isPos: true },
      { text: '버그', weight: 4, isPos: false }, { text: '가격', weight: 5, isPos: true },
    ],
  };
}

// ═══════════════════════════════════════════════════════════════════
//  유틸
// ═══════════════════════════════════════════════════════════════════
function formatKRW(n: number) { return `₩${n.toLocaleString()}`; }

function calcRegression(data: { year: number; avgDiscount: number }[]) {
  const n = data.length;
  const xs = data.map((d) => d.year);
  const ys = data.map((d) => d.avgDiscount);
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const sumX2 = xs.reduce((a, x) => a + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const yMean = sumY / n;
  const ssTot = ys.reduce((a, y) => a + (y - yMean) ** 2, 0);
  const ssRes = ys.reduce((a, y, i) => a + (y - (slope * xs[i] + intercept)) ** 2, 0);
  const r2 = 1 - ssRes / ssTot;
  const r = Math.sqrt(r2) * (slope < 0 ? -1 : 1);
  return { slope, intercept, r2, r };
}

// ═══════════════════════════════════════════════════════════════════
//  인사이트 1 — 연도별 장르 트렌드 히트맵
// ═══════════════════════════════════════════════════════════════════
function GenreHeatmap() {
  const globalMax = Math.max(...GENRE_MATRIX.flat());

  function cellColor(val: number) {
    const ratio = val / globalMax;
    if (ratio > 0.85) return '#9b5cff';
    if (ratio > 0.65) return '#c084fc';
    if (ratio > 0.45) return '#d8b4fe';
    if (ratio > 0.25) return 'rgba(216,180,254,0.25)';
    return 'rgba(255,255,255,0.04)';
  }
  function textColor(val: number) {
    const ratio = val / globalMax;
    return ratio > 0.45 ? '#fff' : 'rgba(255,255,255,0.35)';
  }

  return (
    <div className="panel-soft p-5">
      <div className="mb-1 text-sm font-semibold text-white">① 연도별 장르 트렌드</div>
      <div className="mb-4 text-xs text-white/40">각 연도 전체 출시작 중 해당 장르 비율(%) — 히트맵</div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-[2px] text-center text-[11px]">
          <thead>
            <tr>
              <th className="w-16 pb-1 text-left text-[10px] text-white/30">장르 \ 연도</th>
              {GENRE_YEARS.map((y) => (
                <th key={y} className="pb-1 text-[10px] font-normal text-white/40">{y}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GENRE_LABELS.map((genre, gi) => (
              <tr key={genre}>
                <td className="pr-2 text-left text-[10px] text-white/60">{genre}</td>
                {GENRE_MATRIX[gi].map((val, yi) => (
                  <td
                    key={yi}
                    className="rounded-[3px] py-[5px] font-semibold"
                    style={{ backgroundColor: cellColor(val), color: textColor(val) }}
                  >
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 범례 */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[10px] text-white/35">낮음</span>
        {['rgba(255,255,255,0.04)', 'rgba(216,180,254,0.25)', '#d8b4fe', '#c084fc', '#9b5cff'].map((c, i) => (
          <div key={i} className="h-3 w-6 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span className="text-[10px] text-white/35">높음</span>
      </div>

      <div className="mt-3 rounded-xl border border-[#c084fc]/20 bg-[#c084fc]/8 p-3 text-xs text-[#e9d5ff]">
        💡 인디 장르는 2015년 이후 꾸준히 증가 추세. 액션은 전 연도에 걸쳐 안정적으로 높은 비율 유지.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  인사이트 2 — 출시연도 × 평균 할인율 산점도
// ═══════════════════════════════════════════════════════════════════
function ReleaseDiscountScatter() {
  const data = DUMMY_RELEASE_DISCOUNT;
  const { slope, intercept, r, r2 } = calcRegression(data);

  const svgW = 320, svgH = 180, padL = 38, padR = 12, padT = 12, padB = 28;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const minYear = data[0].year, maxYear = data[data.length - 1].year;
  const maxDiscount = Math.max(...data.map((d) => d.avgDiscount));
  const maxCount = Math.max(...data.map((d) => d.gameCount));

  function toX(year: number) { return padL + ((year - minYear) / (maxYear - minYear)) * plotW; }
  function toY(pct: number)  { return padT + plotH - (pct / maxDiscount) * plotH; }
  function toR(count: number){ return 3 + (count / maxCount) * 8; }

  const x1 = toX(minYear),   y1 = toY(slope * minYear + intercept);
  const x2 = toX(maxYear),   y2 = toY(slope * maxYear + intercept);
  const yTicks = [0, 20, 40, 60];

  return (
    <div className="panel-soft p-5">
      <div className="mb-1 text-sm font-semibold text-white">② 출시연도 × 평균 할인율</div>
      <div className="mb-3 text-xs text-white/40">오래된 게임일수록 더 많이 할인될까? — 산점도 (원 크기 = 게임 수)</div>

      <div className="mb-3 flex gap-2 flex-wrap">
        <span className="rounded-full bg-[#c084fc]/15 px-3 py-0.5 text-xs text-[#c084fc]">r = {r.toFixed(3)}</span>
        <span className="rounded-full bg-[#64ffc8]/15 px-3 py-0.5 text-xs text-emerald-400">R² = {r2.toFixed(3)}</span>
        <span className="rounded-full bg-white/8 px-3 py-0.5 text-xs text-white/50">원 크기 = 게임 수</span>
      </div>

      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: 200 }}>
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={padL} y1={toY(t)} x2={svgW - padR} y2={toY(t)}
              stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            <text x={padL - 4} y={toY(t) + 3} textAnchor="end" fontSize="7" fill="rgba(255,255,255,0.3)">{t}%</text>
          </g>
        ))}
        <line x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#64ffc8" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
        {data.map((d) => (
          <g key={d.year}>
            <circle cx={toX(d.year)} cy={toY(d.avgDiscount)} r={toR(d.gameCount)}
              fill="#9b5cff" fillOpacity="0.7" stroke="#c084fc" strokeWidth="0.5" />
            <text x={toX(d.year)} y={toY(d.avgDiscount) - toR(d.gameCount) - 2}
              textAnchor="middle" fontSize="6.5" fill="rgba(255,255,255,0.5)">{d.year}</text>
          </g>
        ))}
        <line x1={padL} y1={svgH - padB} x2={svgW - padR} y2={svgH - padB}
          stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
      </svg>

      <div className="mt-3 rounded-xl border border-[#c084fc]/20 bg-[#c084fc]/8 p-3 text-xs text-[#e9d5ff]">
        💡 {r < -0.8
          ? '강한 음의 상관관계 — 출시가 오래될수록 할인율이 뚜렷하게 높아집니다.'
          : r < -0.5
          ? '중간 음의 상관관계 — 오래된 게임일수록 할인 경향이 있습니다.'
          : '약한 상관관계 — 출시 연도만으로 할인율을 설명하기 어렵습니다.'}
      </div>
      <div className="mt-1 text-[10px] text-white/25">
        * 더미 데이터 — FastAPI 연결 후 <code className="text-white/35">/api/insight/release-discount</code> 로 교체
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  인사이트 3 — 가짜 할인 의심 게임 순위 (막대 그래프)
// ═══════════════════════════════════════════════════════════════════
function FakeDiscountRanking() {
  const gradeColor: Record<string, string> = {
    '🔴': '#ef4444', '🟠': '#f97316', '🟡': '#eab308', '🟢': '#22c55e',
  };
  const gradeLabel: Record<string, string> = {
    '🔴': '매우 의심', '🟠': '약간 의심', '🟡': '주의', '🟢': '정상',
  };

  return (
    <div className="panel-soft p-5">
      <div className="mb-1 text-sm font-semibold text-white">③ 가짜 할인 의심 게임 순위</div>
      <div className="mb-3 text-xs text-white/40">의심 점수 0~100점 (정가 인상·상시 할인·요요 패턴 등 종합) — 막대 그래프</div>

      <div className="mb-3 flex flex-wrap gap-2">
        {Object.entries(gradeLabel).map(([emoji, label]) => (
          <span key={emoji} className="flex items-center gap-1 text-[10px] text-white/50">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: gradeColor[emoji] }} />
            {emoji} {label}
          </span>
        ))}
      </div>

      <div className="space-y-2">
        {DUMMY_FAKE_GAMES.map((g) => (
          <div key={g.name}>
            <div className="mb-0.5 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-white/80">
                {g.grade} <span className="max-w-[160px] truncate">{g.name}</span>
              </span>
              <span className="font-bold" style={{ color: gradeColor[g.grade] }}>{g.score}점</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/8">
              <div className="h-full rounded-full"
                style={{ width: `${g.score}%`, background: gradeColor[g.grade], opacity: 0.8 }} />
            </div>
            <div className="mt-0.5 text-[9px] text-white/30">{g.reason}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-red-400/20 bg-red-400/8 p-3 text-xs text-red-300">
        💡 60점 이상은 구매 전 가격 히스토리를 반드시 확인하세요.
      </div>
      <div className="mt-1 text-[10px] text-white/25">
        * 더미 데이터 — FastAPI 연결 후 <code className="text-white/35">/api/insight/fake-discount-ranking</code> 로 교체
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  인사이트 4 — 국가별 가격 비교 (레이더 차트)
// ═══════════════════════════════════════════════════════════════════
function CountryPriceRadar({ game }: { game: Game }) {
  const isFree = game.priceKRW === 0;
  const krw = game.priceKRW;
  const usdKrw = Math.round(parseFloat(game.prices.us.replace('$', '').replace('Free', '0')) * 1376);
  const jpyKrw = Math.round(parseFloat(game.prices.jp.replace('¥', '').replace(',', '').replace('무료', '0')) * 9.12);

  const countries = [
    { label: '🇰🇷 한국', raw: game.prices.kr, krwEquiv: krw,    color: '#c084fc' },
    { label: '🇺🇸 미국', raw: game.prices.us, krwEquiv: usdKrw, color: '#60a5fa' },
    { label: '🇯🇵 일본', raw: game.prices.jp, krwEquiv: jpyKrw, color: '#f472b6' },
  ];
  const maxKrw = Math.max(...countries.map((c) => c.krwEquiv)) || 1;
  const minKrw = Math.min(...countries.map((c) => c.krwEquiv));
  const cheapest = countries.find((c) => c.krwEquiv === minKrw)!;

  const cx = 90, cy = 90, maxR = 62;
  const angles = [-90, 30, 150];
  function polarToXY(deg: number, r: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const axisPoints = angles.map((a) => polarToXY(a, maxR));

  function radarPath(values: number[]) {
    const pts = values.map((v, i) => {
      const r = (v / maxKrw) * maxR;
      return polarToXY(angles[i], r);
    });
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
  }

  return (
    <div className="panel-soft p-5">
      <div className="mb-1 text-sm font-semibold text-white">④ 국가별 가격 비교</div>
      <div className="mb-4 text-xs text-white/40">KRW 환산 기준 (USD ×1,376 / JPY ×9.12) — 레이더 차트</div>

      {isFree ? (
        <div className="py-8 text-center text-sm font-bold text-emerald-400">무료 게임입니다 🎮</div>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <svg viewBox="0 0 180 180" className="w-40 shrink-0">
            {gridLevels.map((lv) => {
              const pts = angles.map((a) => polarToXY(a, maxR * lv));
              const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
              return <path key={lv} d={d} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />;
            })}
            {axisPoints.map((pt, i) => (
              <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y}
                stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
            ))}
            <path d={radarPath(countries.map((c) => c.krwEquiv))}
              fill="rgba(155,92,255,0.2)" stroke="#9b5cff" strokeWidth="1.5" />
            {countries.map((c, i) => {
              const r = (c.krwEquiv / maxKrw) * maxR;
              const pt = polarToXY(angles[i], r);
              return <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill={c.color} />;
            })}
            {countries.map((c, i) => {
              const pt = polarToXY(angles[i], maxR + 15);
              return (
                <text key={i} x={pt.x} y={pt.y} textAnchor="middle"
                  dominantBaseline="middle" fontSize="8" fill="rgba(255,255,255,0.6)">
                  {c.label}
                </text>
              );
            })}
          </svg>

          <div className="flex-1 w-full space-y-3">
            {countries.map((c) => (
              <div key={c.label}>
                <div className="mb-0.5 flex justify-between text-xs">
                  <span className="text-white/70">{c.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-white/45">{c.raw}</span>
                    <span className="font-bold" style={{ color: c.color }}>{formatKRW(c.krwEquiv)}</span>
                    {c.krwEquiv === minKrw && <span className="text-emerald-400">🏆</span>}
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full"
                    style={{ width: `${(c.krwEquiv / maxKrw) * 100}%`, background: c.color, opacity: 0.75 }} />
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/8 p-2 text-xs text-emerald-300">
              {cheapest.label} 구매가 가장 저렴해요 ({formatKRW(minKrw)})
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  인사이트 5 — 리뷰 감성분석 (파이차트 + 워드클라우드)
// ═══════════════════════════════════════════════════════════════════
function ReviewSentiment({ review }: { review: ReviewStat }) {
  const circumference = 2 * Math.PI * 38;
  const posDash = (review.positive / 100) * circumference;
  const isGod   = review.positive >= 80;
  const isDdong = review.positive < 50;
  const label      = isGod ? '갓겜 🎮' : isDdong ? '똥겜 💩' : '보통';
  const labelColor = isGod ? '#64ffc8' : isDdong ? '#ef4444' : '#f59e0b';

  function fontSize(w: number) { return 10 + (w - 1) * 1.5; }

  return (
    <div className="panel-soft p-5">
      <div className="mb-1 text-sm font-semibold text-white">⑤ 리뷰 감성분석</div>
      <div className="mb-4 text-xs text-white/40">긍정/부정 비율 및 주요 키워드 — 파이차트 + 워드클라우드</div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* 도넛 파이차트 */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative flex h-32 w-32 items-center justify-center">
            <svg viewBox="0 0 88 88" className="absolute inset-0 -rotate-90">
              <circle cx="44" cy="44" r="38" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
              <circle cx="44" cy="44" r="38" fill="none"
                stroke={labelColor} strokeWidth="10"
                strokeDasharray={`${posDash} ${circumference}`}
                strokeLinecap="butt"
              />
            </svg>
            <div className="z-10 text-center">
              <div className="text-2xl font-black" style={{ color: labelColor }}>{review.positive}%</div>
              <div className="text-[10px] text-white/50">긍정</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-base font-bold" style={{ color: labelColor }}>{label}</div>
            <div className="text-xs text-white/40">부정 {review.negative}%</div>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: labelColor }} />
              긍정 {review.positive}%
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-white/20" />
              부정 {review.negative}%
            </span>
          </div>
        </div>

        {/* 워드클라우드 */}
        <div>
          <div className="mb-2 text-xs text-white/50">주요 리뷰 키워드</div>
          <div className="flex min-h-[100px] flex-wrap items-end gap-2">
            {review.keywords.map((kw) => (
              <span
                key={kw.text}
                className="rounded-lg px-2 py-0.5 font-bold"
                style={{
                  fontSize: `${fontSize(kw.weight)}px`,
                  color:  kw.isPos ? '#64ffc8' : '#f87171',
                  background: kw.isPos ? 'rgba(100,255,200,0.08)' : 'rgba(248,113,113,0.08)',
                  border: `1px solid ${kw.isPos ? 'rgba(100,255,200,0.2)' : 'rgba(248,113,113,0.2)'}`,
                }}
              >
                {kw.text}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-white/35">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" /> 긍정 키워드
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-red-400" /> 부정 키워드
            </span>
            <span>글자 크기 = 언급 빈도</span>
          </div>
        </div>
      </div>

      <div className="mt-3 text-[10px] text-white/25">
        * 더미 데이터 — FastAPI 연결 후 <code className="text-white/35">/api/insight/review-sentiment?gameId={'{id}'}</code> 로 교체
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  메인 컴포넌트
// ═══════════════════════════════════════════════════════════════════
export default function InsightPageClient() {
  const [selectedId, setSelectedId]     = useState<number>(games[0].steamAppId);
  const [searchQuery, setSearchQuery]   = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredGames = useMemo(
    () => games.filter((g) => g.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery],
  );
  const selectedGame = useMemo(
    () => games.find((g) => g.steamAppId === selectedId) ?? games[0],
    [selectedId],
  );
  const reviewStat = DUMMY_REVIEWS[selectedId] ?? getDefaultReview(selectedGame);

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
          장르 트렌드 · 할인 패턴 분석 · 가짜 할인 추적 · 국가별 가격 비교 · 리뷰 감성분석
        </p>
      </div>

      {/* ── ① ② 전역 인사이트 (게임 선택 불필요) ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><GenreHeatmap /></div>
        <div className="md:col-span-2"><ReleaseDiscountScatter /></div>
      </div>

      {/* ── ③ 가짜 할인 (전역 순위) ── */}
      <FakeDiscountRanking />

      {/* ── 게임 선택 구분선 (④ ⑤ 게임별 인사이트) ── */}
      <div className="panel p-5">
        <div className="mb-1 text-sm font-semibold text-white">게임별 인사이트</div>
        <div className="mb-3 text-xs text-white/40">④ 국가별 가격 비교, ⑤ 리뷰 감성분석은 게임별로 확인할 수 있어요</div>
        <div className="relative">
          <div
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-[#1a1033] p-3 transition hover:border-[#c084fc]/50"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <img src={getSteamHeader(selectedGame.steamAppId)} alt={selectedGame.title}
              className="h-10 w-16 rounded-lg object-cover" />
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

      {/* ── ④ ⑤ 게임별 인사이트 ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <CountryPriceRadar game={selectedGame} />
        <ReviewSentiment review={reviewStat} />
      </div>

      {/* DB 연결 안내 */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 text-xs leading-6 text-white/35">
        현재 더미 데이터입니다. FastAPI 연결 후{' '}
        <code className="text-white/50">games</code>,{' '}
        <code className="text-white/50">game_price_history</code>,{' '}
        <code className="text-white/50">game_reviews</code> 테이블을 각 API endpoint로 교체하세요.
      </div>
    </div>
  );
}
