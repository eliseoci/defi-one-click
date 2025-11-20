"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet } from "lucide-react"
import { ConnectWalletButton } from "@/components/wallets/connect-wallet-button"
import { StrategiesHeader } from "@/components/strategies/strategies-header"
import { StrategiesFilters } from "@/components/strategies/strategies-filters"
import { StrategiesTable } from "@/components/strategies/strategies-table"
import { fetchPools, fetchProtocols, transformPoolToStrategy } from "@/lib/defillama-api"
import { calcSecurityScore } from "@/lib/calc-security-score"

export default function StrategiesPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedChains, setSelectedChains] = useState<string[]>([])
  const [stablecoinsOnly, setStablecoinsOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [strategies, setStrategies] = useState<any[]>([])
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
    async function loadStrategies() {
      if (!isConnected) return

      setLoading(true)
      try {
        console.log("[v0] Fetching pools from DefiLlama...")
        const [pools, protocols] = await Promise.all([fetchPools(), fetchProtocols()])

        console.log("[v0] Received pools:", pools.length)

        // Transform and calculate security scores
        const transformedStrategies = await Promise.all(
          pools.slice(0, 50).map(async (pool) => {
            const protocol = protocols.find((p) => p.name.toLowerCase() === pool.project.toLowerCase())
            const strategy = transformPoolToStrategy(pool, protocol)

            // Calculate security score
            const securityScore = await calcSecurityScore({
              audits: strategy.audits,
              rugged: strategy.rugged,
              tvl: strategy.tvlNumeric,
              listedAt: strategy.listedAt,
              volume24h: strategy.volume24h,
              underlyingSymbols: strategy.underlyingSymbols,
            })

            return { ...strategy, safetyScore: securityScore }
          }),
        )

        console.log("[v0] Transformed strategies:", transformedStrategies.length)
        setStrategies(transformedStrategies)
      } catch (error) {
        console.error("[v0] Error loading strategies:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStrategies()
  }, [isConnected])

  if (!mounted) {
    return null
  }

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
            <p className="text-muted-foreground">
              Please connect your wallet to view available DeFi strategies and vaults.
            </p>
            <ConnectWalletButton size="lg" className="w-full justify-center" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredStrategies = strategies.filter((strategy) => {
    const matchesChain = selectedChains.length === 0 || selectedChains.includes(strategy.chain)
    const matchesStablecoins = !stablecoinsOnly || strategy.isStablecoin
    const matchesSearch =
      searchQuery === "" ||
      strategy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      strategy.protocol.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesChain && matchesStablecoins && matchesSearch
  })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <StrategiesHeader walletAddress={address} />

        <StrategiesFilters
          selectedChains={selectedChains}
          onChainsChange={setSelectedChains}
          stablecoinsOnly={stablecoinsOnly}
          onStablecoinsOnlyChange={setStablecoinsOnly}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg font-medium text-muted-foreground">Loading strategies from DefiLlama...</div>
          </div>
        ) : (
          <StrategiesTable strategies={filteredStrategies} />
        )}
      </main>
    </div>
  )
}
