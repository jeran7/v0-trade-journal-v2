import type { Timeframe } from "./price-data-service"

export interface PriceDataPoint {
  symbol: string
  timeframe: Timeframe
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Get timeframe in seconds
export function getTimeframeInSeconds(timeframe: Timeframe): number {
  switch (timeframe) {
    case "1m":
      return 60
    case "5m":
      return 5 * 60
    case "15m":
      return 15 * 60
    case "1h":
      return 60 * 60
    case "4h":
      return 4 * 60 * 60
    case "1D":
      return 24 * 60 * 60
    case "1W":
      return 7 * 24 * 60 * 60
    default:
      return 60
  }
}

// Generate random price data with realistic price movements
export function generatePriceData(
  symbol: string,
  timeframe: Timeframe,
  count: number,
  startTime: number = Math.floor(Date.now() / 1000) - count * getTimeframeInSeconds(timeframe),
  startPrice: number = getBasePrice(symbol),
  volatility: number = getVolatility(symbol),
): PriceDataPoint[] {
  const data: PriceDataPoint[] = []
  let time = startTime
  let prevClose = startPrice
  const timeframeSeconds = getTimeframeInSeconds(timeframe)

  // Add some randomness to the trend direction
  const trendBias = Math.random() * 0.2 - 0.1 // -0.1 to 0.1

  for (let i = 0; i < count; i++) {
    // Generate more realistic price movements
    const dailyVolatility = volatility * (1 + Math.sin(i / 20) * 0.3) // Add cyclical volatility
    const changePercent = (Math.random() - 0.5 + trendBias) * dailyVolatility

    // Calculate OHLC with more realistic relationships
    const range = prevClose * (dailyVolatility / 10)
    const open = prevClose * (1 + (Math.random() - 0.5) * 0.001) // Slight gap from previous close
    const close = prevClose * (1 + changePercent / 100)

    // High and low with more realistic ranges
    const highFromOpen = open * (1 + (Math.random() * range) / open)
    const highFromClose = close * (1 + (Math.random() * range) / close)
    const high = Math.max(open, close, highFromOpen, highFromClose)

    const lowFromOpen = open * (1 - (Math.random() * range) / open)
    const lowFromClose = close * (1 - (Math.random() * range) / close)
    const low = Math.min(open, close, lowFromOpen, lowFromClose)

    // Generate volume with some correlation to price movement
    const priceChange = Math.abs(close - open)
    const volumeBase = getBaseVolume(symbol, timeframe)
    const volumeMultiplier = 1 + (priceChange / open) * 10
    const volume = Math.floor(volumeBase * volumeMultiplier * (0.5 + Math.random()))

    data.push({
      symbol,
      timeframe,
      time,
      open,
      high,
      low,
      close,
      volume,
    })

    prevClose = close
    time += timeframeSeconds
  }

  return data
}

// Get a realistic base price for a symbol
function getBasePrice(symbol: string): number {
  const basePrices: Record<string, number> = {
    AAPL: 175 + Math.random() * 10,
    MSFT: 330 + Math.random() * 20,
    GOOGL: 140 + Math.random() * 10,
    AMZN: 130 + Math.random() * 10,
    META: 300 + Math.random() * 15,
    TSLA: 240 + Math.random() * 20,
    NVDA: 800 + Math.random() * 50,
    SPY: 450 + Math.random() * 10,
    QQQ: 380 + Math.random() * 10,
    BTC: 60000 + Math.random() * 5000,
    ETH: 3000 + Math.random() * 300,
  }

  return basePrices[symbol] || 100 + Math.random() * 50
}

// Get realistic volatility for a symbol
function getVolatility(symbol: string): number {
  const volatilities: Record<string, number> = {
    AAPL: 1.5,
    MSFT: 1.4,
    GOOGL: 1.6,
    AMZN: 1.8,
    META: 2.0,
    TSLA: 3.5,
    NVDA: 3.0,
    SPY: 1.0,
    QQQ: 1.2,
    BTC: 4.0,
    ETH: 4.5,
  }

  return volatilities[symbol] || 2.0
}

// Get base volume for a symbol and timeframe
function getBaseVolume(symbol: string, timeframe: Timeframe): number {
  // Base daily volumes (adjust based on timeframe)
  const baseDailyVolumes: Record<string, number> = {
    AAPL: 80000000,
    MSFT: 25000000,
    GOOGL: 15000000,
    AMZN: 30000000,
    META: 20000000,
    TSLA: 100000000,
    NVDA: 40000000,
    SPY: 70000000,
    QQQ: 50000000,
    BTC: 30000,
    ETH: 15000,
  }

  const baseVolume = baseDailyVolumes[symbol] || 10000000

  // Scale volume based on timeframe
  const timeframeMultipliers: Record<Timeframe, number> = {
    "1m": 1 / 1440,
    "5m": 1 / 288,
    "15m": 1 / 96,
    "1h": 1 / 24,
    "4h": 1 / 6,
    "1D": 1,
    "1W": 5,
  }

  return baseVolume * (timeframeMultipliers[timeframe] || 1)
}
