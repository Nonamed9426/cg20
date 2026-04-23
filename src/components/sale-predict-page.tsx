'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { games, getSteamHeader, exchangeRates } from '@/lib/data';

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
//  스팀 정기 세일 타임라인 더미
// ═══════════════════════════════════════════════════════
const SALE_EVENTS = [
  { name: '봄 세일',      month: 3,  daysUntil: -25, confidence: 'high'   as const },
  { name: '여름 세일',    month: 6,  daysUntil: 66,  confidence: 'high'   as const },
  { name: '할로윈 세일',  month: 10, daysUntil: 190, confidence: 'medium' as const },
  { name: '추수감사절',   month: 11, daysUntil: 218, confidence: 'high'   as const },
  { name: '겨울 세일',    month: 12, daysUntil: 245, confidence: 'high'   as const },
];

// ═══════════════════════════════════════════════════════
//  유틸
// ═══════════════════════════════════════════════════════
function formatKRW(n: number) { return `₩${n.toLocaleString()}`; }

function ddayColor(days: number) {
  if (days <= 7)  return 'text-emerald-400';
  if (days <= 30) return 'text-amber-400';
  return 'text-white/60';
}

function ddayText(days: number) {
  if (days === 0) return 'D-day';
  if (days < 0)   return `${Math.abs(days)}일 전`;
  return `D-${days}`;
}

