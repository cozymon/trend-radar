import { NextResponse } from "next/server";

export const revalidate = 3600;

type TrendSeed = {
  title: string;
  category: string;
  mood: string;
  query: string;
  googleHints: string[];
  tags: string[];
  baseSummary: string;
  baseLiquidity: number;
};

const seeds: TrendSeed[] = [
  {
    title: "AI와 함께 일하는 개인 창작자",
    category: "Tech / Lifestyle",
    mood: "효율과 불안",
    query: '"AI creator" OR "AI workflow" OR "AI music" OR "AI video creator"',
    googleHints: ["AI", "인공지능", "챗GPT", "ChatGPT", "AI 음악", "AI 영상"],
    tags: ["AI workflow", "1인 창작", "자동화"],
    baseSummary: "개인이 AI 도구를 조합해 생산성과 창작 속도를 높이는 흐름.",
    baseLiquidity: 82,
  },
  {
    title: "저속노화 라이프스타일",
    category: "Lifestyle",
    mood: "통제감",
    query: '"slow aging" OR longevity OR "health routine" OR "anti aging diet" OR 저속노화',
    googleHints: ["저속노화", "노화", "건강", "수면", "식단", "러닝"],
    tags: ["건강", "수면", "식단"],
    baseSummary: "식단, 운동, 수면, 루틴 콘텐츠로 확장되는 건강 관리 흐름.",
    baseLiquidity: 68,
  },
  {
    title: "죄책감 없는 디저트",
    category: "Food",
    mood: "작은 사치",
    query: '"low sugar dessert" OR "greek yogurt" OR "matcha dessert" OR "protein snack" OR 그릭요거트 OR 말차',
    googleHints: ["말차", "그릭요거트", "요거트", "저당", "제로", "프로틴", "디저트"],
    tags: ["말차", "그릭요거트", "저당"],
    baseSummary: "건강도 챙기고 보상도 원하는 소비 흐름.",
    baseLiquidity: 74,
  },
  {
    title: "촌스럽지만 귀여운 아날로그 감성",
    category: "Culture",
    mood: "향수",
    query: '"Y2K aesthetic" OR "digital camera aesthetic" OR "collage aesthetic" OR 디카 감성 OR Y2K',
    googleHints: ["Y2K", "디카", "필름", "콜라주", "싸이월드", "레트로"],
    tags: ["Y2K", "디카", "콜라주"],
    baseSummary: "디카, 콜라주, 종이 질감, 캠 감성이 연결되는 문화 흐름.",
    baseLiquidity: 45,
  },
  {
    title: "못생긴 귀여움",
    category: "Mood / Character",
    mood: "귀여움",
    query: '"ugly cute" OR "weird cute" OR "meme character" OR mascot OR 못생긴 귀여움',
    googleHints: ["못생긴", "귀여움", "밈", "캐릭터", "마스코트", "인형"],
    tags: ["ugly cute", "meme"],
    baseSummary: "완벽하지 않고 살짝 이상한 캐릭터에 정서적으로 반응하는 흐름.",
    baseLiquidity: 38,
  },
  {
    title: "개인 홈페이지 부활",
    category: "Culture / Web",
    mood: "자기 세계관",
    query: '"personal website" OR "personal homepage" OR "indie web" OR 개인 홈페이지',
    googleHints: ["홈페이지", "블로그", "개인 사이트", "포트폴리오", "랜딩페이지"],
    tags: ["personal website", "indie web"],
    baseSummary: "SNS 피로감 이후 자기 세계관을 직접 만들고 싶어하는 흐름.",
    baseLiquidity: 42,
  },
  {
    title: "조용한 팬덤형 브랜드",
    category: "Brand",
    mood: "소속감",
    query: '"community brand" OR "cult brand" OR "brand fandom" OR 팬덤 브랜드',
    googleHints: ["팬덤", "브랜드", "굿즈", "커뮤니티", "세계관"],
    tags: ["팬덤", "브랜드"],
    baseSummary: "작은 커뮤니티, 세계관, 꾸준한 톤을 가진 브랜드가 강해지는 흐름.",
    baseLiquidity: 58,
  },
];

function toGdeltDate(date: Date) {
  return date.toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
}

function stripGooglePrefix(text: string) {
  return text.replace(/^\)\]\}',?\n?/, "");
}

async function fetchGoogleDailyTrends() {
  try {
    const url = new URL("https://trends.google.com/trends/api/dailytrends");
    url.searchParams.set("hl", "ko");
    url.searchParams.set("tz", "-540");
    url.searchParams.set("geo", "KR");
    url.searchParams.set("ns", "15");

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "Mozilla/5.0 TrendRadar/0.2" },
    });

    if (!response.ok) throw new Error("Google Trends failed");

    const raw = await response.text();
    const data = JSON.parse(stripGooglePrefix(raw));
    const searches = data?.default?.trendingSearchesDays?.[0]?.trendingSearches || [];

    return searches.map((item: any) => ({
      title: item?.title?.query || "",
      traffic: item?.formattedTraffic || "",
      related: (item?.relatedQueries || []).map((q: any) => q?.query).filter(Boolean),
      articles: item?.articles || [],
    })).filter((item: any) => item.title);
  } catch {
    return [];
  }
}

