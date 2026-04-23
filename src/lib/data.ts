export type Game = {
  slug: string;
  title: string;
  steamAppId: number;
  genre: string[];
  tags: string[];
  platforms: string[];
  priceKRW: number;
  originalKRW: number;
  prices: {
    kr: string;
    jp: string;
    us: string;
  };
  score: number;
  reviewLabel: string;
  discountRate: number;
  reason: string[];
  playtime: string;
  updateStatus: string;
  streamStatus: string;
  predictedSale: string[];
  similar: string[];
  news: { title: string; date: string; text: string }[];
  summary: string;
};

export type StatPanel = {
  title: string;
  accent: 'purple' | 'pink' | 'cyan' | 'amber';
  leftLabel: string;
  rightLabel: string;
  bars: number[];
};

export const games: Game[] = [
  {
    slug: 'stardew-valley',
    title: 'Stardew Valley',
    steamAppId: 413150,
    genre: ['시뮬레이션', '농장', '힐링'],
    tags: ['힐링', '농장', '도트', '협동'],
    platforms: ['Windows', 'Mac', 'Linux'],
    priceKRW: 7600,
    originalKRW: 12800,
    prices: { kr: '₩7,600', jp: '¥760', us: '$9.99' },
    score: 96,
    reviewLabel: '매우 긍정적',
    discountRate: 40,
    reason: ['지속 업데이트', '높은 플레이타임', '가성비 우수', '한국어 지원'],
    playtime: '평균 82시간',
    updateStatus: '1.6 이후 이벤트/밸런스 패치 반영',
    streamStatus: '트위치/치지직 봄 시즌 관심도 상승',
    predictedSale: ['18일 예상 할인 시작', '22일 최대 할인 예상', '25일 할인 종료 예상'],
    similar: ['sun-haven', 'travellers-rest', 'graveyard-keeper'],
    summary: '할인율, 평점, 한국어 지원, 플레이타임을 종합했을 때 입문/힐링/협동 사용자에게 가장 무난한 추천작입니다.',
    news: [
      { title: '봄 시즌 플레이 지역 확대 예정', date: '2026.04.18', text: '봄 작물 수급 동선과 축제 편의성을 높이는 소규모 밸런스 조정이 예고되었습니다.' },
      { title: '커뮤니티 모드 호환성 개선', date: '2026.04.15', text: '핵심 모드와의 충돌이 줄어들 예정이라 복귀 유저 유입이 늘어날 가능성이 큽니다.' },
    ],
  },
  {
    slug: 'monster-hunter-world',
    title: 'Monster Hunter: World',
    steamAppId: 582010,
    genre: ['액션', '헌팅', '협동'],
    tags: ['보스전', '멀티플레이', '장비파밍'],
    platforms: ['Windows'],
    priceKRW: 16000,
    originalKRW: 32000,
    prices: { kr: '₩16,000', jp: '¥1,980', us: '$14.99' },
    score: 90,
    reviewLabel: '매우 긍정적',
    discountRate: 50,
    reason: ['협동 플레이 강점', 'DLC까지 확장 가능', '할인 빈도 높음'],
    playtime: '평균 148시간',
    updateStatus: '이벤트 퀘스트 로테이션 유지',
    streamStatus: '시청자 유입 안정적',
    predictedSale: ['18일 예상 할인 시작', '22일 최대 할인 예상', '25일 할인 종료 예상'],
    similar: ['wild-hearts', 'dauntless', 'monster-hunter-rise'],
    summary: '긴 플레이타임과 협동 경험이 강점이라 친구와 함께 오래 즐길 게임을 찾는 사용자에게 유리합니다.',
    news: [
      { title: '이벤트 퀘스트 재개방', date: '2026.04.14', text: '복귀 유저와 신규 유저를 위한 장비 파밍 구간 접근성이 개선되었습니다.' },
    ],
  },
  {
    slug: 'elden-ring',
    title: 'Elden Ring',
    steamAppId: 1245620,
    genre: ['액션 RPG', '오픈월드'],
    tags: ['소울라이크', '탐험', '난이도'],
    platforms: ['Windows'],
    priceKRW: 64800,
    originalKRW: 72000,
    prices: { kr: '₩64,800', jp: '¥7,920', us: '$59.99' },
    score: 94,
    reviewLabel: '압도적으로 긍정적',
    discountRate: 10,
    reason: ['장기 베스트셀러', '높은 완성도', 'DLC 연계'],
    playtime: '평균 110시간',
    updateStatus: 'DLC 이후 안정화 패치 진행',
    streamStatus: '대형 업데이트 시점 급상승',
    predictedSale: ['18일 관망', '22일 중간 확률', '25일 이후 대형 세일 대기'],
    similar: ['dark-souls-3', 'lies-of-p', 'lords-of-the-fallen'],
    summary: '높은 가격대라 즉시 구매보다 대형 시즌 세일까지 대기하는 전략이 더 유리합니다.',
    news: [
      { title: '밸런스 패치 적용', date: '2026.04.11', text: '일부 무기군과 적 AI 밸런스가 재조정되었습니다.' },
    ],
  },
  {
    slug: 'dark-and-darker',
    title: 'Dark and Darker',
    steamAppId: 2016590,
    genre: ['PvPvE', '던전'],
    tags: ['익스트랙션', '파티플레이', '하드코어'],
    platforms: ['Windows'],
    priceKRW: 36000,
    originalKRW: 45000,
    prices: { kr: '₩36,000', jp: '¥3,980', us: '$29.99' },
    score: 78,
    reviewLabel: '대체로 긍정적',
    discountRate: 20,
    reason: ['스트리머 화제성', '하드코어 경쟁 구도'],
    playtime: '평균 64시간',
    updateStatus: '시즌 로테이션 패치',
    streamStatus: '스트리머 지표 강함',
    predictedSale: ['18일 단기 할인 가능성', '22일 최대 화제성', '25일 변동성 큼'],
    similar: ['hunt-showdown', 'escape-from-tarkov', 'darkest-dungeon'],
    summary: '스트리밍 화제성과 경쟁 요소는 강하지만 난이도가 높아 취향을 많이 탑니다.',
    news: [
      { title: '시즌 밸런스 조정', date: '2026.04.17', text: '직업별 생존력과 파밍 효율이 조정되었습니다.' },
    ],
  },
  {
    slug: 'helldivers-2',
    title: 'Helldivers™ 2',
    steamAppId: 553850,
    genre: ['액션', '협동', '슈팅'],
    tags: ['협동', 'TPS', '라이브서비스'],
    platforms: ['Windows'],
    priceKRW: 31600,
    originalKRW: 39500,
    prices: { kr: '₩31,600', jp: '¥3,990', us: '$31.99' },
    score: 84,
    reviewLabel: '매우 긍정적',
    discountRate: 20,
    reason: ['협동 재미', '이벤트 잦음', '실시간 화제성'],
    playtime: '평균 71시간',
    updateStatus: '실시간 미션 갱신',
    streamStatus: '시즌 이벤트 때 강세',
    predictedSale: ['18일 번들 관망', '22일 시즌 이벤트 연동', '25일 추가 할인 보통'],
    similar: ['deep-rock-galactic', 'earth-defense-force-6', 'warhammer-darktide'],
    summary: '친구들과 당장 같이 즐길 게임이 필요하면 구매 만족도가 높은 편입니다.',
    news: [
      { title: '신규 작전 공개', date: '2026.04.16', text: '협동 난이도와 보상 효율이 조정된 신규 작전이 추가되었습니다.' },
    ],
  },
  {
    slug: 'ea-fc-24',
    title: 'EA SPORTS FC™ 24',
    steamAppId: 2195250,
    genre: ['스포츠', '축구'],
    tags: ['스포츠', '멀티플레이', '시즌'],
    platforms: ['Windows'],
    priceKRW: 21600,
    originalKRW: 72000,
    prices: { kr: '₩21,600', jp: '¥2,480', us: '$19.99' },
    score: 62,
    reviewLabel: '복합적',
    discountRate: 70,
    reason: ['할인폭 큼', '실시간 스포츠 시즌'],
    playtime: '평균 45시간',
    updateStatus: '로스터 업데이트',
    streamStatus: '스포츠 이벤트 기간 반등',
    predictedSale: ['지금 할인율이 높아 즉시 구매 쪽 우세', '22일 프로모션 가능', '25일 이후 할인폭 축소 가능'],
    similar: ['football-manager-2024', 'efootball', 'nba-2k24'],
    summary: '평점은 다소 갈리지만 할인폭이 커서 축구 팬에게는 가격 매력이 큽니다.',
    news: [
      { title: '시즌 스쿼드 반영', date: '2026.04.10', text: '최신 리그 퍼포먼스를 반영한 로스터 업데이트가 적용되었습니다.' },
    ],
  },
  {
    slug: 'counter-strike-2',
    title: 'Counter-Strike 2',
    steamAppId: 730,
    genre: ['FPS', '경쟁전'],
    tags: ['무료', 'e스포츠', '경쟁전'],
    platforms: ['Windows'],
    priceKRW: 0,
    originalKRW: 0,
    prices: { kr: '무료', jp: '무료', us: 'Free' },
    score: 75,
    reviewLabel: '복합적',
    discountRate: 0,
    reason: ['무료 입문 가능', '스트리밍 강세', '경쟁 유저층 두터움'],
    playtime: '평균 96시간',
    updateStatus: '맵 로테이션 및 밸런스 패치 진행',
    streamStatus: '스트리머 대회 시즌마다 급상승',
    predictedSale: ['무료 플레이 유지', '아이템 경제 변동성 존재', '대형 대회 시즌 화제성 상승'],
    similar: ['valorant', 'rainbow-six-siege', 'the-finals'],
    summary: '대표 경쟁 FPS 장르로 무료 유입이 가장 강한 장르 중 하나입니다.',
    news: [
      { title: '대회 시즌 패치 예고', date: '2026.04.12', text: '맵 밸런스와 무기 조정 중심의 시즌 패치가 예고되었습니다.' },
    ],
  },
  {
    slug: 'sun-haven',
    title: 'Sun Haven',
    steamAppId: 1432860,
    genre: ['농장', '판타지', '힐링'],
    tags: ['농장', '판타지', '도트'],
    platforms: ['Windows'],
    priceKRW: 23200,
    originalKRW: 29000,
    prices: { kr: '₩23,200', jp: '¥2,800', us: '$19.99' },
    score: 87,
    reviewLabel: '매우 긍정적',
    discountRate: 20,
    reason: ['스타듀 대체작', '콘텐츠 양 많음', '장르 팬 만족도 높음'],
    playtime: '평균 77시간',
    updateStatus: '생활 콘텐츠 확장 업데이트 지속',
    streamStatus: '힐링 장르 시즌에 완만한 상승',
    predictedSale: ['18일 할인 가능성 중간', '22일 테마 묶음 할인 가능', '25일 이후 장기 관망'],
    similar: ['stardew-valley', 'travellers-rest', 'coral-island'],
    summary: '판타지 요소가 강화된 농장/생활 시뮬레이션으로 스타듀 대체작 수요가 높습니다.',
    news: [
      { title: '신규 판타지 지역 공개', date: '2026.04.13', text: '생활 스킬과 탐험 요소를 함께 강화하는 중형 업데이트가 진행 중입니다.' },
    ],
  },
  {
    slug: 'travellers-rest',
    title: 'Travellers Rest',
    steamAppId: 1139980,
    genre: ['운영', '힐링', '시뮬레이션'],
    tags: ['운영', '도트', '힐링'],
    platforms: ['Windows'],
    priceKRW: 13300,
    originalKRW: 19000,
    prices: { kr: '₩13,300', jp: '¥1,520', us: '$11.99' },
    score: 82,
    reviewLabel: '매우 긍정적',
    discountRate: 30,
    reason: ['힐링 운영 감성', '가격 부담 적음', '도트 그래픽 선호층 강함'],
    playtime: '평균 54시간',
    updateStatus: '숙박/양조 콘텐츠 확장 중',
    streamStatus: '힐링 인디 큐레이션에 자주 등장',
    predictedSale: ['18일 할인 시작 가능', '22일 주말 프로모션 기대', '25일 종료 예상'],
    similar: ['stardew-valley', 'sun-haven', 'graveyard-keeper'],
    summary: '선술집 운영과 제작 동선이 결합된 힐링 경영형 게임입니다.',
    news: [
      { title: '숙박 시스템 개편 예고', date: '2026.04.11', text: '손님 동선과 운영 효율을 개선하는 UI 패치가 예고되었습니다.' },
    ],
  },
  {
    slug: 'spiritfarer',
    title: 'Spiritfarer',
    steamAppId: 972660,
    genre: ['감성', '어드벤처', '힐링'],
    tags: ['감성', '스토리', '힐링'],
    platforms: ['Windows', 'Mac'],
    priceKRW: 8250,
    originalKRW: 33000,
    prices: { kr: '₩8,250', jp: '¥980', us: '$7.49' },
    score: 91,
    reviewLabel: '압도적으로 긍정적',
    discountRate: 75,
    reason: ['가성비 매우 높음', '스토리 완성도 우수', '할인률 큼'],
    playtime: '평균 30시간',
    updateStatus: '완결형 작품으로 안정적',
    streamStatus: '감성 게임 추천 시즌에 상승',
    predictedSale: ['지금 구매 메리트 매우 높음', '22일 추가 번들 가능', '25일 이후 할인폭 유지 가능성'],
    similar: ['gris', 'ori-and-the-blind-forest', 'stardew-valley'],
    summary: '감성적인 이야기와 느린 운영 루프가 돋보이는 힐링 어드벤처입니다.',
    news: [
      { title: '감성 게임 큐레이션 재조명', date: '2026.04.09', text: '인디 추천 컬렉션에서 할인률과 평점 조합이 다시 주목받고 있습니다.' },
    ],
  },
  {
    slug: 'turbo-golf-racing',
    title: 'Turbo Golf Racing',
    steamAppId: 1324350,
    genre: ['캐주얼', '멀티', '레이싱'],
    tags: ['파티', '캐주얼', '레이싱'],
    platforms: ['Windows'],
    priceKRW: 17200,
    originalKRW: 21500,
    prices: { kr: '₩17,200', jp: '¥1,980', us: '$14.99' },
    score: 77,
    reviewLabel: '대체로 긍정적',
    discountRate: 20,
    reason: ['가벼운 파티 플레이', '짧은 세션 강점', '친구들과 접근 쉬움'],
    playtime: '평균 18시간',
    updateStatus: '이벤트 트랙 순환',
    streamStatus: '짧은 멀티 플레이 방송에서 간헐적 상승',
    predictedSale: ['18일 소폭 할인 가능', '22일 주말 묶음 할인 기대', '25일 이후 변동 적음'],
    similar: ['rocket-league', 'golf-with-your-friends', 'fall-guys'],
    summary: '캐주얼 멀티 레이싱과 골프를 결합한 가벼운 파티 게임입니다.',
    news: [
      { title: '신규 코스 로테이션 시작', date: '2026.04.08', text: '주간 챌린지 코스가 바뀌며 다시 유입이 늘고 있습니다.' },
    ],
  }

];

