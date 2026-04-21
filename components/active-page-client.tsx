"use client";

import { useState } from "react";

// ─── 더미 데이터 (FastAPI 연결 후 lib/data.ts로 교체) ───────────────────────
type ActiveGame = {
  id: number;
  name: string;
  headerImage: string;
  genre: string[];
  tags: string[];
  updateDate: string;      // "2025-04-15"
  daysSinceUpdate: number;
  reviewScore: number;     // 0~100
  reviewCount: number;
  currentPricekrw: number;
  discountPercent: number;
  streamViewers: number;   // 치지직+Twitch 합산 현재 시청자
  streamChannels: number;
  isKorean: boolean;
  isFree: boolean;
};

const DUMMY_GAMES: ActiveGame[] = [
  {
    id: 1,
    name: "엘든 링",
    headerImage: "https://cdn.akamai.steamstatic.com/steam/apps/1245620/header.jpg",
    genre: ["RPG", "액션"],
    tags: ["오픈 월드", "어려움", "다크 판타지"],
    updateDate: "2025-04-18",
    daysSinceUpdate: 3,
    reviewScore: 96,
    reviewCount: 921000,
    currentPricekrw: 79800,
    discountPercent: 0,
    streamViewers: 42800,
    streamChannels: 312,
    isKorean: true,
    isFree: false,
  },
  {
    id: 2,
    name: "발로란트",
    headerImage: "https://cdn.akamai.steamstatic.com/steam/apps/2694490/header.jpg",
    genre: ["FPS", "전략"],
    tags: ["경쟁", "팀플레이", "무료"],
    updateDate: "2025-04-20",
    daysSinceUpdate: 1,
    reviewScore: 79,
    reviewCount: 1200000,
    currentPricekrw: 0,
    discountPercent: 0,
    streamViewers: 128400,
    streamChannels: 1840,
    isKorean: true,
    isFree: true,
  },
  {
    id: 3,
    name: "스타듀 밸리",
    headerImage: "https://cdn.akamai.steamstatic.com/steam/apps/413150/header.jpg",
    genre: ["시뮬레이션", "RPG"],
    tags: ["농장", "힐링", "픽셀"],
    updateDate: "2025-04-10",
    daysSinceUpdate: 11,
    reviewScore: 98,
    reviewCount: 780000,
    currentPricekrw: 12800,
    discountPercent: 20,
    streamViewers: 9200,
    streamChannels: 228,
    isKorean: true,
    isFree: false,
  },
  {
    id: 4,
    name: "홀로우 나이트",
    headerImage: "https://cdn.akamai.steamstatic.com/steam/apps/367520/header.jpg",
    genre: ["플랫포머", "액션"],
    tags: ["메트로배니아", "어려움", "인디"],
    updateDate: "2025-03-30",
    daysSinceUpdate: 22,
    reviewScore: 97,
    reviewCount: 540000,
    currentPricekrw: 14400,
    discountPercent: 40,
    streamViewers: 5700,
    streamChannels: 95,
    isKorean: false,
    isFree: false,
  },
  {
    id: 5,
    name: "패스 오브 엑자일 2",
    headerImage: "https://cdn.akamai.steamstatic.com/steam/apps/2694490/header.jpg",
    genre: ["RPG", "액션"],
    tags: ["핵앤슬래시", "어려움", "얼리 액세스"],
    updateDate: "2025-04-19",
    daysSinceUpdate: 2,
    reviewScore: 72,
    reviewCount: 310000,
    currentPricekrw: 0,
    discountPercent: 0,
    streamViewers: 33600,
    streamChannels: 447,
    isKorean: true,
    isFree: true,
  },
  {
    id: 6,
    name: "셀레스트",
    headerImage: "https://cdn.akamai.steamstatic.com/steam/apps/504230/header.jpg",
    genre: ["플랫포머", "인디"],
    tags: ["어려움", "픽셀", "감동"],
    updateDate: "2025-04-05",
    daysSinceUpdate: 16,
    reviewScore: 99,
    reviewCount: 92000,
    currentPricekrw: 19800,
    discountPercent: 35,
    streamViewers: 3100,
    streamChannels: 61,
    isKorean: false,
    isFree: false,
  },
];

