'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Game, getSteamHeader, exchangeRates } from '@/lib/data';

const API_BASE = 'http://localhost:8000';

// ═══════════════════════════════════════════════════════
//  타입
// ═══════════════════════════════════════════════════════
type PredictionData = {
  gameId: number;
  isOnSale: boolean;
  currentDiscount: number;
  currentPrice: number;
  regularPrice: number;
  avgCycleDays: number | null;
  lastSaleDate: string | null;
  nextPredictedDate: string | null;
  history: { date: string; discount: number; price: number }[];
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

// ═══════════════════════════════════════════════════════
//  할인 예측 캘린더
// ═══════════════════════════════════════════════════════
function DiscountCalendar({ prediction }: { prediction: PredictionData | null }) {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const historyDates = useMemo(() => {
    if (!prediction) return new Set<string>();
    return new Set(prediction.history.map((h) => h.date));
  }, [prediction]);

  const predictedDate = prediction?.nextPredictedDate
    ? parseDate(prediction.nextPredictedDate)
    : null;

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
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/game/${game.steamAppId}/discount-prediction`)
      .then((r) => r.ok ? r.json() : null)
      .then(setPrediction)
      .catch(() => setPrediction(null))
      .finally(() => setLoading(false));
  }, [game.steamAppId]);

  // 환율
  const usdToKrw = exchangeRates.usdToKrw;
  const jpyToKrw = exchangeRates.jpyToKrw;
  const krw    = game.priceKRW;
  const usdKrw = Math.round(parseFloat(game.prices.us.replace('$', '').replace('Free', '0')) * usdToKrw);
  const jpyKrw = Math.round(parseFloat(game.prices.jp.replace('¥', '').replace(',', '').replace('무료', '0')) * jpyToKrw);

  const daysUntilNext = useMemo(() => {
    if (!prediction?.nextPredictedDate) return null;
    const today = new Date();
    const next  = parseDate(prediction.nextPredictedDate);
    return Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, [prediction]);

  const countries = [
    { label: '🇰🇷 한국', raw: game.prices.kr, krwEquiv: krw,    color: '#c084fc' },
    { label: '🇺🇸 미국', raw: game.prices.us, krwEquiv: usdKrw, color: '#60a5fa' },
    { label: '🇯🇵 일본', raw: game.prices.jp, krwEquiv: jpyKrw, color: '#f472b6' },
  ];
  const maxKrw  = Math.max(krw, usdKrw, jpyKrw, 1);
  const minKrw  = Math.min(krw, usdKrw, jpyKrw);

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
              <div className={`rounded-xl border p-3 text-sm ${
                prediction?.isOnSale
                  ? 'border-emerald-400/30 bg-emerald-400/8 text-emerald-300'
                  : 'border-white/10 bg-white/5 text-white/60'
              }`}>
                {prediction?.isOnSale
                  ? `🎉 현재 ${prediction.currentDiscount}% 할인 중! ${formatKRW(prediction.currentPrice)}`
                  : `💤 현재 할인 없음 — 정가 ${formatKRW(game.priceKRW)}`}
              </div>
            )}
          </div>

          {/* 환율 기준 국가별 가격 */}
          <div className="panel-soft p-4">
            <div className="mb-1 text-sm font-semibold text-white">국가별 가격 비교</div>
            <div className="mb-3 text-[10px] text-white/30">기준: {exchangeRates.updatedAt} · USD ×{usdToKrw.toLocaleString()} / JPY ×{jpyToKrw}</div>
            <div className="space-y-3">
              {countries.map((c) => (
                <div key={c.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-white/60">{c.label}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-white/35">{c.raw}</span>
                      <span className="font-semibold" style={{ color: c.color }}>{formatKRW(c.krwEquiv)}</span>
                      {c.krwEquiv === minKrw && krw > 0 && <span className="text-emerald-400">🏆</span>}
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full rounded-full" style={{ width: `${(c.krwEquiv / maxKrw) * 100}%`, background: c.color, opacity: 0.75 }} />
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
                {prediction.nextPredictedDate && daysUntilNext !== null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">다음 예상 할인일</span>
                    <div className="text-right">
                      <div className="font-semibold text-amber-400">{prediction.nextPredictedDate}</div>
                      <div className={`text-xs font-bold ${ddayColor(daysUntilNext)}`}>{ddayText(daysUntilNext)}</div>
                    </div>
                  </div>
                )}

                {/* 한 줄 판단 */}
                <div className={`rounded-xl border p-3 text-xs leading-5 ${
                  prediction.isOnSale
                    ? 'border-emerald-400/20 bg-emerald-400/8 text-emerald-300'
                    : daysUntilNext !== null && daysUntilNext <= 14
                    ? 'border-amber-400/20 bg-amber-400/8 text-amber-300'
                    : 'border-white/8 bg-white/4 text-white/50'
                }`}>
                  {prediction.isOnSale
                    ? '✅ 현재 할인 중이에요. 지금 구매가 좋아요!'
                    : daysUntilNext !== null && daysUntilNext <= 14
                    ? '⏰ 할인이 곧 예상돼요. 조금만 기다려보세요!'
                    : daysUntilNext !== null && daysUntilNext <= 60
                    ? '🕐 1~2달 내 할인이 예상돼요. 위시리스트에 추가해두세요.'
                    : '💤 당분간 할인 가능성이 낮아요. 정가 구매를 고려하세요.'}
                </div>
              </div>
            ) : (
              <div className="text-xs text-white/35">할인 이력 데이터가 없습니다.</div>
            )}
          </div>

          {/* 최근 할인 이력 */}
          {prediction && prediction.history.length > 0 && (
            <div className="panel-soft p-4">
              <div className="mb-3 text-sm font-semibold text-white">최근 할인 이력</div>
              <div className="space-y-1.5">
                {prediction.history.slice(0, 5).map((h, i) => (
                  <div key={i} className="flex justify-between rounded-lg bg-white/4 px-3 py-2 text-xs text-white/55">
                    <span>{h.date}</span>
                    <span className="font-semibold text-emerald-400">-{h.discount}%</span>
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
          <DiscountCalendar prediction={prediction} />
        </div>
      </div>
    </div>
  );
}
