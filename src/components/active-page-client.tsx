"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CSSProperties, useMemo, useState } from "react";
import { ChevronRight, Home, LayoutGrid, Sparkles, Store } from "lucide-react";
import { getSteamStoreUrl } from "@/lib/data";

type ActiveGame = {
  steamAppId: number;
  slug: string;
  name: string;
  headerImage: string;
  genre: string[];
  tags: string[];
  updateDate: string;
  daysSinceUpdate: number;
  reviewScore: number;
  reviewCount: number;
  currentPricekrw: number;
  discountPercent: number;
  streamViewers: number;
  streamChannels: number;
  isKorean: boolean;
  isFree: boolean;
};

const DUMMY_GAMES: ActiveGame[] = [
  {
    steamAppId: 1245620,
    slug: "elden-ring",
    name: "엘든 링",
    headerImage: "https://cdn.akamai.steamstatic.com/steam/apps/1245620/header.jpg",
    genre: ["RPG", "액션"],
    tags: ["오픈 월드", "어려움", "다크 판타지"],
    updateDate: "2026-04-18",
    daysSinceUpdate: 3,
    reviewScore: 96,
    reviewCount: 921000,
    currentPricekrw: 64800,
    discountPercent: 10,
    streamViewers: 42800,
    streamChannels: 312,
    isKorean: true,
    isFree: false,
  },
  {
    steamAppId: 553850,
    slug: "helldivers-2",
    name: "Helldivers 2",
    headerImage: "https://cdn.akamai.steamstatic.com/steam/apps/553850/header.jpg",
    genre: ["TPS", "협동"],
    tags: ["실시간 작전", "팀플레이", "이벤트"],
    updateDate: "2026-04-20",
    daysSinceUpdate: 1,
    reviewScore: 84,
    reviewCount: 612000,
    currentPricekrw: 31600,
    discountPercent: 20,
    streamViewers: 105700,
    streamChannels: 794,
    isKorean: true,
    isFree: false,
  },
  {
    steamAppId: 413150,
    slug: "stardew-valley",
    name: "스타듀 밸리",
    headerImage: "https://cdn.akamai.steamstatic.com/steam/apps/413150/header.jpg",
    genre: ["시뮬레이션", "RPG"],
    tags: ["농장", "힐링", "픽셀"],
    updateDate: "2026-04-10",
    daysSinceUpdate: 11,
    reviewScore: 98,
    reviewCount: 780000,
    currentPricekrw: 7600,
    discountPercent: 40,
    streamViewers: 28200,
    streamChannels: 434,
    isKorean: true,
    isFree: false,
  },
  {
    steamAppId: 582010,
    slug: "monster-hunter-world",
    name: "Monster Hunter: World",
    headerImage: "https://cdn.akamai.steamstatic.com/steam/apps/582010/header.jpg",
    genre: ["액션", "협동"],
    tags: ["헌팅", "파밍", "보스전"],
    updateDate: "2026-04-14",
    daysSinceUpdate: 7,
    reviewScore: 90,
    reviewCount: 590000,
    currentPricekrw: 16000,
    discountPercent: 50,
    streamViewers: 52800,
    streamChannels: 456,
    isKorean: true,
    isFree: false,
  },
  {
    steamAppId: 2016590,
    slug: "dark-and-darker",
    name: "Dark and Darker",
    headerImage: "https://cdn.akamai.steamstatic.com/steam/apps/2016590/header.jpg",
    genre: ["PvPvE", "던전"],
    tags: ["익스트랙션", "하드코어", "파티플레이"],
    updateDate: "2026-04-19",
    daysSinceUpdate: 2,
    reviewScore: 78,
    reviewCount: 310000,
    currentPricekrw: 36000,
    discountPercent: 20,
    streamViewers: 85200,
    streamChannels: 638,
    isKorean: true,
    isFree: false,
  },
  {
    steamAppId: 730,
    slug: "counter-strike-2",
    name: "Counter-Strike 2",
    headerImage: "https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg",
    genre: ["FPS", "전략"],
    tags: ["경쟁", "e스포츠", "무료"],
    updateDate: "2026-04-21",
    daysSinceUpdate: 0,
    reviewScore: 75,
    reviewCount: 1200000,
    currentPricekrw: 0,
    discountPercent: 0,
    streamViewers: 240800,
    streamChannels: 2152,
    isKorean: true,
    isFree: true,
  },
  {
    steamAppId: 1432860,
    slug: "sun-haven",
    name: "Sun Haven",
    headerImage: "https://cdn.akamai.steamstatic.com/steam/apps/1432860/header.jpg",
    genre: ["시뮬레이션", "인디"],
    tags: ["농장", "판타지", "생활"],
    updateDate: "2026-04-13",
    daysSinceUpdate: 8,
    reviewScore: 87,
    reviewCount: 86000,
    currentPricekrw: 23200,
    discountPercent: 20,
    streamViewers: 13900,
    streamChannels: 208,
    isKorean: true,
    isFree: false,
  },
  {
    steamAppId: 972660,
    slug: "spiritfarer",
    name: "Spiritfarer",
    headerImage: "https://cdn.akamai.steamstatic.com/steam/apps/972660/header.jpg",
    genre: ["어드벤처", "힐링"],
    tags: ["감성", "스토리", "인디"],
    updateDate: "2026-04-09",
    daysSinceUpdate: 12,
    reviewScore: 91,
    reviewCount: 117000,
    currentPricekrw: 8250,
    discountPercent: 75,
    streamViewers: 10100,
    streamChannels: 142,
    isKorean: true,
    isFree: false,
  },
];

