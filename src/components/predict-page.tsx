'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Game, getSteamHeader } from '@/lib/data';
import { API_BASE } from '@/lib/api';
import { useExchange } from '@/lib/exchange-context';

// ═══════════════════════════════════════════════════════
//  타입
// ═══════════════════════════════════════════════════════
type HistoryItem = {
  date: string;
  price: number;
  regular_price: number;
  discount_percent: number;
};

type PriceDetail = {
  analysis: {
    latest_price: number;
    lowest_price: number;
    is_lowest: boolean;
    buying_advice: string;
  };
  history: HistoryItem[];
};

type PriceData = {
  KRW: number;
  USD: number;
  JPY: number;
};

// ═══════════════════════════════════════════════════════
//  유틸
// ═══════════════════════════════════════════════════════
function formatKRW(n: number) { return `₩${n.toLocaleString()}`; }

function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function ddayText(days: number) {
  if (days === 0) return 'D-day';
  if (days < 0)   return `${Math.abs(days)}일 전`;
  return `D-${days}`;
}
function ddayColor(days: number) {
  if (days <= 7)  return 'text-emerald-400';
  if (days <= 30) return 'text-amber-400';
  return 'text-white/60';
}

// 할인 이력에서 다음 예상 할인일 계산
function calcNextPredicted(history: HistoryItem[]): { date: string | null; avgCycleDays: number | null; lastSaleDate: string | null } {
  const sales = history.filter((h) => h.discount_percent > 0);
  if (sales.length === 0) return { date: null, avgCycleDays: null, lastSaleDate: null };

  const lastSaleDate = sales[0].date;

  if (sales.length < 2) return { date: null, avgCycleDays: null, lastSaleDate };

  // 할인 시작일끼리 간격 계산
  const gaps: number[] = [];
  for (let i = 0; i < sales.length - 1; i++) {
    const a = parseDate(sales[i].date);
    const b = parseDate(sales[i + 1].date);
    const diff = Math.abs(Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)));
    if (diff > 0) gaps.push(diff);
  }
  if (gaps.length === 0) return { date: null, avgCycleDays: null, lastSaleDate };

  const avgCycleDays = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
  const lastDate = parseDate(lastSaleDate);
  lastDate.setDate(lastDate.getDate() + avgCycleDays);
  const nextDate = lastDate.toISOString().split('T')[0];

  return { date: nextDate, avgCycleDays, lastSaleDate };
}

