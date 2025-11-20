"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Plus } from "lucide-react"
import type { Strategy } from "@/lib/mock-data"
import { QuickDepositDialog } from "./quick-deposit-dialog"
import { SafetyScoreDisplay } from "./safety-score-display"
import { useRouter } from "next/navigation"

interface StrategiesTableProps {
  strategies: Strategy[]
}

export function StrategiesTable({ strategies }: StrategiesTableProps) {
  const router = useRouter()
  const [depositDialogOpen, setDepositDialogOpen] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)

  const getSafetyColor = (score: number) => {
    if (score >= 4) return "text-green-500"
    if (score >= 3) return "text-yellow-500"
    return "text-orange-500"
  }

  const handleRowClick = (strategyId: string) => {
    router.push(`/strategies/${strategyId}`)
  }

  const handleQuickDeposit = (e: React.MouseEvent, strategy: Strategy) => {
    e.stopPropagation()
    setSelectedStrategy(strategy)
    setDepositDialogOpen(true)
  }

  return (
    <>
      {/* Mobile View */}
      <div className="block md:hidden space-y-3">
        {strategies.map((strategy) => (
          <Card
            key={strategy.id}
            onClick={() => handleRowClick(strategy.id)}
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <div className="space-y-3">
              {/* Strategy Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex items-center -space-x-2">
                    {strategy.tokenIcons.map((icon, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-lg"
                      >
                        {icon}
                      </div>
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{strategy.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {strategy.protocol} • {strategy.chain}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => handleQuickDeposit(e, strategy)}
                  className="gap-1 shrink-0"
                >
                  <Plus className="h-3 w-3" />
                  Deposit
                </Button>
              </div>

              {/* Strategy Stats */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">APY</div>
                  <div className="text-sm font-bold text-foreground">{strategy.currentApy.toFixed(2)}%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">TVL</div>
                  <div className="text-sm font-medium">${(strategy.tvlNumeric / 1000000).toFixed(2)}M</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Safety</div>
                  <SafetyScoreDisplay score={strategy.safetyScore} size="sm" showIcon={false} />
                </div>
              </div>
            </div>
          </Card>
        ))}

        {strategies.length === 0 && (
          <Card className="p-12 text-center text-muted-foreground">No strategies found matching your filters.</Card>
        )}
      </div>

      {/* Desktop View */}
      <Card className="overflow-hidden hidden md:block">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_100px_120px_120px_80px_100px] gap-4 p-4 border-b bg-muted/50 text-xs font-medium text-muted-foreground uppercase">
          <div>Strategy</div>
          <div className="text-right">
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
              Deposited <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="text-right">
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
              Current APY <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="text-right">
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
              TVL <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="text-right">
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
              Safety <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="text-center">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y">
          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              onClick={() => handleRowClick(strategy.id)}
              className="grid grid-cols-[1fr_100px_120px_120px_80px_100px] gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              {/* Strategy Name & Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center -space-x-2">
                  {strategy.tokenIcons.map((icon, idx) => (
                    <div
                      key={idx}
                      className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-lg"
                    >
                      {icon}
                    </div>
                  ))}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{strategy.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {strategy.protocol} • {strategy.chain}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deposited */}
              <div className="text-right text-sm font-medium">{strategy.deposited}</div>

              {/* Current APY */}
              <div className="text-right">
                <div className="text-sm font-bold text-foreground">{strategy.currentApy.toFixed(2)}%</div>
              </div>

              {/* TVL */}
              <div className="text-right">
                <div className="text-sm font-medium">{strategy.tvl}</div>
                <div className="text-xs text-muted-foreground">${(strategy.tvlNumeric / 1000000).toFixed(2)}M</div>
              </div>

              {/* Safety Score */}
              <div className="flex justify-end items-center">
                <SafetyScoreDisplay score={strategy.safetyScore} size="md" showIcon={false} />
              </div>

              <div className="flex justify-center items-center">
                <Button size="sm" variant="outline" onClick={(e) => handleQuickDeposit(e, strategy)} className="gap-1">
                  <Plus className="h-3 w-3" />
                  Deposit
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {strategies.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">No strategies found matching your filters.</div>
        )}
      </Card>

      <QuickDepositDialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen} strategy={selectedStrategy} />
    </>
  )
}