type SortKey = "update" | "viewers" | "review" | "discount";
type GenreFilter = "all" | "RPG" | "FPS" | "시뮬레이션" | "액션" | "협동" | "어드벤처";

function reviewLabel(score: number) {
  if (score >= 95) return { label: "압도적 긍정", color: "#4ade80" };
  if (score >= 80) return { label: "매우 긍정적", color: "#86efac" };
  if (score >= 70) return { label: "대체로 긍정적", color: "#fde68a" };
  if (score >= 40) return { label: "복합적", color: "#fdba74" };
  return { label: "부정적", color: "#f87171" };
}

function freshnessColor(days: number) {
  if (days <= 1) return "#c084fc";
  if (days <= 3) return "#e879f9";
  if (days <= 7) return "#a78bfa";
  return "#6b7280";
}

function freshnessLabel(days: number) {
  if (days === 0) return "오늘 업데이트";
  if (days === 1) return "어제 업데이트";
  return `${days}일 전 업데이트`;
}

function formatCompactNumber(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}만`;
  return value.toLocaleString();
}

export default function ActivePageClient() {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("update");
  const [genreFilter, setGenreFilter] = useState<GenreFilter>("all");
  const [koreanOnly, setKoreanOnly] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);

  const filtered = useMemo(() => {
    return [...DUMMY_GAMES]
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
  }, [sortKey, genreFilter, koreanOnly, freeOnly]);

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "update", label: "⚡ 최신 업데이트" },
    { key: "viewers", label: "📺 시청자 수" },
    { key: "review", label: "⭐ 평점 순" },
    { key: "discount", label: "🔥 할인율 순" },
  ];

  const genres: GenreFilter[] = ["all", "RPG", "FPS", "시뮬레이션", "액션", "협동", "어드벤처"];

  return (
    <div
      style={{
        minHeight: "100%",
        background: "transparent",
        fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
        color: "#e2e8f0",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <section
          style={{
            marginBottom: "1.5rem",
            borderRadius: 24,
            border: "1px solid rgba(192,132,252,0.18)",
            background:
              "radial-gradient(circle at left top, rgba(192,132,252,0.22), transparent 28%), linear-gradient(135deg, rgba(23,10,43,0.96), rgba(17,24,39,0.92))",
            padding: "1.35rem",
            boxShadow: "0 24px 80px rgba(0,0,0,0.24)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            <div style={{ maxWidth: 680 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  borderRadius: 999,
                  padding: "0.35rem 0.75rem",
                  background: "rgba(255,255,255,0.06)",
                  color: "#e9d5ff",
                  fontSize: "0.78rem",
                  marginBottom: "0.9rem",
                }}
              >
                <Sparkles size={14} /> 지금 많이 움직이는 게임만 빠르게 보기
              </div>
              <h1
                style={{
                  fontSize: "clamp(1.6rem, 4vw, 2.35rem)",
                  fontWeight: 800,
                  margin: 0,
                  background: "linear-gradient(90deg, #f5d0fe, #c4b5fd, #67e8f9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                활성 게임 추천
              </h1>
              <p
                style={{
                  color: "#a5b4fc",
                  fontSize: "0.96rem",
                  marginTop: "0.75rem",
                  marginBottom: 0,
                  lineHeight: 1.7,
                }}
              >
                최근 업데이트와 스트리밍 반응을 기준으로 지금 주목할 만한 게임을 모았습니다.
                게임 카드를 누르면 상세 페이지로 바로 이동하고, Steam 버튼으로 상점 페이지도 바로 확인할 수 있습니다.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link href="/" style={topLinkStyle}>
                <Home size={16} /> 홈으로
              </Link>
              <Link href="/rankings?tab=streamerTop" style={topLinkStyle}>
                <LayoutGrid size={16} /> 스트리머 Top 10
              </Link>
              <Link href="/recommend" style={topLinkStyle}>
                <ChevronRight size={16} /> 추천 받기
              </Link>
            </div>
          </div>
        </section>

        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(192,132,252,0.2)",
            borderRadius: 18,
            padding: "1rem 1.2rem",
            marginBottom: "1rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {sortOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortKey(opt.key)}
                style={{
                  padding: "0.45rem 0.9rem",
                  borderRadius: 999,
                  border: "1px solid",
                  borderColor: sortKey === opt.key ? "#c084fc" : "rgba(255,255,255,0.1)",
                  background: sortKey === opt.key
                    ? "linear-gradient(90deg,rgba(192,132,252,0.25),rgba(244,114,182,0.16))"
                    : "transparent",
                  color: sortKey === opt.key ? "#f5d0fe" : "#94a3b8",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                  fontWeight: 600,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />

          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setGenreFilter(g)}
                style={{
                  padding: "0.4rem 0.8rem",
                  borderRadius: 999,
                  border: "1px solid",
                  borderColor: genreFilter === g ? "#f472b6" : "rgba(255,255,255,0.08)",
                  background: genreFilter === g ? "rgba(244,114,182,0.15)" : "transparent",
                  color: genreFilter === g ? "#fce7f3" : "#64748b",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >
                {g === "all" ? "전체" : g}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <label style={toggleLabel(koreanOnly ? "#c084fc" : "#64748b")}>
              <input
                type="checkbox"
                checked={koreanOnly}
                onChange={(e) => setKoreanOnly(e.target.checked)}
                style={{ accentColor: "#c084fc" }}
              />
              한국어 지원
            </label>
            <label style={toggleLabel(freeOnly ? "#f472b6" : "#64748b")}>
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

        <div style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: "1rem" }}>
          {filtered.length}개 게임 · 카드를 누르면 상세 페이지로 바로 이동
        </div>

        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#64748b",
              padding: "4rem 0",
              fontSize: "0.95rem",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.03)",
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
              const originalPrice =
                !game.isFree && game.discountPercent > 0
                  ? Math.round(game.currentPricekrw / (1 - game.discountPercent / 100))
                  : game.currentPricekrw;

              return (
                <article
                  key={game.steamAppId}
                  role="button"
                  tabIndex={0}
                  aria-label={`${game.name} 상세 페이지로 이동`}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(192,132,252,0.12)",
                    borderRadius: 18,
                    overflow: "hidden",
                    transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                    animation: `fadeUp 0.4s ease ${idx * 0.05}s both`,
                  }}
                  onClick={() => router.push(`/games/${game.steamAppId}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/games/${game.steamAppId}`);
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.borderColor = "rgba(192,132,252,0.4)";
                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(192,132,252,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "rgba(192,132,252,0.12)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ position: "relative", height: 150, overflow: "hidden" }}>
                    <img
                      src={game.headerImage}
                      alt={game.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        background: "rgba(0,0,0,0.75)",
                        border: `1px solid ${fc}`,
                        borderRadius: 999,
                        padding: "3px 9px",
                        fontSize: "0.68rem",
                        color: fc,
                        backdropFilter: "blur(4px)",
                        fontWeight: 700,
                      }}
                    >
                      {freshnessLabel(game.daysSinceUpdate)}
                    </div>
                    {game.discountPercent > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          background: "linear-gradient(135deg,#7c3aed,#db2777)",
                          borderRadius: 8,
                          padding: "3px 9px",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          color: "#fff",
                        }}
                      >
                        -{game.discountPercent}%
                      </div>
                    )}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 56,
                        background: "linear-gradient(to top, rgba(15,10,30,0.96), transparent)",
                      }}
                    />
                  </div>

                  <div style={{ padding: "1rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.75rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1rem",
                          fontWeight: 800,
                          color: "#f8fafc",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {game.name}
                      </div>
                      <span style={{ fontSize: "0.72rem", color: "#94a3b8", whiteSpace: "nowrap" }}>
                        {game.updateDate}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.8rem" }}>
                      {game.genre.slice(0, 2).map((g) => (
                        <span key={g} style={chipStyle("rgba(129,140,248,0.12)", "rgba(129,140,248,0.2)", "#a5b4fc")}>
                          {g}
                        </span>
                      ))}
                      {game.isKorean && (
                        <span style={chipStyle("rgba(244,114,182,0.1)", "rgba(244,114,182,0.2)", "#f9a8d4")}>한국어</span>
                      )}
                      {game.tags.slice(0, 1).map((tag) => (
                        <span key={tag} style={chipStyle("rgba(255,255,255,0.04)", "rgba(255,255,255,0.08)", "#cbd5e1")}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "0.45rem",
                        marginBottom: "0.95rem",
                      }}
                    >
                      <StatCell label="평점" value={`${game.reviewScore}%`} sub={rv.label} color={rv.color} />
                      <StatCell
                        label="시청자"
                        value={formatCompactNumber(game.streamViewers)}
                        sub={`채널 ${game.streamChannels}`}
                        color="#c084fc"
                      />
                      <StatCell
                        label="리뷰"
                        value={formatCompactNumber(game.reviewCount)}
                        sub="누적"
                        color="#94a3b8"
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.75rem",
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        paddingTop: "0.8rem",
                      }}
                    >
                      <div>
                        {!game.isFree && game.discountPercent > 0 && (
                          <span
                            style={{
                              display: "block",
                              fontSize: "0.72rem",
                              color: "#64748b",
                              textDecoration: "line-through",
                              marginBottom: "0.15rem",
                            }}
                          >
                            ₩{originalPrice.toLocaleString()}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: "1rem",
                            fontWeight: 800,
                            color: game.isFree ? "#4ade80" : "#f8fafc",
                          }}
                        >
                          {game.isFree ? "무료" : `₩${game.currentPricekrw.toLocaleString()}`}
                        </span>
                      </div>

                      <a
                        href={getSteamStoreUrl(game.steamAppId)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.45rem",
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 10,
                          padding: "0.45rem 0.85rem",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: "#fff",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Store size={14} /> Steam
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

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
        borderRadius: 10,
        padding: "0.5rem",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "0.62rem", color: "#475569", marginBottom: 2, whiteSpace: "nowrap" }}>
        {label}
      </div>
      <div style={{ fontSize: "0.9rem", fontWeight: 800, color, whiteSpace: "nowrap" }}>
        {value}
      </div>
      <div
        style={{
          fontSize: "0.6rem",
          color: "#64748b",
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

const topLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  borderRadius: 14,
  padding: "0.85rem 1rem",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.05)",
  color: "#f8fafc",
  fontSize: "0.85rem",
  fontWeight: 700,
};

function chipStyle(background: string, borderColor: string, color: string): CSSProperties {
  return {
    background,
    border: `1px solid ${borderColor}`,
    borderRadius: 999,
    padding: "2px 8px",
    fontSize: "0.68rem",
    color,
    whiteSpace: "nowrap",
  };
}

function toggleLabel(color: string): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: "0.45rem",
    cursor: "pointer",
    fontSize: "0.8rem",
    color,
    whiteSpace: "nowrap",
  };
}
