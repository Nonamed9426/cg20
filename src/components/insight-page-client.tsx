'use client';

import { useState, useEffect, useMemo } from 'react';

const API_BASE = 'http://localhost:8000';

// ═══════════════════════════════════════════════════════════════════
//  타입 정의
// ═══════════════════════════════════════════════════════════════════
type GenreTrend    = { years: number[]; genres: string[]; matrix: number[][] };
type YearDiscount  = { year: number; avgDiscount: number; gameCount: number };
type FakeGame      = { gameId: number; name: string; score: number; grade: string; reason: string };
type CountryPrice  = { gameId: number; name: string; prices: { KRW?: number; USD?: number; JPY?: number } };
type ReviewStat    = { positive: number; negative: number; totalReviews: number; keywords: { text: string; weight: number; isPos: boolean }[] };
type GameItem      = { gameId: number; name: string; genres: string[] };

// ═══════════════════════════════════════════════════════════════════
//  유틸
// ═══════════════════════════════════════════════════════════════════
function formatKRW(n: number) { return `₩${n.toLocaleString()}`; }
function getSteamHeader(id: number) { return `https://cdn.akamai.steamstatic.com/steam/apps/${id}/header.jpg`; }

function calcRegression(data: YearDiscount[]) {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0, r: 0 };
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
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  const r = Math.sqrt(Math.abs(r2)) * (slope < 0 ? -1 : 1);
  return { slope, intercept, r2, r };
}

// ═══════════════════════════════════════════════════════════════════
//  공통 컴포넌트
// ═══════════════════════════════════════════════════════════════════
function LoadingBox() {
  return (
    <div className="flex h-32 items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#c084fc] border-t-transparent" />
    </div>
  );
}
function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl border border-red-400/20 bg-red-400/8 p-3 text-xs text-red-300">
      ⚠️ {msg}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  인사이트 ① — 연도별 장르 트렌드 히트맵