// 날짜 → 캘린더용 Date 객체
function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// ═══════════════════════════════════════════════════════
//  할인 예측 캘린더
// ═══════════════════════════════════════════════════════
function DiscountCalendar({ prediction }: { prediction: PredictionData | null }) {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // 할인 이력 날짜 set
  const historyDates = useMemo(() => {
    if (!prediction) return new Set<string>();
    return new Set(prediction.history.map((h) => h.date));
  }, [prediction]);

  // 다음 예측 날짜
  const predictedDate = prediction?.nextPredictedDate
    ? parseDate(prediction.nextPredictedDate)
    : null;

  function cellType(day: number): 'today' | 'predicted' | 'history' | 'normal' {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday  = viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();
    const isPred   = predictedDate && predictedDate.getFullYear() === viewYear && predictedDate.getMonth() === viewMonth && predictedDate.getDate() === day;
    if (isToday)  return 'today';
    if (isPred)   return 'predicted';
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
    <div className="panel-soft p-4">
      {/* 헤더 */}
      <div className="mb-3 flex items-center justify-between">
        <button onClick={prevMonth} className="rounded-lg px-2 py-1 text-white/50 hover:text-white transition">‹</button>
        <div className="text-sm font-semibold text-white">
          {viewYear}년 {viewMonth + 1}월
        </div>
        <button onClick={nextMonth} className="rounded-lg px-2 py-1 text-white/50 hover:text-white transition">›</button>
      </div>

      {/* 요일 헤더 */}
      <div className="mb-1 grid grid-cols-7 text-center text-[10px] text-white/30">
        {['일','월','화','수','목','금','토'].map(d => <div key={d}>{d}</div>)}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day  = i + 1;
          const type = cellType(day);
          return (
            <div key={day} className={`flex h-8 items-center justify-center rounded-lg text-xs font-semibold transition ${
              type === 'today'     ? 'bg-[#6e35dc] text-white'        :
              type === 'predicted' ? 'bg-amber-500/80 text-white ring-2 ring-amber-400' :
              type === 'history'   ? 'bg-emerald-500/20 text-emerald-300' :
              'text-white/50 hover:bg-white/5'
            }`}>
              {day}
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-white/40">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#6e35dc]" />오늘</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-amber-400" />예측 할인일</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-400/50" />과거 할인</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  메인 컴포넌트
// ═══════════════════════════════════════════════════════
export function SalePredictPage() {
  const [selectedId, setSelectedId]     = useState<number>(games[0].steamAppId);
  const [searchQuery, setSearchQuery]   = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [prediction, setPrediction]     = useState<PredictionData | null>(null);
  const [loading, setLoading]           = useState(false);

  const filteredGames = useMemo(
    () => games.filter((g) => g.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery],
  );
  const selectedGame = useMemo(
    () => games.find((g) => g.steamAppId === selectedId) ?? games[0],
    [selectedId],
  );

  // 게임 변경 시 API 호출
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/game/${selectedId}/discount-prediction`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setPrediction(data))
      .catch(() => setPrediction(null))
      .finally(() => setLoading(false));
  }, [selectedId]);

  // 환율 계산
  const usdToKrw = exchangeRates.usdToKrw;
  const jpyToKrw = exchangeRates.jpyToKrw;
  const usdKrw = Math.round(parseFloat(selectedGame.prices.us.replace('$', '').replace('Free', '0')) * usdToKrw);
  const jpyKrw = Math.round(parseFloat(selectedGame.prices.jp.replace('¥', '').replace(',', '').replace('무료', '0')) * jpyToKrw);
  const krw = selectedGame.priceKRW;

  // 다음 예측까지 D-day
  const daysUntilNext = useMemo(() => {
    if (!prediction?.nextPredictedDate) return null;
    const today = new Date();
    const next  = parseDate(prediction.nextPredictedDate);
    return Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, [prediction]);

  return (
    <div className="space-y-6">

      {/* ── 헤더 ── */}
      <div>
        <div className="text-[28px] font-black tracking-tight text-white">할인 예측</div>
        <div className="mt-1 text-sm text-white/50">
          게임별 과거 할인 패턴을 분석해 다음 할인 시점을 예측합니다.
        </div>
      </div>

      {/* ── 게임 선택 드롭다운 ── */}
      <div className="panel p-4">
        <div className="mb-2 text-xs text-white/45">게임 선택</div>
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
            {prediction?.isOnSale && (
              <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs text-emerald-300 border border-emerald-400/30">
                할인 중 -{prediction.currentDiscount}%
              </span>
            )}
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

      {/* ── 메인 콘텐츠: 좌(정보) + 우(캘린더) ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">

        {/* ── 좌측: 환율 + 할인 예측 정보 ── */}
        <div className="space-y-4">

          {/* 현재 가격 상태 */}
          <div className="panel-soft p-4">
            <div className="mb-3 text-sm font-semibold text-white">현재 가격</div>
            {loading ? (
              <div className="flex h-12 items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#c084fc] border-t-transparent" />
              </div>
            ) : (
              <>
                <div className={`mb-3 rounded-xl border p-3 text-sm ${
                  prediction?.isOnSale
                    ? 'border-emerald-400/30 bg-emerald-400/8 text-emerald-300'
                    : 'border-white/10 bg-white/5 text-white/60'
                }`}>
                  {prediction?.isOnSale
                    ? `🎉 현재 ${prediction.currentDiscount}% 할인 중! ${formatKRW(prediction.currentPrice)}`
                    : `💤 현재 할인 없음 — 정가 ${formatKRW(selectedGame.priceKRW)}`}
                </div>
              </>
            )}
          </div>

          {/* 환율 기반 국가별 가격 */}
          <div className="panel-soft p-4">
            <div className="mb-3 text-sm font-semibold text-white">현재 환율 기준 가격</div>
            <div className="mb-2 text-[10px] text-white/35">기준: {exchangeRates.updatedAt}</div>
            <div className="space-y-2">
              {[
                { label: '🇰🇷 한국', raw: selectedGame.prices.kr, krwEquiv: krw,    color: '#c084fc' },
                { label: '🇺🇸 미국', raw: selectedGame.prices.us, krwEquiv: usdKrw, color: '#60a5fa' },
                { label: '🇯🇵 일본', raw: selectedGame.prices.jp, krwEquiv: jpyKrw, color: '#f472b6' },
              ].map((c) => {
                const maxKrw = Math.max(krw, usdKrw, jpyKrw, 1);
                return (
                  <div key={c.label}>
                    <div className="mb-0.5 flex justify-between text-xs">
                      <span className="text-white/60">{c.label}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-white/40">{c.raw}</span>
                        <span className="font-semibold" style={{ color: c.color }}>{formatKRW(c.krwEquiv)}</span>
                        {c.krwEquiv === Math.min(krw, usdKrw, jpyKrw) && krw > 0 && (
                          <span className="text-emerald-400">🏆</span>
                        )}
                      </div>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                      <div className="h-full rounded-full" style={{ width: `${(c.krwEquiv / maxKrw) * 100}%`, background: c.color, opacity: 0.75 }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-[10px] text-white/30">
              USD ×{usdToKrw.toLocaleString()} / JPY ×{jpyToKrw}
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
                    <span className="text-white/55">평균 할인 주기</span>
                    <span className="font-semibold text-[#c084fc]">약 {prediction.avgCycleDays}일</span>
                  </div>
                )}
                {prediction.lastSaleDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/55">마지막 할인일</span>
                    <span className="text-white/80">{prediction.lastSaleDate}</span>
                  </div>
                )}
                {prediction.nextPredictedDate && daysUntilNext !== null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/55">다음 예상 할인일</span>
                    <div className="text-right">
                      <div className="font-semibold text-amber-400">{prediction.nextPredictedDate}</div>
                      <div className={`text-xs font-bold ${ddayColor(daysUntilNext)}`}>
                        {ddayText(daysUntilNext)}
                      </div>
                    </div>
                  </div>
                )}
                {/* 한 줄 판단 */}
                <div className={`rounded-xl border p-2.5 text-xs leading-5 ${
                  daysUntilNext !== null && daysUntilNext <= 14
                    ? 'border-emerald-400/20 bg-emerald-400/8 text-emerald-300'
                    : 'border-white/8 bg-white/4 text-white/55'
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
        </div>

        {/* ── 우측: 할인 예측 캘린더 ── */}
        <div className="space-y-4">
          <div className="panel p-4">
            <div className="mb-3 text-sm font-semibold text-white">할인 예측 캘린더</div>
            <div className="mb-3 text-xs text-white/40">과거 할인일과 다음 예측 할인일을 달력에서 확인하세요.</div>
            <DiscountCalendar prediction={prediction} />
          </div>

          {/* 최근 할인 이력 */}
          {prediction && prediction.history.length > 0 && (
            <div className="panel-soft p-4">
              <div className="mb-3 text-sm font-semibold text-white">최근 할인 이력</div>
              <div className="space-y-1.5">
                {prediction.history.slice(0, 6).map((h, i) => (
                  <div key={i} className="flex justify-between rounded-lg bg-white/4 px-3 py-2 text-xs text-white/60">
                    <span>{h.date}</span>
                    <span className="text-emerald-400 font-semibold">-{h.discount}%</span>
                    <span>{formatKRW(h.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 스팀 정기 세일 타임라인 ── */}
      <section className="panel p-5">
        <div className="mb-1 text-sm font-semibold text-[#f0b5ff]">참고</div>
        <div className="mb-4 text-lg font-bold text-white">스팀 정기 세일 일정</div>

        {/* 타임라인 바 */}
        <div className="relative mb-2 overflow-x-auto pb-4">
          <div className="relative h-10 min-w-[560px]">
            <div className="absolute inset-y-[18px] left-0 right-0 h-0.5 bg-white/10" />
            {SALE_EVENTS.map((event) => {
              const pct = ((event.month - 1) / 11) * 100;
              const isPast  = event.daysUntil < 0;
              const isClose = event.daysUntil >= 0 && event.daysUntil <= 30;
              return (
                <div key={event.name} style={{ left: `${pct}%` }} className="absolute -translate-x-1/2">
                  <div className={`h-4 w-4 rounded-full border-2 ${
                    isPast  ? 'border-white/15 bg-white/5' :
                    isClose ? 'border-[#9b5cff] bg-[#9b5cff]' :
                    event.confidence === 'high'   ? 'border-emerald-400 bg-emerald-400/20' :
                    'border-amber-400 bg-amber-400/20'
                  }`} />
                  <div className="mt-1.5 -translate-x-1/4 whitespace-nowrap text-[9px] text-white/40">
                    {event.name}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex min-w-[560px] justify-between text-[10px] text-white/20 mt-4">
            {['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'].map(m => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        {/* 예정 세일 카드 */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {SALE_EVENTS.filter(e => e.daysUntil >= 0).slice(0, 3).map((event) => (
            <div key={event.name} className={`rounded-xl border p-3 ${
              event.daysUntil <= 30
                ? 'border-[#9b5cff]/40 bg-[#1e0f3f]'
                : 'border-white/8 bg-white/[0.03]'
            }`}>
              <div className="text-sm font-semibold text-white">{event.name}</div>
              <div className={`mt-1 text-xs font-bold ${ddayColor(event.daysUntil)}`}>
                {ddayText(event.daysUntil)}
              </div>
              <div className="mt-1 text-[10px] text-white/35">
                {event.confidence === 'high' ? '높은 신뢰도' : '보통 신뢰도'}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
