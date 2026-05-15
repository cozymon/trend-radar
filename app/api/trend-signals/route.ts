import { NextResponse } from "next/server";

export const revalidate = 900;

const seeds = [
  { title: "AI와 함께 일하는 개인 창작자", category: "Tech / Lifestyle", mood: "효율과 불안", query: '"AI creator" OR "AI workflow" OR "AI music" OR "AI video creator"', tags: ["AI workflow", "1인 창작", "자동화"], baseSummary: "회사보다 개인이 툴을 조합해 생산성을 높이는 흐름." },
  { title: "저속노화 라이프스타일", category: "Lifestyle", mood: "통제감", query: '"slow aging" OR longevity OR "health routine" OR "anti aging diet"', tags: ["건강", "수면", "식단"], baseSummary: "식단, 운동, 수면, 루틴 콘텐츠로 확장." },
  { title: "죄책감 없는 디저트", category: "Food", mood: "작은 사치", query: '"low sugar dessert" OR "greek yogurt" OR "matcha dessert" OR "protein snack"', tags: ["말차", "그릭요거트", "저당"], baseSummary: "건강도 챙기고 보상도 원하는 소비 흐름." },
  { title: "촌스럽지만 귀여운 아날로그 감성", category: "Culture", mood: "향수", query: '"Y2K aesthetic" OR "digital camera aesthetic" OR "collage aesthetic"', tags: ["Y2K", "디카", "콜라주"], baseSummary: "디카, 콜라주, 종이 질감, 캠 감성이 연결됨." },
  { title: "못생긴 귀여움", category: "Mood / Character", mood: "귀여움", query: '"ugly cute" OR "weird cute" OR "meme character" OR mascot', tags: ["ugly cute", "meme"], baseSummary: "살짝 이상하고 웃긴 캐릭터에 정서적 반응이 강해지는 흐름." },
  { title: "개인 홈페이지 부활", category: "Culture / Web", mood: "자기 세계관", query: '"personal website" OR "personal homepage" OR "indie web"', tags: ["personal website", "indie web"], baseSummary: "SNS 피로감 이후 자기 세계관을 직접 만들고 싶어하는 흐름." },
  { title: "조용한 팬덤형 브랜드", category: "Brand", mood: "소속감", query: '"community brand" OR "cult brand" OR "brand fandom"', tags: ["팬덤", "브랜드"], baseSummary: "작은 커뮤니티, 세계관, 꾸준한 톤을 가진 브랜드가 강해지는 흐름." },
];

function toGdeltDate(date: Date) {
  return date.toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
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
    const response = await fetch(url.toString(), { next: { revalidate: 900 } });
    if (!response.ok) return 0;
    const data = await response.json();
    return Array.isArray(data?.articles) ? data.articles.length : 0;
  } catch {
    return 0;
  }
}

export async function GET() {
  const rows = await Promise.all(
    seeds.map(async (seed) => {
      const recent = await getGdeltArticleCount(seed.query, 24);
      const previous = await getGdeltArticleCount(seed.query, 72);
      const adjustedPrevious = Math.max(previous - recent, 1);
      const baseline = adjustedPrevious / 2;
      const velocity = ((recent - baseline) / baseline) * 100;
      return { ...seed, recent, velocity: Number.isFinite(velocity) ? velocity : 0 };
    })
  );

  const maxRecent = Math.max(...rows.map((row) => row.recent), 1);
  const maxVelocity = Math.max(...rows.map((row) => Math.max(row.velocity, 0)), 1);

  const trends = rows
    .map((row) => {
      const volumeScore = (row.recent / maxRecent) * 45;
      const velocityScore = (Math.max(row.velocity, 0) / maxVelocity) * 35;
      const score = Math.round(Math.min(96, Math.max(55, 45 + volumeScore + velocityScore)));
      return {
        rank: 0,
        title: row.title,
        category: row.category,
        score,
        interest: `${row.velocity >= 0 ? "+" : ""}${Math.round(row.velocity)}%`,
        momentum: score >= 88 ? "Very High" : score >= 78 ? "High" : "Medium",
        mood: row.mood,
        summary: `${row.baseSummary} 최근 24시간 GDELT 기준 관련 신호 ${row.recent}건이 감지되었습니다.`,
        tags: row.tags,
        liveCount: row.recent,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((trend, index) => ({ ...trend, rank: index + 1 }));

  const alphaSignals = trends.slice(0, 4).map((trend) => ({
    title: trend.title,
    category: trend.category,
    alpha: Math.max(65, trend.score - 4),
    stage: trend.score >= 88 ? "Emerging" : "Early Signal",
    reason: `최근 24시간 뉴스/웹 문서 신호 ${trend.liveCount}건 감지. 검색량·SNS 언급량을 붙이면 더 정밀해집니다.`,
  }));

  return NextResponse.json({ trends, alphaSignals }, {
    headers: { "Cache-Control": "s-maxage=900, stale-while-revalidate=1800" },
  });
}