async function getGdeltArticleCount(query: string, hoursAgo: number) {
  try {
    const start = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
    url.searchParams.set("query", query);
    url.searchParams.set("mode", "artlist");
    url.searchParams.set("format", "json");
    url.searchParams.set("maxrecords", "75");
    url.searchParams.set("startdatetime", toGdeltDate(start));

    const response = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!response.ok) return 0;

    const data = await response.json();
    return Array.isArray(data?.articles) ? data.articles.length : 0;
  } catch {
    return 0;
  }
}

function googleHintScore(seed: TrendSeed, googleTop: any[]) {
  const haystack = googleTop
    .flatMap((item) => [item.title, ...(item.related || [])])
    .join(" ")
    .toLowerCase();

  const hits = seed.googleHints.filter((hint) => haystack.includes(hint.toLowerCase())).length;
  const topTitleHit = googleTop.some((item) =>
    seed.googleHints.some((hint) => item.title.toLowerCase().includes(hint.toLowerCase()))
  );

  return {
    hits,
    score: Math.min(35, hits * 9 + (topTitleHit ? 8 : 0)),
  };
}

export async function GET() {
  const googleTopSearches = await fetchGoogleDailyTrends();

  const rows = await Promise.all(
    seeds.map(async (seed) => {
      const recent = await getGdeltArticleCount(seed.query, 24);
      const previous = await getGdeltArticleCount(seed.query, 72);
      const adjustedPrevious = Math.max(previous - recent, 1);
      const baseline = adjustedPrevious / 2;
      const velocity = ((recent - baseline) / baseline) * 100;
      const google = googleHintScore(seed, googleTopSearches);

      return {
        ...seed,
        recent,
        previous,
        velocity: Number.isFinite(velocity) ? velocity : 0,
        googleHits: google.hits,
        googleScore: google.score,
      };
    })
  );

  const maxRecent = Math.max(...rows.map((row) => row.recent), 1);
  const maxVelocity = Math.max(...rows.map((row) => Math.max(row.velocity, 0)), 1);

  const trends = rows
    .map((row) => {
      const newsVolumeScore = (row.recent / maxRecent) * 25;
      const velocityScore = (Math.max(row.velocity, 0) / maxVelocity) * 25;
      const googleScore = row.googleScore;
      const score = Math.round(Math.min(98, Math.max(45, 40 + googleScore + newsVolumeScore + velocityScore)));

      const attention = Math.round(Math.min(96, Math.max(20, 30 + googleScore * 1.4 + velocityScore)));
      const liquidity = Math.round(Math.min(95, Math.max(15, row.baseLiquidity + newsVolumeScore * 0.6)));
      const noise = Math.round(Math.min(90, Math.max(10, 55 - row.googleHits * 8 + Math.max(0, row.recent - 25) * 0.5)));

      return {
        rank: 0,
        title: row.title,
        category: row.category,
        score,
        interest: `${row.velocity >= 0 ? "+" : ""}${Math.round(row.velocity)}%`,
        momentum: score >= 88 ? "Very High" : score >= 78 ? "High" : "Medium",
        mood: row.mood,
        summary: `${row.baseSummary} Google Trends 매칭 ${row.googleHits}개, 최근 24시간 뉴스/웹 신호 ${row.recent}건이 감지되었습니다.`,
        tags: row.tags,
        liveCount: row.recent,
        googleHits: row.googleHits,
        attention,
        liquidity,
        noise,
        source: googleTopSearches.length ? "Google Trends + GDELT" : "GDELT",
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((trend, index) => ({ ...trend, rank: index + 1 }));

  // Alpha는 "이미 큰 트렌드"가 아니라 "아직 작지만 빠르게 커지는 신호"를 찾는 영역입니다.
  // 따라서 score 순위 그대로가 아니라:
  // 1) 관심 속도(attention)가 높고
  // 2) 노이즈가 낮고
  // 3) 너무 메인스트림화되지 않은 것
  // 4) Google Trends 또는 뉴스 신호가 최소 1개 이상 있는 것
  // 을 우선합니다.
  const alphaSignals = trends
    .map((trend) => {
      const earlyBonus = trend.score < 90 ? 10 : 0;
      const noisePenalty = Math.round(trend.noise * 0.35);
      const signalBonus = trend.googleHits > 0 ? 8 : 0;
      const alpha = Math.round(
        Math.min(98, Math.max(45, trend.attention * 0.55 + trend.score * 0.35 + earlyBonus + signalBonus - noisePenalty))
      );

      return {
        title: trend.title,
        category: trend.category,
        alpha,
        stage: alpha >= 85 ? "Emerging" : alpha >= 72 ? "Early Signal" : "Watch",
        confidence: Math.max(35, Math.min(90, 45 + trend.googleHits * 10 + Math.min(25, trend.liveCount))),
        reason: `관심 속도 ${trend.attention}/100, 유동성 프록시 ${trend.liquidity}/100, 노이즈 위험 ${trend.noise}/100. Google Trends 매칭 ${trend.googleHits}개와 뉴스/웹 신호 ${trend.liveCount}건을 함께 보정했습니다.`,
      };
    })
    .filter((signal) => signal.alpha >= 60)
    .sort((a, b) => b.alpha - a.alpha)
    .slice(0, 5);

  return NextResponse.json(
    {
      trends,
      alphaSignals,
      googleTopSearches: googleTopSearches.slice(0, 15),
      sourceLabel: googleTopSearches.length ? "Google Trends + News signals" : "Live news signals",
      updatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200",
      },
    }
  );
}