// ═══════════════════════════════════════════════════════
//  할인 예측 캘린더
// ═══════════════════════════════════════════════════════
function DiscountCalendar({ history, nextPredictedDate }: {
  history: HistoryItem[];
  nextPredictedDate: string | null;
}) {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // 할인 있던 날짜 set
  const historyDates = useMemo(() => {
    return new Set(history.filter((h) => h.discount_percent > 0).map((h) => h.date));
  }, [history]);

  const predictedDate = nextPredictedDate ? parseDate(nextPredictedDate) : null;

  function cellType(day: number) {
    const isToday = viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();
    const isPred  = predictedDate
      && predictedDate.getFullYear() === viewYear
      && predictedDate.getMonth()    === viewMonth
      && predictedDate.getDate()     === day;
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (isToday) return 'today';
    if (isPred)  return 'predicted';
    if (historyDates.has(dateStr)) return 'history';
    return 'normal';
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className="rounded-[28px] border border-[#7b55d0]/60 bg-[radial-gradient(circle_at_50%_10%,rgba(189,132,255,0.18),transparent_38%),linear-gradient(180deg,#2b124c_0%,#22103e_100%)] p-5 shadow-[inset_0_0_40px_rgba(197,147,255,0.08)]">
      {/* 월 네비게이션 */}
      <div className="mb-4 flex items-center justify-between">
        <button onClick={prevMonth} className="rounded-lg px-3 py-1.5 text-lg text-white/60 hover:text-white transition">‹</button>
        <div className="text-xl font-semibold text-white">{viewYear}년 {viewMonth + 1}월</div>
        <button onClick={nextMonth} className="rounded-lg px-3 py-1.5 text-lg text-white/60 hover:text-white transition">›</button>
      </div>

      {/* 요일 */}
      <div className="grid grid-cols-7 border-b border-white/10 pb-3 text-center text-sm text-white/40">
        {['일','월','화','수','목','금','토'].map(d => <div key={d}>{d}</div>)}
      </div>

      {/* 날짜 */}
      <div className="mt-3 grid grid-cols-7 gap-y-2 text-center">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day  = i + 1;
          const type = cellType(day);
          return (
            <div key={day} className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold transition ${
              type === 'today'     ? 'border-[#9b66ff] bg-[#4a2274] text-white'                                             :
              type === 'predicted' ? 'border-amber-400 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400/50'            :
              type === 'history'   ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'                            :
              'border-white/5 bg-white/[0.02] text-white/50 hover:bg-white/5'
            }`}>
              {day}
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/40">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#6e35dc]" />오늘</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />예측 할인일</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400/50" />과거 할인</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  메인 컴포넌트
// ═══════════════════════════════════════════════════════
export function PredictPage({ game }: { game: Game }) {
  const [priceDetail, setPriceDetail] = useState<PriceDetail | null>(null);
  const [prices, setPrices]           = useState<PriceData | null>(null);
  const [loading, setLoading]         = useState(true);
  const rates = useExchange();

  useEffect(() => {
    setLoading(true);
    // KRW 가격 히스토리 + 실시간 가격 병렬 호출
    Promise.all([
      fetch(`${API_BASE}/steam-game/${game.steamAppId}/price-detail/KRW`).then(r => r.ok ? r.json() : null),
      fetch(`${API_BASE}/steam-game/${game.steamAppId}/price`).then(r => r.ok ? r.json() : null),
    ]).then(([detail, price]) => {
      if (detail?.status === 'success') setPriceDetail(detail);
      if (price?.prices) setPrices(price.prices);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [game.steamAppId]);

  // 할인 예측 계산
  const prediction = useMemo(() => {
    if (!priceDetail) return null;
    return calcNextPredicted(priceDetail.history);
  }, [priceDetail]);

  // 현재 가격 상태
  const latest    = priceDetail?.history[0];
  const isOnSale  = (latest?.discount_percent ?? 0) > 0;
  const krwPrice  = prices?.KRW ?? latest?.price ?? game.priceKRW;
  const usdPrice  = prices?.USD ?? parseFloat(game.prices.us.replace('$', '').replace('Free', '0'));
  const jpyPrice  = prices?.JPY ?? parseFloat(game.prices.jp.replace('¥', '').replace(',', '').replace('무료', '0'));

  const usdKrw = Math.round(usdPrice * rates.usd);
  const jpyKrw = Math.round(jpyPrice * rates.jpy);

  const daysUntilNext = useMemo(() => {
    if (!prediction?.date) return null;
    const today = new Date();
    const next  = parseDate(prediction.date);
    return Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, [prediction]);

  const countries = [
    { label: '🇰🇷 한국', raw: `₩${krwPrice.toLocaleString()}`,  krwEquiv: krwPrice },
    { label: '🇺🇸 미국', raw: `$${usdPrice.toFixed(2)}`,         krwEquiv: usdKrw  },
    { label: '🇯🇵 일본', raw: `¥${jpyPrice.toLocaleString()}`,   krwEquiv: jpyKrw  },
  ];
  const maxKrw = Math.max(krwPrice, usdKrw, jpyKrw, 1);
  const minKrw = Math.min(krwPrice, usdKrw, jpyKrw);

  return (
    <div className="space-y-6">
      {/* ── 헤더 ── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-white/40">예상 할인 타이밍 · Steam analysis</div>
          <div className="mt-1 flex items-center gap-3">
            <img src={getSteamHeader(game.steamAppId)} alt={game.title}
              className="h-10 w-16 rounded-lg object-cover" />
            <div className="text-xl font-bold text-white">{game.title}</div>
          </div>
        </div>
        <Link
          href={`/games/${game.steamAppId}`}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:border-[#c084fc]/50 hover:text-white transition"
        >
          게임 상세 →
        </Link>
      </div>

      {/* ── 메인 그리드: 좌(정보) + 우(캘린더) ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">

        {/* ── 좌측 ── */}
        <div className="space-y-4">

          {/* 현재 가격 상태 */}
          <div className="panel-soft p-4">
            <div className="mb-3 text-sm font-semibold text-white">현재 가격</div>
            {loading ? (
              <div className="flex h-10 items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#c084fc] border-t-transparent" />
              </div>
            ) : (
              <>
                <div className={`rounded-xl border p-3 text-sm ${
                  isOnSale
                    ? 'border-emerald-400/30 bg-emerald-400/8 text-emerald-300'
                    : 'border-white/10 bg-white/5 text-white/60'
                }`}>
                  {isOnSale
                    ? `🎉 현재 ${latest?.discount_percent}% 할인 중! ${formatKRW(krwPrice)}`
                    : `💤 현재 할인 없음 — 정가 ${formatKRW(krwPrice)}`}
                </div>
                {priceDetail && (
                  <div className="mt-2 flex gap-3 text-[10px] text-white/40">
                    <span>최저가: {formatKRW(priceDetail.analysis.lowest_price)}</span>
                    <span>·</span>
                    <span>{priceDetail.analysis.is_lowest ? '🎉 현재 최저가!' : '최저가 아님'}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 환율 기준 국가별 가격 */}
          <div className="panel-soft p-4">
            <div className="mb-1 text-sm font-semibold text-white">국가별 가격 비교</div>
            <div className="mb-3 text-[10px] text-white/30">기준: {rates.updatedAt} · USD ×{rates.usd.toLocaleString()} / JPY ×{rates.jpy}</div>
            <div className="space-y-3">
              {countries.map((c) => (
                <div key={c.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-white/60">{c.label}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-white/35">{c.raw}</span>
                      <span className={`font-semibold ${c.krwEquiv === minKrw && krwPrice > 0 ? 'text-emerald-400' : 'text-white/80'}`}>
                        {formatKRW(c.krwEquiv)}
                      </span>
                      {c.krwEquiv === minKrw && krwPrice > 0 && <span className="text-emerald-400">🏆</span>}
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full rounded-full" style={{ width: `${(c.krwEquiv / maxKrw) * 100}%`, background: c.krwEquiv === minKrw && krwPrice > 0 ? '#4ade80' : 'rgba(255,255,255,0.3)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 할인 예측 정보 */}
          <div className="panel-soft p-4">
            <div className="mb-3 text-sm font-semibold text-white">할인 예측</div>
            {loading ? (
              <div className="flex h-16 items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#c084fc] border-t-transparent" />
              </div>
            ) : prediction ? (
              <div className="space-y-3">
                {/* API buying_advice 우선 표시 */}
                {priceDetail?.analysis.buying_advice && (
                  <div className="rounded-xl border border-[#c084fc]/20 bg-[#c084fc]/8 p-3 text-xs text-[#e9d5ff]">
                    {priceDetail.analysis.buying_advice}
                  </div>
                )}
                {prediction.avgCycleDays && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">평균 할인 주기</span>
                    <span className="font-semibold text-[#c084fc]">약 {prediction.avgCycleDays}일</span>
                  </div>
                )}
                {prediction.lastSaleDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">마지막 할인일</span>
                    <span className="text-white/80">{prediction.lastSaleDate}</span>
                  </div>
                )}
                {prediction.date && daysUntilNext !== null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">다음 예상 할인일</span>
                    <div className="text-right">
                      <div className="font-semibold text-amber-400">{prediction.date}</div>
                      <div className={`text-xs font-bold ${ddayColor(daysUntilNext)}`}>{ddayText(daysUntilNext)}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-white/35">할인 이력 데이터가 없습니다.</div>
            )}
          </div>

          {/* 최근 할인 이력 */}
          {priceDetail && priceDetail.history.filter(h => h.discount_percent > 0).length > 0 && (
            <div className="panel-soft p-4">
              <div className="mb-3 text-sm font-semibold text-white">최근 할인 이력</div>
              <div className="space-y-1.5">
                {priceDetail.history
                  .filter((h) => h.discount_percent > 0)
                  .slice(0, 5)
                  .map((h, i) => (
                    <div key={i} className="flex justify-between rounded-lg bg-white/4 px-3 py-2 text-xs text-white/55">
                      <span>{h.date}</span>
                      <span className="font-semibold text-emerald-400">-{h.discount_percent}%</span>
                      <span>{formatKRW(h.price)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* ── 우측: 캘린더 ── */}
        <div>
          <div className="mb-3 text-sm font-semibold text-white">할인 예측 캘린더</div>
          <div className="mb-2 text-xs text-white/35">과거 할인일과 다음 예측 할인일을 달력에서 확인하세요.</div>
          <DiscountCalendar
            history={priceDetail?.history ?? []}
            nextPredictedDate={prediction?.date ?? null}
          />
        </div>
      </div>
    </div>
  );
}
