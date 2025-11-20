"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { fetchPools, fetchProtocols, fetchPoolHistory, transformPoolToStrategy } from "@/lib/defillama-api"
import { calcSecurityScoreWithMetrics } from "@/lib/calc-security-score"
import { SecurityBreakdown } from "@/components/strategies/security-breakdown"
import { mockTokens } from "@/lib/mock-data"
import { ArrowLeft, Share2, Bookmark, ChevronDown, Info } from "lucide-react"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

export default function StrategyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit")
  const [selectedToken, setSelectedToken] = useState<string>("USDC")
  const [amount, setAmount] = useState<string>("")
  const [percentage, setPercentage] = useState<number>(0)
  const [chartView, setChartView] = useState<"APY" | "TVL" | "Price">("APY")
  const [strategy, setStrategy] = useState<any>(null)
  const [securityMetrics, setSecurityMetrics] = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isConnected) {
      router.push("/")
    }
  }, [mounted, isConnected, router])

  useEffect(() => {
    async function loadStrategy() {
      if (!params.id || !isConnected) return

      setLoading(true)
      try {
        console.log("[v0] Fetching strategy details for:", params.id)
        const [pools, protocols] = await Promise.all([fetchPools(), fetchProtocols()])

        const pool = pools.find((p) => p.pool === params.id)
        if (!pool) {
          console.log("[v0] Strategy not found")
          setLoading(false)
          return
        }

        const protocol = protocols.find((p) => p.name.toLowerCase() === pool.project.toLowerCase())
        const strategyData = transformPoolToStrategy(pool, protocol)

        // Fetch historical data
        const history = await fetchPoolHistory(params.id as string)
        const formattedHistory = history.slice(-30).map((h) => ({
          date: new Date(h.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          apy: h.apy || 0,
          tvl: h.tvlUsd || 0,
        }))

        // Calculate security metrics
        const metrics = await calcSecurityScoreWithMetrics({
          audits: strategyData.audits,
          rugged: strategyData.rugged,
          tvl: strategyData.tvlNumeric,
          listedAt: strategyData.listedAt,
          volume24h: strategyData.volume24h,
          apyHistory: history.map((h) => ({ apy: h.apy, time: new Date(h.timestamp).getTime() / 1000 })),
          underlyingSymbols: strategyData.underlyingSymbols,
        })

        console.log("[v0] Strategy loaded:", strategyData)
        setStrategy({ ...strategyData, safetyScore: metrics.totalScore })
        setSecurityMetrics(metrics)
        setChartData(formattedHistory)
      } catch (error) {
        console.error("[v0] Error loading strategy:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStrategy()
  }, [params.id, isConnected])

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container mx-auto p-8 text-center">
          <div className="text-lg font-medium text-muted-foreground">Loading strategy details...</div>
        </div>
      </div>
    )
  }

  if (!strategy) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container mx-auto p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Strategy Not Found</h2>
          <Link href="/strategies">
            <Button>Back to Strategies</Button>
          </Link>
        </div>
      </div>
    )
  }

  const selectedTokenData = mockTokens.find((t) => t.symbol === selectedToken)
  const maxAmount = selectedTokenData?.balance || 0

  const handlePercentage = (pct: number) => {
    setPercentage(pct)
    setAmount(((maxAmount * pct) / 100).toFixed(2))
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {/* Back Button */}
        <Link href="/strategies">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Strategies
          </Button>
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center -space-x-2">
              {strategy.tokenIcons.map((icon: string, idx: number) => (
                <div
                  key={idx}
                  className="w-12 h-12 rounded-full bg-muted border-2 border-background flex items-center justify-center text-2xl"
                >
                  {icon}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{strategy.name}</h1>
                {strategy.isNew && <Badge variant="secondary">New</Badge>}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                <span className="text-sm uppercase font-medium">CHAIN</span>
                <Badge variant="outline">{strategy.chain}</Badge>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm uppercase font-medium">PLATFORM</span>
                <span className="text-sm">{strategy.protocol}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button>VAULT</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">TVL</div>
              <div className="text-2xl font-bold">{strategy.tvl}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                APY <Info className="h-3 w-3" />
              </div>
              <div className="text-2xl font-bold text-green-500">{strategy.currentApy.toFixed(2)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                DAILY <Info className="h-3 w-3" />
              </div>
              <div className="text-2xl font-bold">{strategy.dailyYield.toFixed(4)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">YOUR DEPOSIT</div>
              <div className="text-2xl font-bold">{strategy.deposited}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">LAST HARVEST</div>
              <div className="text-lg font-medium">20 minutes ago</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Left Column - Charts & Info */}
          <div className="space-y-6">
            {/* Historical Rate Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Historical rate</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={chartView === "APY" ? "default" : "outline"}
                      onClick={() => setChartView("APY")}
                    >
                      APY
                    </Button>
                    <Button
                      size="sm"
                      variant={chartView === "TVL" ? "default" : "outline"}
                      onClick={() => setChartView("TVL")}
                    >
                      TVL
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey={chartView === "APY" ? "apy" : "tvl"}
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No historical data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Score Breakdown */}
            {securityMetrics && <SecurityBreakdown metrics={securityMetrics} />}
          </div>

          {/* Right Column - Deposit/Withdraw */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "deposit" | "withdraw")}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="deposit">Deposit</TabsTrigger>
                    <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                  </TabsList>

                  <TabsContent value="deposit" className="space-y-4 mt-0">
                    {/* Token Selection */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-muted-foreground">
                        <span className="text-lg">{selectedTokenData?.icon}</span>
                        Select token
                      </Label>
                      <Select value={selectedToken} onValueChange={setSelectedToken}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mockTokens.map((token) => (
                            <SelectItem key={token.symbol} value={token.symbol}>
                              <div className="flex items-center gap-2">
                                <span>{token.icon}</span>
                                <span>{token.symbol}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="text-2xl h-14 pr-24"
                        />
                        <Button size="sm" variant="ghost" className="absolute right-2 top-2">
                          <span className="mr-1">{selectedTokenData?.icon}</span>
                          Select <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">$0</span>
                        <div className="flex gap-1">
                          <span className="text-muted-foreground">0%</span>
                          {[25, 50, 75, 100].map((pct) => (
                            <Button
                              key={pct}
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2"
                              onClick={() => handlePercentage(pct)}
                            >
                              {pct}%
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* You deposit section */}
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="text-sm text-muted-foreground mb-2">You deposit</div>
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-bold">{amount || "0"}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{strategy.underlyingSymbols[0]}</span>
                          <span className="text-lg">{strategy.tokenIcons[0]}</span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">~$0</div>
                    </div>

                    {/* Deposit Button */}
                    <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                      Deposit
                    </Button>

                    <Separator />

                    {/* Fees */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          DEPOSIT FEE <Info className="h-3 w-3" />
                        </span>
                        <span>0%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          WITHDRAWAL FEE <Info className="h-3 w-3" />
                        </span>
                        <span>0%</span>
                      </div>
                      <p className="text-xs text-muted-foreground pt-2">
                        The displayed APY accounts for performance fee <Info className="h-3 w-3 inline" /> that is
                        deducted from the generated yield only
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="withdraw" className="space-y-4 mt-0">
                    {strategy.deposited > 0 ? (
                      <>
                        <div className="space-y-2">
                          <Label>Amount to withdraw</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="text-2xl h-14"
                          />
                        </div>
                        <Button className="w-full" size="lg" variant="destructive">
                          Withdraw
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">No deposits to withdraw</div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