export const rankingGroups = {
  localTop: ['helldivers-2', 'monster-hunter-world', 'dark-and-darker', 'elden-ring', 'stardew-valley', 'ea-fc-24', 'counter-strike-2', 'spiritfarer'],
  globalTop: ['stardew-valley', 'spiritfarer', 'helldivers-2', 'elden-ring', 'monster-hunter-world', 'ea-fc-24', 'sun-haven'],
  streamerTop: ['dark-and-darker', 'helldivers-2', 'counter-strike-2', 'monster-hunter-world', 'stardew-valley', 'elden-ring'],
  bestWorst: ['ea-fc-24', 'dark-and-darker', 'counter-strike-2', 'stardew-valley', 'elden-ring', 'monster-hunter-world'],
};

export const statPanels: StatPanel[] = [
  { title: '비슷한 게임 추천', accent: 'purple', leftLabel: '리듬/농장 감성', rightLabel: '모험형 지도', bars: [62, 44, 71, 53] },
  { title: '할인 예측', accent: 'pink', leftLabel: 'Frequency', rightLabel: 'Ratio', bars: [38, 31, 66, 79] },
  { title: '평균 선호도', accent: 'cyan', leftLabel: 'Country', rightLabel: 'Streamer', bars: [76, 68, 54, 72] },
  { title: '스토리 인기 게임', accent: 'amber', leftLabel: 'sentimental type', rightLabel: 'romantic', bars: [58, 49, 61, 40] },
  { title: '추천 dlc', accent: 'purple', leftLabel: 'Salt TV', rightLabel: 'Ruins De creators', bars: [48, 72, 51, 63] },
];

