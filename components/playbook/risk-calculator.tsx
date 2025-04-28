"use client"

import { useState, useEffect } from "react"
import { Calculator, DollarSign, RefreshCw, Info } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export function RiskCalculator() {
  const [accountSize, setAccountSize] = useState(10000)
  const [riskPercent, setRiskPercent] = useState(2)
  const [entryPrice, setEntryPrice] = useState(100)
  const [stopPrice, setStopPrice] = useState(98)
  const [targetPrice, setTargetPrice] = useState(105)
  const [shares, setShares] = useState(0)
  const [riskAmount, setRiskAmount] = useState(0)
  const [rewardAmount, setRewardAmount] = useState(0)
  const [riskRewardRatio, setRiskRewardRatio] = useState(0)
  const [positionSizingMethod, setPositionSizingMethod] = useState("percent")
  const [fixedRiskAmount, setFixedRiskAmount] = useState(200)
  const [useFixedRR, setUseFixedRR] = useState(false)
  const [fixedRR, setFixedRR] = useState(2)

  // Calculate position size and risk metrics
  useEffect(() => {
    // Calculate risk amount
    const maxRiskAmount = positionSizingMethod === "percent" ? (accountSize * riskPercent) / 100 : fixedRiskAmount

    setRiskAmount(maxRiskAmount)

    // Calculate position size
    const riskPerShare = Math.abs(entryPrice - stopPrice)
    if (riskPerShare > 0) {
      const calculatedShares = Math.floor(maxRiskAmount / riskPerShare)
      setShares(calculatedShares)

      // Calculate reward amount
      const rewardPerShare = Math.abs(targetPrice - entryPrice)
      const calculatedReward = calculatedShares * rewardPerShare
      setRewardAmount(calculatedReward)

      // Calculate risk-reward ratio
      if (maxRiskAmount > 0) {
        setRiskRewardRatio(calculatedReward / maxRiskAmount)
      }
    }
  }, [accountSize, riskPercent, entryPrice, stopPrice, targetPrice, positionSizingMethod, fixedRiskAmount])

  // Update target price based on fixed R:R if enabled
  useEffect(() => {
    if (useFixedRR) {
      const riskPerShare = Math.abs(entryPrice - stopPrice)
      const newTargetPrice =
        entryPrice > stopPrice ? entryPrice + riskPerShare * fixedRR : entryPrice - riskPerShare * fixedRR
      setTargetPrice(newTargetPrice)
    }
  }, [useFixedRR, entryPrice, stopPrice, fixedRR])

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">Position Size Calculator</h3>
      </div>

      <Tabs defaultValue="long">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="long">Long Position</TabsTrigger>
          <TabsTrigger value="short">Short Position</TabsTrigger>
        </TabsList>

        <TabsContent value="long" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account-size">Account Size</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="account-size"
                    type="number"
                    className="pl-8"
                    value={accountSize}
                    onChange={(e) => setAccountSize(Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Position Sizing Method</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={positionSizingMethod === "percent" ? "default" : "outline"}
                    onClick={() => setPositionSizingMethod("percent")}
                    className={positionSizingMethod === "percent" ? "bg-blue-500/30 hover:bg-blue-500/40" : ""}
                  >
                    Percentage
                  </Button>
                  <Button
                    variant={positionSizingMethod === "fixed" ? "default" : "outline"}
                    onClick={() => setPositionSizingMethod("fixed")}
                    className={positionSizingMethod === "fixed" ? "bg-blue-500/30 hover:bg-blue-500/40" : ""}
                  >
                    Fixed Amount
                  </Button>
                </div>
              </div>

              {positionSizingMethod === "percent" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="risk-percent">Risk Per Trade</Label>
                    <span className="text-sm text-muted-foreground">{riskPercent}%</span>
                  </div>
                  <Slider
                    id="risk-percent"
                    min={0.5}
                    max={5}
                    step={0.1}
                    value={[riskPercent]}
                    onValueChange={(value) => setRiskPercent(value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.5%</span>
                    <span>2.5%</span>
                    <span>5%</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="fixed-risk">Fixed Risk Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fixed-risk"
                      type="number"
                      className="pl-8"
                      value={fixedRiskAmount}
                      onChange={(e) => setFixedRiskAmount(Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entry-price">Entry Price</Label>
                  <Input
                    id="entry-price"
                    type="number"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stop-price">Stop Loss Price</Label>
                  <Input
                    id="stop-price"
                    type="number"
                    value={stopPrice}
                    onChange={(e) => setStopPrice(Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="use-fixed-rr" className="cursor-pointer">
                    Use Fixed R:R
                  </Label>
                  <Switch id="use-fixed-rr" checked={useFixedRR} onCheckedChange={setUseFixedRR} />
                </div>

                {useFixedRR ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="fixed-rr">Risk-Reward Ratio</Label>
                      <span className="text-sm text-muted-foreground">1:{fixedRR}</span>
                    </div>
                    <Slider
                      id="fixed-rr"
                      min={1}
                      max={5}
                      step={0.5}
                      value={[fixedRR]}
                      onValueChange={(value) => setFixedRR(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1:1</span>
                      <span>1:3</span>
                      <span>1:5</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="target-price">Target Price</Label>
                    <Input
                      id="target-price"
                      type="number"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="font-medium mb-4">Position Details</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Shares/Contracts</div>
                      <div className="text-2xl font-bold">{shares.toLocaleString()}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Position Size</div>
                      <div className="text-2xl font-bold">${(shares * entryPrice).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Risk Amount</div>
                      <div className="text-2xl font-bold text-red-400">${riskAmount.toLocaleString()}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Reward Amount</div>
                      <div className="text-2xl font-bold text-green-400">${rewardAmount.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Risk-Reward Ratio</div>
                    <div className="text-2xl font-bold">1:{riskRewardRatio.toFixed(1)}</div>
                  </div>

                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-green-500"
                      style={{ width: `${(riskRewardRatio / 3) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1:1</span>
                    <span>1:2</span>
                    <span>1:3+</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 border border-white/10 rounded-lg bg-white/5">
                <Info className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <p className="text-sm text-white/70">
                  Position sizing is a critical component of risk management. Never risk more than you're comfortable
                  losing on a single trade.
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEntryPrice(100)
                    setStopPrice(98)
                    setTargetPrice(105)
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset Values
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="short" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account-size-short">Account Size</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="account-size-short"
                    type="number"
                    className="pl-8"
                    value={accountSize}
                    onChange={(e) => setAccountSize(Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Position Sizing Method</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={positionSizingMethod === "percent" ? "default" : "outline"}
                    onClick={() => setPositionSizingMethod("percent")}
                    className={positionSizingMethod === "percent" ? "bg-blue-500/30 hover:bg-blue-500/40" : ""}
                  >
                    Percentage
                  </Button>
                  <Button
                    variant={positionSizingMethod === "fixed" ? "default" : "outline"}
                    onClick={() => setPositionSizingMethod("fixed")}
                    className={positionSizingMethod === "fixed" ? "bg-blue-500/30 hover:bg-blue-500/40" : ""}
                  >
                    Fixed Amount
                  </Button>
                </div>
              </div>

              {positionSizingMethod === "percent" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="risk-percent-short">Risk Per Trade</Label>
                    <span className="text-sm text-muted-foreground">{riskPercent}%</span>
                  </div>
                  <Slider
                    id="risk-percent-short"
                    min={0.5}
                    max={5}
                    step={0.1}
                    value={[riskPercent]}
                    onValueChange={(value) => setRiskPercent(value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.5%</span>
                    <span>2.5%</span>
                    <span>5%</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="fixed-risk-short">Fixed Risk Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fixed-risk-short"
                      type="number"
                      className="pl-8"
                      value={fixedRiskAmount}
                      onChange={(e) => setFixedRiskAmount(Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entry-price-short">Entry Price</Label>
                  <Input
                    id="entry-price-short"
                    type="number"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stop-price-short">Stop Loss Price</Label>
                  <Input
                    id="stop-price-short"
                    type="number"
                    value={stopPrice}
                    onChange={(e) => setStopPrice(Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="use-fixed-rr-short" className="cursor-pointer">
                    Use Fixed R:R
                  </Label>
                  <Switch id="use-fixed-rr-short" checked={useFixedRR} onCheckedChange={setUseFixedRR} />
                </div>

                {useFixedRR ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="fixed-rr-short">Risk-Reward Ratio</Label>
                      <span className="text-sm text-muted-foreground">1:{fixedRR}</span>
                    </div>
                    <Slider
                      id="fixed-rr-short"
                      min={1}
                      max={5}
                      step={0.5}
                      value={[fixedRR]}
                      onValueChange={(value) => setFixedRR(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1:1</span>
                      <span>1:3</span>
                      <span>1:5</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="target-price-short">Target Price</Label>
                    <Input
                      id="target-price-short"
                      type="number"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="font-medium mb-4">Position Details</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Shares/Contracts</div>
                      <div className="text-2xl font-bold">{shares.toLocaleString()}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Position Size</div>
                      <div className="text-2xl font-bold">${(shares * entryPrice).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Risk Amount</div>
                      <div className="text-2xl font-bold text-red-400">${riskAmount.toLocaleString()}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Reward Amount</div>
                      <div className="text-2xl font-bold text-green-400">${rewardAmount.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Risk-Reward Ratio</div>
                    <div className="text-2xl font-bold">1:{riskRewardRatio.toFixed(1)}</div>
                  </div>

                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-green-500"
                      style={{ width: `${(riskRewardRatio / 3) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1:1</span>
                    <span>1:2</span>
                    <span>1:3+</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 border border-white/10 rounded-lg bg-white/5">
                <Info className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <p className="text-sm text-white/70">
                  For short positions, your stop loss is placed above your entry price. Always account for potential gap
                  risk in volatile markets.
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEntryPrice(100)
                    setStopPrice(102)
                    setTargetPrice(95)
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset Values
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </GlassCard>
  )
}
