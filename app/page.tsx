"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Radar,
  Search,
  SlidersHorizontal,
  RefreshCcw,
  Activity,
  Sparkles,
  Flame,
  Globe2,
  MapPin,
} from "lucide-react";

const fallbackMarket = [
  { key: "usdkrw", label: "USD/KRW", value: "—", change: "—", up: true, note: "수입물가 압박", source: "Demo" },
  { key: "kospi", label: "KOSPI", value: "—", change: "—", up: true, note: "한국 위험자산 심리", source: "Demo" },
  { key: "sp500", label: "S&P 500", value: "—", change: "—", up: true, note: "미국 대형주 흐름", source: "Demo" },
  { key: "nasdaq", label: "NASDAQ", value: "—", change: "—", up: true, note: "기술주 온도", source: "Demo" },
  { key: "dxy", label: "DXY", value: "—", change: "—", up: true, note: "달러 강세", source: "Demo" },
  { key: "gold", label: "Gold", value: "—", change: "—", up: true, note: "안전자산 선호", source: "Demo" },
  { key: "oil", label: "Oil", value: "—", change: "—", up: false, note: "생활비 영향", source: "Demo" },
  { key: "btc", label: "BTC", value: "—", change: "—", up: true, note: "디지털 자산 심리", source: "Demo" },
  { key: "cryptoExBtc", label: "Crypto Ex-BTC Market Cap", value: "—", change: "—", up: false, note: "BTC 제외 크립토 시총", source: "Demo" },
  { key: "kimchiPremium", label: "Kimchi Premium", value: "—", change: "—", up: true, note: "국내 BTC 프리미엄", source: "Demo" },
  { key: "cryptoFearGreed", label: "Crypto Fear & Greed", value: "—", change: "—", up: false, note: "크립토 투자심리", source: "Demo" },
];

const fallbackTrends = [
  { rank: 1, title: "죄책감 없는 디저트", category: "Food", score: 94, interest: "+42%", momentum: "Very High", mood: "작은 사치", summary: "맛있는 걸 먹고 싶지만 건강도 놓치고 싶지 않은 심리.", tags: ["말차", "그릭요거트", "저당"], attention: 84, liquidity: 72, noise: 22, source: "Demo" },
  { rank: 2, title: "촌스럽지만 귀여운 아날로그 감성", category: "Culture", score: 91, interest: "+38%", momentum: "High", mood: "향수", summary: "디카, 콜라주, 종이 질감, 캠 감성이 연결됨.", tags: ["Y2K", "디카", "콜라주"], attention: 78, liquidity: 45, noise: 30, source: "Demo" },
  { rank: 3, title: "AI와 함께 일하는 개인 창작자", category: "Tech / Lifestyle", score: 88, interest: "+35%", momentum: "High", mood: "효율과 불안", summary: "개인이 툴을 조합해 생산성을 높이는 흐름.", tags: ["AI workflow", "1인 창작"], attention: 88, liquidity: 82, noise: 38, source: "Demo" },
  { rank: 4, title: "못생긴 귀여움", category: "Mood / Character", score: 84, interest: "+31%", momentum: "High", mood: "귀여움", summary: "살짝 이상하고 웃긴 캐릭터에 반응하는 흐름.", tags: ["ugly cute", "meme"], attention: 71, liquidity: 36, noise: 45, source: "Demo" },
  { rank: 5, title: "저속노화 라이프스타일", category: "Lifestyle", score: 82, interest: "+29%", momentum: "Medium High", mood: "통제감", summary: "식단, 운동, 수면, 루틴 콘텐츠로 확장.", tags: ["건강", "수면"], attention: 76, liquidity: 68, noise: 28, source: "Demo" },
];

const fallbackAlpha = [
  {
    title: "개인 홈페이지 부활",
    category: "Culture / Web",
    alpha: 87,
    stage: "Early Signal",
    reason: "SNS 피로감 이후 자기 세계관을 직접 만들고 싶어하는 흐름입니다.",
    confidence: 62,
  },
  {
    title: "종이 콜라주 감성",
    category: "Visual",
    alpha: 84,
    stage: "Emerging",
    reason: "AI 이미지가 많아질수록 손으로 만든 듯한 물성과 아날로그 질감이 주목받습니다.",
    confidence: 58,
  },
];

type RegionMode = "KR" | "GLOBAL";