export function getGame(slug: string) {
  return games.find((game) => game.slug === slug) ?? games[0];
}

export function getGameById(steamAppId: number) {
  return games.find((game) => game.steamAppId === steamAppId) ?? games[0];
}

export function resolveGame(identifier: string | number) {
  if (typeof identifier === 'number') {
    return getGameById(identifier);
  }

  const normalized = String(identifier).trim();
  const parsedId = Number(normalized);

  if (!Number.isNaN(parsedId) && normalized === String(parsedId)) {
    return getGameById(parsedId);
  }

  return games.find((game) => game.slug === normalized) ?? games[0];
}

export function getDailyRecommendedGame(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));
  return games[day % games.length];
}

export function getSteamHeader(appId: number) {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`;
}

export function getSteamCapsule(appId: number) {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/capsule_616x353.jpg`;
}

export function getSteamStoreUrl(appId: number) {
  return `https://store.steampowered.com/app/${appId}`;
}

export function getRankingEntries(group: keyof typeof rankingGroups) {
  const badgeMap = ['최대 할인율', '최근 업데이트', '스트리머 급상승', '국가별 top100', '세일 진행중', '평균 평점 상위'];

  return Array.from({ length: 100 }).map((_, index) => {
    const slug = rankingGroups[group][index % rankingGroups[group].length];
    const game = getGame(slug);
    const score = Math.max(54, game.score + 4 - (index % 14));

    return {
      rank: index + 1,
      game,
      scoreText: `${group === 'streamerTop' ? '방송 반응' : '종합 점수'} ${score.toFixed(1)}`,
      badge: badgeMap[index % badgeMap.length],
    };
  });
}

