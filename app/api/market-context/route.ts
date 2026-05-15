import { NextResponse } from "next/server";

export const revalidate = 60;

type MarketSignal = {
  key: string;
  label: string;
  value: string;
  change: string;
  up: boolean;
  note: string;
  source: string;
};

const formatNumber = (value: number | null | undefined, options: Intl.NumberFormatOptions = {}) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("en-US", options).format(Number(value));
};

const formatCompactUsd = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return `$${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(Number(value))}`;
};

const formatPercent = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

async function fetchYahooQuote(
  symbol: string,
  base: Omit<MarketSignal, "value" | "change" | "up" | "source">
): Promise<MarketSignal> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d`;
    const response = await fetch(url, { next: { revalidate: 60 }, headers: { "User-Agent": "Mozilla/5.0" } });
    if (!response.ok) throw new Error(`Yahoo fetch failed: ${symbol}`);
    const data = await response.json();
    const result = data?.chart?.result?.[0];
    const meta = result?.meta;
    const closes = result?.indicators?.quote?.[0]?.close?.filter((v: unknown) => typeof v === "number");
    const current = meta?.regularMarketPrice ?? closes?.at(-1);
    const previous = closes?.length > 1 ? closes.at(-2) : meta?.chartPreviousClose;
    const pct = current && previous ? ((current - previous) / previous) * 100 : null;
    return {
      ...base,
      value: formatNumber(current, { maximumFractionDigits: symbol === "KRW=X" ? 0 : 2 }),
      change: formatPercent(pct),
      up: Number(pct) >= 0,
      source: "Yahoo",
    };
  } catch {
    return { ...base, value: "—", change: "—", up: true, source: "Demo" };
  }
}

async function fetchCryptoContext(): Promise<MarketSignal[]> {
  try {
    const [btcResponse, globalResponse] = await Promise.all([
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true", { next: { revalidate: 60 } }),
      fetch("https://api.coingecko.com/api/v3/global", { next: { revalidate: 60 } }),
    ]);
    if (!btcResponse.ok || !globalResponse.ok) throw new Error("CoinGecko fetch failed");
    const btcData = await btcResponse.json();
    const globalData = await globalResponse.json();
    const btcPrice = btcData?.bitcoin?.usd;
    const btcChange = btcData?.bitcoin?.usd_24h_change;
    const totalCap = globalData?.data?.total_market_cap?.usd;
    const btcDominance = globalData?.data?.market_cap_percentage?.btc;
    const altCap = totalCap && btcDominance ? totalCap * (1 - btcDominance / 100) : null;
    const marketChange = globalData?.data?.market_cap_change_percentage_24h_usd;

    return [
      { key: "btc", label: "BTC", value: formatNumber(btcPrice, { maximumFractionDigits: 0 }), change: formatPercent(btcChange), up: Number(btcChange) >= 0, note: "디지털 자산 심리", source: "CoinGecko" },
      { key: "altcap", label: "Altcoin Total Market Cap", value: formatCompactUsd(altCap), change: formatPercent(marketChange), up: Number(marketChange) >= 0, note: "알트 시장 흐름", source: "CoinGecko" },
    ];
  } catch {
    return [
      { key: "btc", label: "BTC", value: "—", change: "—", up: true, note: "디지털 자산 심리", source: "Demo" },
      { key: "altcap", label: "Altcoin Total Market Cap", value: "—", change: "—", up: false, note: "알트 시장 흐름", source: "Demo" },
    ];
  }
}

export async function GET() {
  const [usdkrw, kospi, sp500, nasdaq, dxy, gold, oil, crypto] = await Promise.all([
    fetchYahooQuote("KRW=X", { key: "usdkrw", label: "USD/KRW", note: "수입물가 압박" }),
    fetchYahooQuote("^KS11", { key: "kospi", label: "KOSPI", note: "한국 위험자산 심리" }),
    fetchYahooQuote("^GSPC", { key: "sp500", label: "S&P 500", note: "미국 대형주 흐름" }),
    fetchYahooQuote("^IXIC", { key: "nasdaq", label: "NASDAQ", note: "기술주 온도" }),
    fetchYahooQuote("DX-Y.NYB", { key: "dxy", label: "DXY", note: "달러 강세" }),
    fetchYahooQuote("GC=F", { key: "gold", label: "Gold", note: "안전자산 선호" }),
    fetchYahooQuote("CL=F", { key: "oil", label: "Oil", note: "생활비 영향" }),
    fetchCryptoContext(),
  ]);

  return NextResponse.json([usdkrw, kospi, sp500, nasdaq, dxy, gold, oil, ...crypto], {
    headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=120" },
  });
}