// ═══════════════════════════════════════════════════════════════════
function GenreHeatmap() {
  const [data, setData]       = useState<GenreTrend | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/insight/genre-trend`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError('장르 트렌드 데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const globalMax = data ? Math.max(...data.matrix.flat()) : 1;

  function cellColor(val: number) {
    const ratio = val / globalMax;
    if (ratio > 0.85) return '#9b5cff';
    if (ratio > 0.65) return '#c084fc';
    if (ratio > 0.45) return '#d8b4fe';
    if (ratio > 0.25) return 'rgba(216,180,254,0.25)';
    return 'rgba(255,255,255,0.04)';
  }
  function textColor(val: number) {
    return val / globalMax > 0.45 ? '#fff' : 'rgba(255,255,255,0.35)';
  }

  return (
    <div className="panel-soft p-5">
      <div className="mb-1 text-sm font-semibold text-white">① 연도별 장르 트렌드</div>
      <div className="mb-4 text-xs text-white/40">각 연도 전체 출시작 중 해당 장르 비율(%) — 히트맵</div>
      {loading && <LoadingBox />}
      {error && <ErrorBox msg={error} />}
      {data && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-[2px] text-center text-[11px]">
              <thead>
                <tr>
                  <th className="w-16 pb-1 text-left text-[10px] text-white/30">장르 \ 연도</th>
                  {data.years.map((y) => (
                    <th key={y} className="pb-1 text-[10px] font-normal text-white/40">{y}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.genres.map((genre, gi) => (
                  <tr key={genre}>
                    <td className="pr-2 text-left text-[10px] text-white/60">{genre}</td>
                    {data.matrix[gi].map((val, yi) => (
                      <td key={yi} className="rounded-[3px] py-[5px] font-semibold"
                        style={{ backgroundColor: cellColor(val), color: textColor(val) }}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] text-white/35">낮음</span>
            {['rgba(255,255,255,0.04)', 'rgba(216,180,254,0.25)', '#d8b4fe', '#c084fc', '#9b5cff'].map((c, i) => (
              <div key={i} className="h-3 w-6 rounded-sm" style={{ backgroundColor: c }} />
            ))}
            <span className="text-[10px] text-white/35">높음</span>
          </div>
          <div className="mt-3 rounded-xl border border-[#c084fc]/20 bg-[#c084fc]/8 p-3 text-xs text-[#e9d5ff]">
            💡 인디 장르는 꾸준히 증가 추세. 액션은 전 연도에 걸쳐 안정적으로 높은 비율 유지.
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  인사이트 ② — 출시연도 × 평균 할인율 산점도
// ═══════════════════════════════════════════════════════════════════
function ReleaseDiscountScatter() {
  const [data, setData]       = useState<YearDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/insight/release-discount`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError('할인율 데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const reg = useMemo(() => calcRegression(data), [data]);

  const svgW = 320, svgH = 180, padL = 38, padR = 12, padT = 12, padB = 28;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;
  const minYear    = data[0]?.year ?? 2010;
  const maxYear    = data[data.length - 1]?.year ?? 2024;
  const maxDiscount = Math.max(...data.map((d) => d.avgDiscount), 1);
  const maxCount    = Math.max(...data.map((d) => d.gameCount), 1);

  function toX(year: number) { return padL + ((year - minYear) / (maxYear - minYear || 1)) * plotW; }
  function toY(pct: number)  { return padT + plotH - (pct / maxDiscount) * plotH; }
  function toR(count: number){ return 3 + (count / maxCount) * 8; }

  const x1 = toX(minYear), y1 = toY(reg.slope * minYear + reg.intercept);
  const x2 = toX(maxYear), y2 = toY(reg.slope * maxYear + reg.intercept);

  return (
    <div className="panel-soft p-5">
      <div className="mb-1 text-sm font-semibold text-white">② 출시연도 × 평균 할인율</div>
      <div className="mb-3 text-xs text-white/40">오래된 게임일수록 더 많이 할인될까? — 산점도 (원 크기 = 게임 수)</div>
      {loading && <LoadingBox />}
      {error && <ErrorBox msg={error} />}
      {!loading && !error && data.length > 0 && (
        <>
          <div className="mb-3 flex gap-2 flex-wrap">
            <span className="rounded-full bg-[#c084fc]/15 px-3 py-0.5 text-xs text-[#c084fc]">r = {reg.r.toFixed(3)}</span>
            <span className="rounded-full bg-[#64ffc8]/15 px-3 py-0.5 text-xs text-emerald-400">R² = {reg.r2.toFixed(3)}</span>
            <span className="rounded-full bg-white/8 px-3 py-0.5 text-xs text-white/50">원 크기 = 게임 수</span>
          </div>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: 200 }}>
            {[0, 20, 40, 60].map((t) => (
              <g key={t}>
                <line x1={padL} y1={toY(t)} x2={svgW - padR} y2={toY(t)} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                <text x={padL - 4} y={toY(t) + 3} textAnchor="end" fontSize="7" fill="rgba(255,255,255,0.3)">{t}%</text>
              </g>
            ))}
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#64ffc8" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
            {data.map((d) => (
              <g key={d.year}>
                <circle cx={toX(d.year)} cy={toY(d.avgDiscount)} r={toR(d.gameCount)}
                  fill="#9b5cff" fillOpacity="0.7" stroke="#c084fc" strokeWidth="0.5" />
                <text x={toX(d.year)} y={toY(d.avgDiscount) - toR(d.gameCount) - 2}
                  textAnchor="middle" fontSize="6.5" fill="rgba(255,255,255,0.5)">{d.year}</text>
              </g>
            ))}
            <line x1={padL} y1={svgH - padB} x2={svgW - padR} y2={svgH - padB} stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
          </svg>
          <div className="mt-3 rounded-xl border border-[#c084fc]/20 bg-[#c084fc]/8 p-3 text-xs text-[#e9d5ff]">
            💡 {reg.r < -0.8
              ? '강한 음의 상관관계 — 출시가 오래될수록 할인율이 뚜렷하게 높아집니다.'
              : reg.r < -0.5
              ? '중간 음의 상관관계 — 오래된 게임일수록 할인 경향이 있습니다.'
              : '약한 상관관계 — 출시 연도만으로 할인율을 설명하기 어렵습니다.'}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  인사이트 ③ — 가짜 할인 의심 게임 순위
// ═══════════════════════════════════════════════════════════════════
function FakeDiscountRanking() {
  const [data, setData]       = useState<FakeGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/insight/fake-discount-ranking`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError('가짜 할인 데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const gradeColor: Record<string, string> = {
    '매우의심': '#ef4444', '약간의심': '#f97316', '주의': '#eab308', '정상': '#22c55e',
  };
  const gradeEmoji: Record<string, string> = {
    '매우의심': '🔴', '약간의심': '🟠', '주의': '🟡', '정상': '🟢',
  };

  return (
    <div className="panel-soft p-5">
      <div className="mb-1 text-sm font-semibold text-white">③ 가짜 할인 의심 게임 순위</div>
      <div className="mb-3 text-xs text-white/40">의심 점수 0~100점 (정가 인상·상시 할인·요요 패턴 등 종합) — 막대 그래프</div>
      {loading && <LoadingBox />}
      {error && <ErrorBox msg={error} />}
      {!loading && !error && (
        <>
          <div className="mb-3 flex flex-wrap gap-2">
            {Object.entries(gradeEmoji).map(([grade, emoji]) => (
              <span key={grade} className="flex items-center gap-1 text-[10px] text-white/50">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: gradeColor[grade] }} />
                {emoji} {grade}
              </span>
            ))}
          </div>
          <div className="space-y-2">
            {data.map((g) => (
              <div key={g.gameId}>
                <div className="mb-0.5 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-white/80">
                    {gradeEmoji[g.grade] ?? '⚪'} <span className="max-w-[160px] truncate">{g.name}</span>
                  </span>
                  <span className="font-bold" style={{ color: gradeColor[g.grade] ?? '#fff' }}>{g.score}점</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full"
                    style={{ width: `${g.score}%`, background: gradeColor[g.grade] ?? '#fff', opacity: 0.8 }} />
                </div>
                <div className="mt-0.5 text-[9px] text-white/30">{g.reason}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl border border-red-400/20 bg-red-400/8 p-3 text-xs text-red-300">
            💡 60점 이상은 구매 전 가격 히스토리를 반드시 확인하세요.
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  인사이트 ④ — 국가별 가격 비교 (레이더 차트)
// ═══════════════════════════════════════════════════════════════════
function CountryPriceRadar({ gameId }: { gameId: number }) {
  const [data, setData]       = useState<CountryPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    setLoading(true); setError('');
    fetch(`${API_BASE}/api/insight/country-price/${gameId}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => setError('가격 데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [gameId]);

  if (loading) return <div className="panel-soft p-5"><LoadingBox /></div>;
  if (error)   return <div className="panel-soft p-5"><ErrorBox msg={error} /></div>;
  if (!data)   return null;

  const KRW_RATE = 1376, JPY_RATE = 9.12;
  const krw    = data.prices.KRW ?? 0;
  const usdKrw = Math.round((data.prices.USD ?? 0) * KRW_RATE);
  const jpyKrw = Math.round((data.prices.JPY ?? 0) * JPY_RATE);
  const isFree = krw === 0 && usdKrw === 0 && jpyKrw === 0;

  const countries = [
    { label: '🇰🇷 한국', raw: `₩${krw.toLocaleString()}`,    krwEquiv: krw,    color: '#c084fc' },
    { label: '🇺🇸 미국', raw: `$${data.prices.USD ?? 0}`,     krwEquiv: usdKrw, color: '#60a5fa' },
    { label: '🇯🇵 일본', raw: `¥${data.prices.JPY ?? 0}`,     krwEquiv: jpyKrw, color: '#f472b6' },
  ];
  const maxKrw  = Math.max(...countries.map((c) => c.krwEquiv), 1);
  const minKrw  = Math.min(...countries.map((c) => c.krwEquiv));
  const cheapest = countries.find((c) => c.krwEquiv === minKrw)!;

  const cx = 90, cy = 90, maxR = 62;
  const angles = [-90, 30, 150];
  function polarToXY(deg: number, r: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  function radarPath(values: number[]) {
    const pts = values.map((v, i) => { const r = (v / maxKrw) * maxR; return polarToXY(angles[i], r); });
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
  }

  return (
    <div className="panel-soft p-5">
      <div className="mb-1 text-sm font-semibold text-white">④ 국가별 가격 비교</div>
      <div className="mb-4 text-xs text-white/40">KRW 환산 기준 (USD ×{KRW_RATE} / JPY ×{JPY_RATE}) — 레이더 차트</div>
      {isFree ? (
        <div className="py-8 text-center text-sm font-bold text-emerald-400">무료 게임입니다 🎮</div>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <svg viewBox="0 0 180 180" className="w-40 shrink-0">
            {[0.25, 0.5, 0.75, 1.0].map((lv) => {
              const pts = angles.map((a) => polarToXY(a, maxR * lv));
              const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
              return <path key={lv} d={d} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />;
            })}
            {angles.map((a, i) => { const pt = polarToXY(a, maxR); return <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />; })}
            <path d={radarPath(countries.map((c) => c.krwEquiv))} fill="rgba(155,92,255,0.2)" stroke="#9b5cff" strokeWidth="1.5" />
            {countries.map((c, i) => { const r = (c.krwEquiv / maxKrw) * maxR; const pt = polarToXY(angles[i], r); return <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill={c.color} />; })}
            {countries.map((c, i) => { const pt = polarToXY(angles[i], maxR + 15); return <text key={i} x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="rgba(255,255,255,0.6)">{c.label}</text>; })}
          </svg>
          <div className="flex-1 w-full space-y-3">
            {countries.map((c) => (
              <div key={c.label}>
                <div className="mb-0.5 flex justify-between text-xs">
                  <span className="text-white/70">{c.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-white/45">{c.raw}</span>
                    <span className="font-bold" style={{ color: c.color }}>{formatKRW(c.krwEquiv)}</span>
                    {c.krwEquiv === minKrw && !isFree && <span className="text-emerald-400">🏆</span>}
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full" style={{ width: `${(c.krwEquiv / maxKrw) * 100}%`, background: c.color, opacity: 0.75 }} />
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
//  인사이트 ⑤ — 리뷰 감성분석 (파이차트 + 워드클라우드)
// ═══════════════════════════════════════════════════════════════════
function ReviewSentiment({ gameId }: { gameId: number }) {
  const [data, setData]       = useState<ReviewStat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    setLoading(true); setError('');
    fetch(`${API_BASE}/api/insight/review-sentiment/${gameId}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => setError('리뷰 데이터가 없거나 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [gameId]);

  if (loading) return <div className="panel-soft p-5"><LoadingBox /></div>;
  if (error)   return <div className="panel-soft p-5"><ErrorBox msg={error} /></div>;
  if (!data)   return null;

  const circumference = 2 * Math.PI * 38;
  const posDash    = (data.positive / 100) * circumference;
  const isGod      = data.positive >= 80;
  const isDdong    = data.positive < 50;
  const label      = isGod ? '갓겜 🎮' : isDdong ? '똥겜 💩' : '보통';
  const labelColor = isGod ? '#64ffc8' : isDdong ? '#ef4444' : '#f59e0b';
  function fontSize(w: number) { return 10 + (w - 1) * 1.5; }

  return (
    <div className="panel-soft p-5">
      <div className="mb-1 text-sm font-semibold text-white">⑤ 리뷰 감성분석</div>
      <div className="mb-4 text-xs text-white/40">
        긍정/부정 비율 및 주요 키워드 — 파이차트 + 워드클라우드
        {data.totalReviews > 0 && <span className="ml-2 text-white/25">(총 {data.totalReviews.toLocaleString()}개 리뷰)</span>}
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative flex h-32 w-32 items-center justify-center">
            <svg viewBox="0 0 88 88" className="absolute inset-0 -rotate-90">
              <circle cx="44" cy="44" r="38" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
              <circle cx="44" cy="44" r="38" fill="none"
                stroke={labelColor} strokeWidth="10"
                strokeDasharray={`${posDash} ${circumference}`}
                strokeLinecap="butt" />
            </svg>
            <div className="z-10 text-center">
              <div className="text-2xl font-black" style={{ color: labelColor }}>{data.positive}%</div>
              <div className="text-[10px] text-white/50">긍정</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-base font-bold" style={{ color: labelColor }}>{label}</div>
            <div className="text-xs text-white/40">부정 {data.negative}%</div>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: labelColor }} />
              긍정 {data.positive}%
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-white/20" />
              부정 {data.negative}%
            </span>
          </div>
        </div>
        <div>
          <div className="mb-2 text-xs text-white/50">주요 리뷰 키워드</div>
          <div className="flex min-h-[100px] flex-wrap items-end gap-2">
            {data.keywords.map((kw) => (
              <span key={kw.text} className="rounded-lg px-2 py-0.5 font-bold"
                style={{
                  fontSize: `${fontSize(kw.weight)}px`,
                  color: kw.isPos ? '#64ffc8' : '#f87171',
                  background: kw.isPos ? 'rgba(100,255,200,0.08)' : 'rgba(248,113,113,0.08)',
                  border: `1px solid ${kw.isPos ? 'rgba(100,255,200,0.2)' : 'rgba(248,113,113,0.2)'}`,
                }}>
                {kw.text}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-white/35">
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-400" /> 긍정 키워드</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-red-400" /> 부정 키워드</span>
            <span>글자 크기 = 언급 빈도</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  메인 컴포넌트
// ═══════════════════════════════════════════════════════════════════
export default function InsightPageClient() {
  const [gameList, setGameList]         = useState<GameItem[]>([]);
  const [selectedId, setSelectedId]     = useState<number>(0);
  const [searchQuery, setSearchQuery]   = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/games?limit=200`)
      .then((r) => r.json())
      .then((data: GameItem[]) => {
        setGameList(data);
        if (data.length > 0) setSelectedId(data[0].gameId);
      })
      .catch(() => {});
  }, []);

  const filteredGames = useMemo(
    () => gameList.filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [gameList, searchQuery],
  );
  const selectedGame = useMemo(
    () => gameList.find((g) => g.gameId === selectedId),
    [gameList, selectedId],
  );

  return (
    <div className="space-y-6">
      {/* ── 헤더 ── */}
      <div>
        <div className="flex items-center gap-2">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c084fc', boxShadow: '0 0 10px #c084fc' }} />
          <h1 style={{
            fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800,
            background: 'linear-gradient(90deg, #c084fc, #f472b6, #818cf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', margin: 0,
          }}>
            데이터 인사이트
          </h1>
        </div>
        <p className="mt-1 text-sm text-white/50">
          장르 트렌드 · 할인 패턴 분석 · 가짜 할인 추적 · 국가별 가격 비교 · 리뷰 감성분석
        </p>
      </div>

      {/* ── ① ② 전역 인사이트 ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><GenreHeatmap /></div>
        <div className="md:col-span-2"><ReleaseDiscountScatter /></div>
      </div>

      {/* ── ③ 가짜 할인 순위 ── */}
      <FakeDiscountRanking />

      {/* ── 게임 선택 (④ ⑤) ── */}
      <div className="panel p-5">
        <div className="mb-1 text-sm font-semibold text-white">게임별 인사이트</div>
        <div className="mb-3 text-xs text-white/40">④ 국가별 가격 비교, ⑤ 리뷰 감성분석은 게임별로 확인할 수 있어요</div>
        <div className="relative">
          <div
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-[#1a1033] p-3 transition hover:border-[#c084fc]/50"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {selectedGame && (
              <img src={getSteamHeader(selectedGame.gameId)} alt={selectedGame.name}
                className="h-10 w-16 rounded-lg object-cover" />
            )}
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">{selectedGame?.name ?? '게임 선택 중...'}</div>
              <div className="text-xs text-white/45">{selectedGame?.genres.join(' · ') ?? ''}</div>
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
                    key={g.gameId}
                    className={`flex cursor-pointer items-center gap-3 px-3 py-2 transition hover:bg-white/5 ${selectedId === g.gameId ? 'bg-[#c084fc]/10' : ''}`}
                    onClick={() => { setSelectedId(g.gameId); setDropdownOpen(false); setSearchQuery(''); }}
                  >
                    <img src={getSteamHeader(g.gameId)} alt={g.name} className="h-8 w-12 rounded object-cover" />
                    <div>
                      <div className="text-sm text-white">{g.name}</div>
                      <div className="text-xs text-white/40">{g.genres.join(' · ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── ④ ⑤ 게임별 인사이트 ── */}
      {selectedId > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <CountryPriceRadar gameId={selectedId} />
          <ReviewSentiment gameId={selectedId} />
        </div>
      )}
    </div>
  );
}