export function searchGames(query: string) {
  if (!query.trim()) return games;

  const q = query.toLowerCase();
  return games.filter((game) =>
    [game.title, ...game.genre, ...game.tags].join(' ').toLowerCase().includes(q)
  );
}



export const saleNews = [
  {
    title: '스타듀밸리 봄 시즌 이벤트 예고',
    label: '할인 뉴스',
    text: '봄 시즌을 맞아 플레이 지역이 추가될 예정이라는 가정의 패치 노트 카드 예시입니다.',
  },
  {
    title: '캡콤 봄 프로모션 후보작 체크',
    label: '할인 뉴스',
    text: '몬스터 헌터 월드는 대형 시즌 세일에서 반복적으로 할인되는 편입니다.',
  },
  {
    title: '엘든 링 확장팩 이후 재유입 증가',
    label: '게임 소개 기사',
    text: 'DLC 이후 다시 플레이를 시작하는 이용자가 늘어 탐험형 게임 수요가 살아나고 있습니다.',
  },
  {
    title: '헬다이버즈2 봄 이벤트 작전 시작',
    label: '업데이트',
    text: '분대 기반 대형 방어 이벤트가 시작되며 스트리밍 노출도도 다시 올랐습니다.',
  },
  {
    title: '힐링 게임 추천 키워드 급상승',
    label: '추천 기사',
    text: '농장/생활 시뮬레이션 장르가 봄 시즌 추천 큐레이션에서 강세입니다.',
  },
] as const;
