"use client";

import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Radar, Search, SlidersHorizontal } from "lucide-react";

const fallbackMarket = [
  { key: "usdkrw", label: "USD/KRW", value: "—", change: "—", up: true, note: "수입물가 압박", source: "Demo" },
  { key: "kospi", label: "KOSPI", value: "—", change: "—", up: true, note: "한국 위험자산 심리", source: "Demo" },
  { key: "sp500", label: "S&P 500", value: "—", change: "—", up: true, note: "미국 대형주 흐름", source: "Demo" },
  { key: "nasdaq", label: "NASDAQ", value: "—", change: "—", up: true, note: "기술주 온도", source: "Demo" },
  { key: "dxy", label: "DXY", value: "—", change: "—", up: true, note: "달러 강세", source: "Demo" },
  { key: "gold", label: "Gold", value: "—", change: "—", up: true, note: "안전자산 선호", source: "Demo" },
  { key: "oil", label: "Oil", value: "—", change: "—", up: false, note: "생활비 영향", source: "Demo" },
  { key: "btc", label: "BTC", value: "—", change: "—", up: true, note: "디지털 자산 심리", source: "Demo" },
  { key: "altcap", label: "Altcoin Total Market Cap", value: "—", change: "—", up: false, note: "알트 시장 흐름", source: "Demo" },
];

const fallbackTrends = [
  { rank: 1, title: "죄책감 없는 디저트", category: "Food", score: 94, interest: "+42%", momentum: "Very High", mood: "작은 사치", summary: "맛있는 걸 먹고 싶지만 건강도 놓치고 싶지 않은 심리.", tags: ["말차", "그릭요거트", "저당"] },
  { rank: 2, title: "촌스럽지만 귀여운 아날로그 감성", category: "Culture", score: 91, interest: "+38%", momentum: "High", mood: "향수", summary: "디카, 콜라주, 종이 질감, 캠 감성이 연결됨.", tags: ["Y2K", "디카", "콜라주"] },
  { rank: 3, title: "AI와 함께 일하는 개인 창작자", category: "Tech / Lifestyle", score: 88, interest: "+35%", momentum: "High", mood: "효율과 불안", summary: "개인이 툴을 조합해 생산성을 높이는 흐름.", tags: ["AI workflow", "1인 창작"] },
  { rank: 4, title: "못생긴 귀여움", category: "Mood / Character", score: 84, interest: "+31%", momentum: "High", mood: "귀여움", summary: "살짝 이상하고 웃긴 캐릭터에 반응하는 흐름.", tags: ["ugly cute", "meme"] },
  { rank: 5, title: "저속노화 라이프스타일", category: "Lifestyle", score: 82, interest: "+29%", momentum: "Medium High", mood: "통제감", summary: "식단, 운동, 수면, 루틴 콘텐츠로 확장.", tags: ["건강", "수면"] },
];