function ChangePill({ up, change }: { up: boolean; change: string }) {
  return (
    <span className={`flex items-center gap-1 text-sm font-medium ${up ? "text-emerald-400" : "text-red-400"}`}>
      {up ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
      {change}
    </span>
  );
}

function ScoreBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full bg-[#d7c4a1]" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const good = status.includes("Live") || status.includes("Partial") || status.includes("Google");
  return (
    <div className={`rounded-full border px-3 py-1 text-xs ${
      good ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-amber-300/20 bg-amber-300/10 text-amber-200"
    }`}>
      {status}
    </div>
  );
}

function RegionButton({
  active,
  label,
  desc,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  desc: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-3xl border p-4 text-left transition ${
        active
          ? "border-[#d7c4a1]/60 bg-[#d7c4a1] text-zinc-950"
          : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
      }`}
    >
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">{icon}{label}</div>
      <div className={`text-xs leading-5 ${active ? "text-zinc-700" : "text-zinc-500"}`}>{desc}</div>
    </button>
  );
}

export default function Page() {
  const [region, setRegion] = useState<RegionMode>("KR");
  const [market, setMarket] = useState(fallbackMarket);
  const [trends, setTrends] = useState(fallbackTrends);
  const [alpha, setAlpha] = useState<any[]>(fallbackAlpha);
  const [googleTop, setGoogleTop] = useState<any[]>([]);
  const [marketStatus, setMarketStatus] = useState("Connecting live data");
  const [trendStatus, setTrendStatus] = useState("Connecting trend data");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [selected, setSelected] = useState(fallbackMarket.map((x) => x.key));
  const [query, setQuery] = useState("");

  const loadData = async (targetRegion = region) => {
    try {
      setMarketStatus("Refreshing market data");
      const res = await fetch("/api/market-context?fresh=1", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMarket(data);
        setMarketStatus(data.every((x) => x.source && x.source !== "Demo") ? "Live market data" : "Partial live data");
      } else {
        throw new Error("bad market data");
      }
    } catch {
      setMarketStatus("Demo fallback");
    }

    try {
      setTrendStatus(`Refreshing ${targetRegion === "KR" ? "Korea" : "Global"} trend data`);
      const res = await fetch(`/api/trend-signals?region=${targetRegion}&fresh=1`, { cache: "no-store" });
      const data = await res.json();
      if (data?.trends) {
        setTrends(data.trends);
        setAlpha(data.alphaSignals || fallbackAlpha);
        setGoogleTop(data.googleTopSearches || []);
        setTrendStatus(data.sourceLabel || (targetRegion === "KR" ? "Korea trends" : "Global trends"));
      } else {
        throw new Error("bad trend data");
      }
    } catch {
      setTrends(fallbackTrends);
      setAlpha(fallbackAlpha);
      setTrendStatus("Demo trend data");
    }

    setUpdatedAt(new Date());
  };

  useEffect(() => {
    loadData(region);
    const timer = setInterval(() => loadData(region), 60_000);
    return () => clearInterval(timer);
  }, [region]);

  const visibleMarket = market.filter((item) => selected.includes(item.key));
  const visibleTrends = useMemo(() => {
    const q = query.toLowerCase().trim();
    return trends.filter((t) => !q || t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || (t.tags || []).some((tag: string) => tag.toLowerCase().includes(q)));
  }, [trends, query]);

  const topSignal = trends[0];
  const regionLabel = region === "KR" ? "국내" : "전세계";
  const flowCopy = region === "KR"
    ? "국내 검색 관심과 뉴스/웹 신호를 중심으로 한국 소비·문화 흐름을 봅니다."
    : "글로벌 검색 관심과 뉴스/웹 신호를 중심으로 전세계 문화·기술 흐름을 봅니다.";

  return (
    <main className="min-h-screen bg-[#070b0f] text-zinc-100">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(215,196,161,0.12),transparent_35%),radial-gradient(circle_at_top_right,rgba(42,123,255,0.10),transparent_32%)]" />
      <div className="relative mx-auto max-w-7xl px-5 py-6">
        <header className="mb-6 rounded-3xl border border-white/10 bg-[#10161d]/80 px-5 py-4 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d7c4a1] text-zinc-950">
                <Radar size={23} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Trend Radar</h1>
                <p className="text-sm text-zinc-400">사람들의 마음이 움직이는 방향을 읽다</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={17} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="트렌드, 감정, 음식, 문화 검색" className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm outline-none placeholder:text-zinc-500 sm:w-80" />
              </div>
              <button onClick={() => loadData(region)} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#d7c4a1] px-4 text-sm font-medium text-zinc-950 hover:bg-[#e2d1af]">
                <RefreshCcw size={16} /> 새로고침
              </button>
            </div>
          </div>
        </header>

        <section className="mb-6 grid gap-3 lg:grid-cols-2">
          <RegionButton
            active={region === "KR"}
            label="국내 트렌드"
            desc="한국 Google Trends, 국내 소비·문화 키워드, 한국 뉴스 신호 중심"
            icon={<MapPin size={16} />}
            onClick={() => setRegion("KR")}
          />
          <RegionButton
            active={region === "GLOBAL"}
            label="전세계 트렌드"
            desc="글로벌 Google Trends, 글로벌 뉴스/웹 신호, 전세계 문화·기술 흐름 중심"
            icon={<Globe2 size={16} />}
            onClick={() => setRegion("GLOBAL")}
          />
        </section>

        <section className="mb-6 rounded-[2rem] border border-white/10 bg-[#10161d]/75 p-4 shadow-2xl">
          <div className="mb-3 flex flex-col gap-3 px-2 pt-1 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-medium text-zinc-200">World Context</h2>
              <p className="text-xs text-zinc-500">1분 단위 시장 배경 · 방문 시 갱신 · 일부 지표는 거래소/데이터 제공처에 따라 지연될 수 있음</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setShowPicker((v) => !v)} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                <SlidersHorizontal size={14} /> 데이터 선택
              </button>
              <StatusPill status={marketStatus} />
              {updatedAt && <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-500">Updated {updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>}
            </div>
          </div>

          {showPicker && (
            <div className="mb-4 grid gap-2 rounded-3xl border border-white/10 bg-[#0d1117] p-4 sm:grid-cols-2 lg:grid-cols-4">
              {market.map((item) => (
                <label key={item.key} className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-zinc-300">
                  <span>{item.label}</span>
                  <input type="checkbox" checked={selected.includes(item.key)} onChange={() => setSelected((prev) => prev.includes(item.key) ? prev.filter((x) => x !== item.key) : [...prev, item.key])} className="h-4 w-4 accent-[#d7c4a1]" />
                </label>
              ))}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {visibleMarket.map((item) => (
              <div key={item.key} className="min-h-[112px] rounded-3xl border border-white/10 bg-[#151c24] p-3.5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="text-xs font-medium text-zinc-400">{item.label}</span>
                  <ChangePill up={item.up} change={item.change} />
                </div>
                <div className="text-2xl font-semibold tracking-tight text-white">{item.value}</div>
                <div className="mt-2 text-sm text-zinc-400">{item.note}</div>
                <div className="mt-2 text-[10px] uppercase tracking-wide text-zinc-600">{item.source || "Demo"}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 rounded-[2rem] border border-white/10 bg-[#0d1117] p-7 shadow-2xl">
          <div className="mb-7 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-zinc-300">
                <Activity size={15} /> {regionLabel} Attention Weather
              </div>
              <h2 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
                {regionLabel} 관심은 <span className="text-[#d7c4a1]">{topSignal?.title || "핵심 신호"}</span> 쪽으로 기울고 있어요.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">{flowCopy}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
              <div className="mb-2 flex items-center gap-2 text-white"><Sparkles size={16} /> Signal Logic</div>
              지역 탭에 따라 Google Trends geo와 키워드 풀이 바뀝니다. 국내는 KR, 전세계는 글로벌/US 기반 프록시와 GDELT 글로벌 신호를 사용합니다.
              <div className="mt-3"><StatusPill status={trendStatus} /></div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-zinc-400">{regionLabel} Top 5 Signals</div>
                <div className="mt-1 text-lg font-semibold">지금 가장 강하게 보이는 흐름</div>
              </div>
              <StatusPill status={trendStatus} />
            </div>
            <div className="grid gap-3 lg:grid-cols-5">
              {trends.slice(0, 5).map((trend) => (
                <div key={trend.rank} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d7c4a1] text-sm font-semibold text-zinc-950">{trend.rank}</span>
                    <span className="text-xs text-emerald-400">{trend.interest}</span>
                  </div>
                  <div className="text-xs text-zinc-500">{trend.category}</div>
                  <div className="mt-2 min-h-[3.6rem] text-lg font-semibold leading-tight">{trend.title}</div>
                  <div className="mt-3 text-xs text-zinc-400">{trend.mood}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-[2rem] border border-white/10 bg-[#10161d]/80 p-5">
          <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">{regionLabel} Flow Radar</h3>
              <p className="text-sm text-zinc-500">X축은 관심 증가 속도, Y축은 유동성/소비/시장 반응 프록시입니다.</p>
            </div>
            <div className="text-xs text-zinc-500">오른쪽 위로 갈수록 “관심과 반응이 같이 붙는 흐름”</div>
          </div>
          <div className="relative h-[360px] rounded-3xl border border-white/10 bg-[#0d1117] p-4">
            <div className="absolute left-4 right-4 top-1/2 border-t border-white/10" />
            <div className="absolute bottom-4 top-4 left-1/2 border-l border-white/10" />
            <div className="absolute left-4 top-3 text-xs text-zinc-500">유동성/소비 반응 ↑</div>
            <div className="absolute bottom-3 right-4 text-xs text-zinc-500">관심 증가 속도 →</div>
            {trends.slice(0, 8).map((trend) => (
              <div
                key={trend.rank}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${Math.min(92, Math.max(8, trend.attention || 50))}%`, top: `${100 - Math.min(88, Math.max(12, trend.liquidity || 50))}%` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d7c4a1]/40 bg-[#d7c4a1] text-sm font-bold text-zinc-950 shadow-lg shadow-black/30">{trend.rank}</div>
                <div className="pointer-events-none absolute left-1/2 top-12 z-10 hidden w-56 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#151c24] p-3 text-xs text-zinc-300 shadow-2xl group-hover:block">
                  <div className="mb-1 font-semibold text-white">{trend.title}</div>
                  <div>Attention: {trend.attention}</div>
                  <div>Liquidity proxy: {trend.liquidity}</div>
                  <div>Noise risk: {trend.noise}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
          <section>
            <div className="mb-4">
              <h3 className="text-2xl font-semibold tracking-tight">{regionLabel} Top Macro Trends</h3>
              <p className="text-sm text-zinc-500">지역별 검색 관심 신호와 뉴스/웹 신호를 결합한 랭킹</p>
            </div>
            <div className="space-y-3">
              {visibleTrends.map((trend) => (
                <div key={trend.rank} className="rounded-3xl border border-white/10 bg-[#10161d]/80 p-5">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d7c4a1] text-lg font-semibold text-zinc-950">{trend.rank}</div>
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h4 className="text-xl font-semibold tracking-tight text-white">{trend.title}</h4>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">{trend.category}</span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">{trend.mood}</span>
                        </div>
                        <p className="max-w-3xl text-sm leading-6 text-zinc-400">{trend.summary}</p>
                        <div className="mt-3 flex flex-wrap gap-2">{(trend.tags || []).map((tag: string) => <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-400">#{tag}</span>)}</div>
                      </div>
                    </div>
                    <div className="min-w-52 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="mb-2 flex items-center justify-between text-sm"><span className="text-zinc-400">Trend Score</span><span className="font-semibold text-white">{trend.score}</span></div>
                      <ScoreBar value={trend.score} />
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-500">
                        <div>Interest</div><div className="text-right font-medium text-emerald-400">{trend.interest}</div>
                        <div>Liquidity</div><div className="text-right font-medium text-zinc-200">{trend.liquidity}</div>
                        <div>Noise risk</div><div className="text-right font-medium text-zinc-200">{trend.noise}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-[#10161d]/80 p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2"><Flame size={20} className="text-[#d7c4a1]" /><h3 className="text-xl font-semibold">{regionLabel} Alpha Signals</h3></div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-400">Beta</span>
              </div>
              <p className="mb-4 text-xs leading-5 text-zinc-500">지역별로 아직 작지만 빠르게 커지는 신호를 우선 표시합니다.</p>
              <div className="space-y-3">
                {(alpha.length ? alpha : fallbackAlpha).map((signal, index) => (
                  <div key={signal.title} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div><div className="text-sm text-zinc-500">#{index + 1} · {signal.category}</div><h4 className="mt-1 font-semibold text-white">{signal.title}</h4></div>
                      <div className="rounded-2xl bg-[#d7c4a1] px-3 py-1 text-sm font-semibold text-zinc-950">{signal.alpha}</div>
                    </div>
                    <div className="mb-2 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-300">{signal.stage}</div>
                    <p className="text-sm leading-6 text-zinc-400">{signal.reason}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-[#10161d]/80 p-5">
              <h3 className="mb-4 text-xl font-semibold">{regionLabel} Rising Searches</h3>
              <div className="space-y-2">
                {googleTop.slice(0, 10).map((item, index) => (
                  <div key={`${item.title}-${index}`} className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2 text-sm">
                    <span className="text-zinc-300">{index + 1}. {item.title}</span>
                    <span className="text-xs text-zinc-500">{item.traffic || "Trend"}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#d7c4a1]/20 bg-[#d7c4a1] p-5 text-zinc-950">
              <div className="mb-2 text-sm text-zinc-700">Trend Radar Note</div>
              <p className="text-lg font-semibold leading-7">국내와 전세계 트렌드는 다르게 움직입니다. 같은 키워드라도 어느 지역에서 먼저 뜨는지 보는 것이 핵심입니다.</p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
