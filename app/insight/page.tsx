import { AppShell } from '@/components/app-shell';
import InsightPageClient from '@/components/insight-page-client';

export const metadata = {
  title: '데이터 인사이트 | CG20 Steam Insight',
  description: '가격 변동, 할인 패턴, 리뷰 분석, 국가별 가격, 언어 지원을 한눈에 확인하세요.',
};

export default function InsightPage() {
  return (
    <AppShell>
      <InsightPageClient />
    </AppShell>
  );
}