export default function Page() {
  const [market, setMarket] = useState(fallbackMarket);
  const [trends, setTrends] = useState(fallbackTrends);
  const [alpha, setAlpha] = useState([]);
  const [marketStatus, setMarketStatus] = useState("Connecting live data");
  const [trendStatus, setTrendStatus] = useState("Connecting trend data");
  const [showPicker, setShowPicker] = useState(false);
  const [selected, setSelected] = useState(fallbackMarket.map((x) => x.key));
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/market-context", { cache: "no-store" });
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
        const res = await fetch("/api/trend-signals", { cache: "no-store" });
        const data = await res.json();
        if (data?.trends) {
          setTrends(data.trends);
          setAlpha(data.alphaSignals || []);
          setTrendStatus("Live news signals");
        } else {
          throw new Error("bad trend data");
        }
      } catch {
        setTrendStatus("Demo trend data");
      }
    }

    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, []);

  const visibleMarket = market.filter((item) => selected.includes(item.key));
  const visibleTrends = trends.filter((t) => {
    const q = query.toLowerCase().trim();
    return !q || t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
  });

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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={17} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="트렌드, 감정, 음식, 문화 검색" className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm outline-none placeholder:text-zinc-500 sm:w-80" />
            </div>
          </div>
        </header>

        <section className="mb-6 rounded-[2rem] border border-white/10 bg-[#10161d]/75 p-4 shadow-2xl">
          <div className="mb-3 flex flex-col gap-3 px-2 pt-1 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-medium text-zinc-200">World Context</h2>
              <p className="text-xs text-zinc-500">환율, 증시, 원자재, 디지털 자산으로 보는 오늘의 배경</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setShowPicker((v) => !v)} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                <SlidersHorizontal size={14} /> 데이터 선택
              </button>
              <div className={`rounded-full border px-3 py-1 text-xs ${marketStatus.includes("Live") || marketStatus.includes("Partial") ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-amber-300/20 bg-amber-300/10 text-amber-200"}`}>{marketStatus}</div>
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
                  <span className={`flex items-center gap-1 text-sm font-medium ${item.up ? "text-emerald-400" : "text-red-400"}`}>
                    {item.up ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {item.change}
                  </span>
                </div>
                <div className="text-2xl font-semibold tracking-tight text-white">{item.value}</div>
                <div className="mt-2 text-sm text-zinc-400">{item.note}</div>
                <div className="mt-2 text-[10px] uppercase tracking-wide text-zinc-600">{item.source || "Demo"}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 rounded-[2rem] border border-white/10 bg-[#0d1117] p-7 shadow-2xl">
          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm text-zinc-300">Today’s Cultural Weather</div>
              <h2 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
                사람들은 지금, 완벽함보다 <span className="text-[#d7c4a1]">기억나는 감각</span>에 반응하고 있어요.
              </h2>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300 lg:w-72">
              향수, 작은 사치, 귀여움이 동시에 상승. 음식·비주얼·음악·브랜드에서 정서적 보상이 강한 흐름으로 보입니다.
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-zinc-400">Today’s Top 5 Signals</div>
                <div className="mt-1 text-lg font-semibold">오늘 가장 강하게 보이는 흐름</div>
              </div>
              <div className={`rounded-full px-3 py-1 text-xs ${trendStatus.includes("Live") ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-300/10 text-amber-200"}`}>{trendStatus}</div>
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

        <div className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
          <section>
            <div className="mb-4">
              <h3 className="text-2xl font-semibold tracking-tight">Top Macro Trends</h3>
              <p className="text-sm text-zinc-500">개별 키워드보다 큰 흐름 중심으로 정리</p>
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
                      </div>
                    </div>
                    <div className="min-w-52 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="mb-2 flex items-center justify-between text-sm"><span className="text-zinc-400">Trend Score</span><span className="font-semibold text-white">{trend.score}</span></div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#d7c4a1]" style={{ width: `${trend.score}%` }} /></div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-500"><div>Interest</div><div className="text-right font-medium text-emerald-400">{trend.interest}</div><div>Momentum</div><div className="text-right font-medium text-zinc-200">{trend.momentum}</div></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-[#10161d]/80 p-5">
              <h3 className="mb-4 text-xl font-semibold">Alpha Signals</h3>
              <div className="space-y-3">
                {(alpha.length ? alpha : [
                  { title: "개인 홈페이지 부활", category: "Culture / Web", alpha: 87, stage: "Early Signal", reason: "SNS 피로감 이후 자기 세계관을 직접 만들고 싶어하는 흐름." },
                  { title: "종이 콜라주 감성", category: "Visual", alpha: 84, stage: "Emerging", reason: "손으로 만든 듯한 물성, 테이프, 찢어진 종이 질감." }
                ]).map((signal, index) => (
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

            <section className="rounded-[2rem] border border-[#d7c4a1]/20 bg-[#d7c4a1] p-5 text-zinc-950">
              <div className="mb-2 text-sm text-zinc-700">Trend Radar Note</div>
              <p className="text-lg font-semibold leading-7">트렌드는 키워드가 아니라 감정의 이동입니다. 음식, 음악, 브랜드, 콘텐츠는 결국 사람들이 지금 무엇을 원하고 두려워하는지 보여줍니다.</p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
