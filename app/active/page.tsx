import ActivePageClient from "@/components/active-page-client";

export const metadata = {
  title: "활성 게임 추천 | CG20 Steam Insight",
  description: "최근 업데이트·스트리밍 인기·평점을 종합해 지금 가장 활발한 게임을 추천해드립니다.",
};

export default function ActivePage() {
  return <ActivePageClient />;
}