// ─── 필터 상태 타입 ──────────────────────────────────────────────────────────
type SortKey = "update" | "viewers" | "review" | "discount";
type GenreFilter = "all" | "RPG" | "FPS" | "시뮬레이션" | "플랫포머" | "전략";

// ─── 유틸 ────────────────────────────────────────────────────────────────────
function formatPrice(krw: number, isFree: boolean) {
  if (isFree) return <span className="text-emerald-400 font-bold text-sm whitespace-nowrap">무료</span>;
  return <span className="whitespace-nowrap">₩{krw.toLocaleString()}</span>;
}

function reviewLabel(score: number) {
  if (score >= 95) return { label: "압도적 긍정", color: "#4ade80" };
  if (score >= 80) return { label: "매우 긍정적", color: "#86efac" };
  if (score >= 70) return { label: "대체로 긍정적", color: "#fde68a" };
  if (score >= 40) return { label: "복합적", color: "#fdba74" };
  return { label: "부정적", color: "#f87171" };
}

function freshnessColor(days: number) {
  if (days <= 3) return "#c084fc";   // 보라 — 매우 최신
  if (days <= 7) return "#e879f9";   // 핑크
  if (days <= 14) return "#a78bfa";  // 연보라
  return "#6b7280";                  // 회색
}

function freshnessLabel(days: number) {
  if (days === 0) return "오늘 업데이트";
  if (days === 1) return "어제 업데이트";
  return `${days}일 전 업데이트`;
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────────────────────
export default function ActivePageClient() {
  const [sortKey, setSortKey] = useState<SortKey>("update");
  const [genreFilter, setGenreFilter] = useState<GenreFilter>("all");
  const [koreanOnly, setKoreanOnly] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);

  // 필터 & 정렬
  const filtered = DUMMY_GAMES
    .filter((g) => genreFilter === "all" || g.genre.includes(genreFilter))
    .filter((g) => !koreanOnly || g.isKorean)
    .filter((g) => !freeOnly || g.isFree)
    .sort((a, b) => {
      if (sortKey === "update") return a.daysSinceUpdate - b.daysSinceUpdate;
      if (sortKey === "viewers") return b.streamViewers - a.streamViewers;
      if (sortKey === "review") return b.reviewScore - a.reviewScore;
      if (sortKey === "discount") return b.discountPercent - a.discountPercent;
      return 0;
    });

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "update", label: "⚡ 최신 업데이트" },
    { key: "viewers", label: "📺 시청자 수" },
    { key: "review", label: "⭐ 평점 순" },
    { key: "discount", label: "🔥 할인율 순" },
  ];

  const genres: GenreFilter[] = ["all", "RPG", "FPS", "시뮬레이션", "플랫포머", "전략"];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0a1e 0%, #1a0b2e 40%, #0d1117 100%)",
        fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
        color: "#e2e8f0",
        padding: "2rem 1rem",
      }}
    >
      {/* ── 헤더 ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#c084fc",
                boxShadow: "0 0 10px #c084fc",
                animation: "pulse 2s infinite",
                flexShrink: 0,
              }}
            />
            <h1
              style={{
                fontSize: "clamp(1.4rem, 4vw, 2rem)",
                fontWeight: 800,
                background: "linear-gradient(90deg, #c084fc, #f472b6, #818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                whiteSpace: "nowrap",
                margin: 0,
              }}
            >
              활성 게임 추천
            </h1>
          </div>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
              marginTop: "0.4rem",
              lineHeight: 1.6,
            }}
          >
            최근 업데이트 · 스트리밍 인기 · 평점을 종합해 지금 가장 활발한 게임을 추천해드려요
          </p>
        </div>

        {/* ── 필터/정렬 바 ── */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(192,132,252,0.2)",
            borderRadius: 12,
            padding: "1rem 1.2rem",
            marginBottom: "1.5rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          {/* 정렬 */}
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {sortOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortKey(opt.key)}
                style={{
                  padding: "0.3rem 0.8rem",
                  borderRadius: 20,
                  border: "1px solid",
                  borderColor: sortKey === opt.key ? "#c084fc" : "rgba(255,255,255,0.1)",
                  background: sortKey === opt.key
                    ? "linear-gradient(90deg,rgba(192,132,252,0.25),rgba(244,114,182,0.15))"
                    : "transparent",
                  color: sortKey === opt.key ? "#e9d5ff" : "#94a3b8",
                  fontSize: "clamp(0.7rem, 1.8vw, 0.8rem)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                  fontWeight: sortKey === opt.key ? 600 : 400,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div
            style={{
              width: 1,
              height: 28,
              background: "rgba(255,255,255,0.1)",
              flexShrink: 0,
            }}
          />

          {/* 장르 */}
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setGenreFilter(g)}
                style={{
                  padding: "0.3rem 0.75rem",
                  borderRadius: 20,
                  border: "1px solid",
                  borderColor: genreFilter === g ? "#f472b6" : "rgba(255,255,255,0.08)",
                  background: genreFilter === g
                    ? "rgba(244,114,182,0.15)"
                    : "transparent",
                  color: genreFilter === g ? "#fce7f3" : "#64748b",
                  fontSize: "clamp(0.68rem, 1.8vw, 0.78rem)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >
                {g === "all" ? "전체" : g}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {/* 한국어 토글 */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                cursor: "pointer",
                fontSize: "clamp(0.7rem, 1.8vw, 0.8rem)",
                color: koreanOnly ? "#c084fc" : "#64748b",
                whiteSpace: "nowrap",
              }}
            >
              <input
                type="checkbox"
                checked={koreanOnly}
                onChange={(e) => setKoreanOnly(e.target.checked)}
                style={{ accentColor: "#c084fc" }}
              />
              한국어 지원
            </label>
            {/* 무료 토글 */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                cursor: "pointer",
                fontSize: "clamp(0.7rem, 1.8vw, 0.8rem)",
                color: freeOnly ? "#f472b6" : "#64748b",
                whiteSpace: "nowrap",
              }}
            >
              <input
                type="checkbox"
                checked={freeOnly}
                onChange={(e) => setFreeOnly(e.target.checked)}
                style={{ accentColor: "#f472b6" }}
              />
              무료만 보기
            </label>
          </div>
        </div>

        {/* ── 결과 수 ── */}
        <div
          style={{
            fontSize: "0.8rem",
            color: "#475569",
            marginBottom: "1rem",
          }}
        >
          {filtered.length}개 게임
        </div>

        {/* ── 게임 카드 그리드 ── */}
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#475569",
              padding: "4rem 0",
              fontSize: "0.9rem",
            }}
          >
            조건에 맞는 게임이 없어요
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
              gap: "1rem",
            }}
          >
            {filtered.map((game, idx) => {
              const rv = reviewLabel(game.reviewScore);
              const fc = freshnessColor(game.daysSinceUpdate);
              return (
                <div
                  key={game.id}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(192,132,252,0.12)",
                    borderRadius: 14,
                    overflow: "hidden",
                    transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                    animation: `fadeUp 0.4s ease ${idx * 0.05}s both`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(192,132,252,0.4)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(192,132,252,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(192,132,252,0.12)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  }}
                >
                  {/* 썸네일 */}
                  <div style={{ position: "relative", height: 140, overflow: "hidden" }}>
                    <img
                      src={game.headerImage}
                      alt={game.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    {/* 업데이트 배지 */}
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        background: "rgba(0,0,0,0.75)",
                        border: `1px solid ${fc}`,
                        borderRadius: 20,
                        padding: "2px 8px",
                        fontSize: "0.68rem",
                        color: fc,
                        whiteSpace: "nowrap",
                        backdropFilter: "blur(4px)",
                        fontWeight: 600,
                      }}
                    >
                      {freshnessLabel(game.daysSinceUpdate)}
                    </div>
                    {/* 할인 배지 */}
                    {game.discountPercent > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background: "linear-gradient(135deg,#7c3aed,#db2777)",
                          borderRadius: 6,
                          padding: "2px 8px",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          color: "#fff",
                          whiteSpace: "nowrap",
                        }}
                      >
                        -{game.discountPercent}%
                      </div>
                    )}
                    {/* 그라디언트 오버레이 */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 48,
                        background: "linear-gradient(to top, rgba(15,10,30,0.95), transparent)",
                      }}
                    />
                  </div>

                  {/* 카드 바디 */}
                  <div style={{ padding: "0.9rem 1rem 1rem" }}>
                    {/* 게임명 */}
                    <div
                      style={{
                        fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
                        fontWeight: 700,
                        color: "#f1f5f9",
                        marginBottom: "0.4rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {game.name}
                    </div>

                    {/* 태그 */}
                    <div
                      style={{
                        display: "flex",
                        gap: "0.3rem",
                        flexWrap: "nowrap",
                        overflow: "hidden",
                        marginBottom: "0.75rem",
                      }}
                    >
                      {game.genre.slice(0, 2).map((g) => (
                        <span
                          key={g}
                          style={{
                            background: "rgba(129,140,248,0.12)",
                            border: "1px solid rgba(129,140,248,0.2)",
                            borderRadius: 4,
                            padding: "1px 6px",
                            fontSize: "0.68rem",
                            color: "#a5b4fc",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {g}
                        </span>
                      ))}
                      {game.isKorean && (
                        <span
                          style={{
                            background: "rgba(244,114,182,0.1)",
                            border: "1px solid rgba(244,114,182,0.2)",
                            borderRadius: 4,
                            padding: "1px 6px",
                            fontSize: "0.68rem",
                            color: "#f9a8d4",
                            whiteSpace: "nowrap",
                          }}
                        >
                          한국어
                        </span>
                      )}
                    </div>

                    {/* 스탯 줄 */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "0.4rem",
                        marginBottom: "0.8rem",
                      }}
                    >
                      {/* 평점 */}
                      <StatCell
                        label="평점"
                        value={`${game.reviewScore}%`}
                        sub={rv.label}
                        color={rv.color}
                      />
                      {/* 시청자 */}
                      <StatCell
                        label="시청자"
                        value={
                          game.streamViewers >= 10000
                            ? `${(game.streamViewers / 10000).toFixed(1)}만`
                            : game.streamViewers.toLocaleString()
                        }
                        sub={`채널 ${game.streamChannels}`}
                        color="#c084fc"
                      />
                      {/* 리뷰 수 */}
                      <StatCell
                        label="리뷰"
                        value={
                          game.reviewCount >= 10000
                            ? `${Math.floor(game.reviewCount / 10000)}만`
                            : game.reviewCount.toLocaleString()
                        }
                        sub="누적"
                        color="#94a3b8"
                      />
                    </div>

                    {/* 가격 */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        paddingTop: "0.65rem",
                      }}
                    >
                      <div>
                        {!game.isFree && game.discountPercent > 0 && (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              color: "#64748b",
                              textDecoration: "line-through",
                              marginRight: "0.3rem",
                            }}
                          >
                            ₩{Math.round(game.currentPricekrw / (1 - game.discountPercent / 100)).toLocaleString()}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: "clamp(0.85rem, 2.2vw, 1rem)",
                            fontWeight: 700,
                            color: game.isFree ? "#4ade80" : "#f1f5f9",
                          }}
                        >
                          {game.isFree ? "무료" : `₩${game.currentPricekrw.toLocaleString()}`}
                        </span>
                      </div>
                      <button
                        style={{
                          background: "linear-gradient(90deg,#7c3aed,#db2777)",
                          border: "none",
                          borderRadius: 8,
                          padding: "0.35rem 0.85rem",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "#fff",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.opacity = "0.8")}
                        onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.opacity = "1")}
                        onClick={() => window.open(`/games/${game.id}`, "_blank")}
                      >
                        상세 보기
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 글로벌 스타일 ── */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// ─── 보조 컴포넌트: 스탯 셀 ──────────────────────────────────────────────────
function StatCell({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        borderRadius: 8,
        padding: "0.4rem 0.5rem",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "0.6rem", color: "#475569", marginBottom: 2, whiteSpace: "nowrap" }}>
        {label}
      </div>
      <div
        style={{
          fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
          fontWeight: 700,
          color,
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "0.58rem",
          color: "#475569",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {sub}
      </div>
    </div>
  );
}
