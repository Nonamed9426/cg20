import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { API_BASE } from './api';

// ── 타입 ──────────────────────────────────────────────────
export type ExchangeRates = {
  usd: number;   // 1 USD → KRW
  jpy: number;   // 100 JPY → KRW
  updatedAt: string;
  loading: boolean;
  error: boolean;
};

const defaultRates: ExchangeRates = {
  usd: 1376,
  jpy: 9.12,
  updatedAt: '-',
  loading: true,
  error: false,
};

// ── Context ───────────────────────────────────────────────
const ExchangeContext = createContext<ExchangeRates>(defaultRates);

// ── Provider ──────────────────────────────────────────────
export function ExchangeProvider({ children }: { children: ReactNode }) {
  const [rates, setRates] = useState<ExchangeRates>(defaultRates);

  const fetchRates = async () => {
    try {
      const res  = await fetch(`${API_BASE}/rates`);
      const json = await res.json();
      // 응답: { status, data: { usd, jpy }, updated_at }
      if (json.status === 'success') {
        setRates({
          usd: json.data.usd,
          jpy: json.data.jpy / 100, // API는 100 JPY → KRW 환율을 줌
          updatedAt: json.updated_at,
          loading: false,
          error: false,
        });
      } else {
        throw new Error('API error');
      }
    } catch {
      setRates((prev) => ({ ...prev, loading: false, error: true }));
    }
  };

  useEffect(() => {
    // 최초 실행
    fetchRates();

    // 5분마다 자동 갱신
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ExchangeContext.Provider value={rates}>
      {children}
    </ExchangeContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────
export function useExchange() {
  return useContext(ExchangeContext);
}

// ── 유틸 함수 ─────────────────────────────────────────────
export function usdToKrw(usd: number, rate: number) {
  return Math.round(usd * rate);
}

export function jpyToKrw(jpy: number, rate: number) {
  return Math.round(jpy * rate);
}

export function formatKRW(n: number) {
  return `₩${n.toLocaleString()}`;
}
