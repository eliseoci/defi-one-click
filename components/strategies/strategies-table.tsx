"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Plus } from 'lucide-react';
import { Strategy } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { QuickDepositDialog } from "./quick-deposit-dialog";
import Link from "next/link";

interface StrategiesTableProps {
  strategies: Strategy[];
}

export function StrategiesTable({ strategies }: StrategiesTableProps) {
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);

  const getSafetyColor = (score: number) => {
    if (score >= 4) return "text-green-500";
    if (score >= 3) return "text-yellow-500";
    return "text-orange-500";
  };

  const handleQuickDeposit = (e: React.MouseEvent, strategy: Strategy) => {
    e.stopPropagation();
    setSelectedStrategy(strategy);
    setDepositDialogOpen(true);
  };

  return (
    <>
      <Card className="overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_100px_100px_120px_100px_120px_80px_100px] gap-4 p-4 border-b bg-muted/50 text-xs font-medium text-muted-foreground uppercase">
          <div>Strategy</div>
          <div className="text-right">
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
              Wallet <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
          </div>
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
              Daily <ArrowUpDown className="ml-1 h-3 w-3" />
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
            <Link key={strategy.id} href={`/strategies/${strategy.id}`}>
              <div className="grid grid-cols-[1fr_100px_100px_120px_100px_120px_80px_100px] gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer">
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
                      {strategy.isNew && (
                        <Badge variant="secondary" className="text-xs">New</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground uppercase">
                        {strategy.protocol}
                        {strategy.protocolType && ` (${strategy.protocolType})`}
                      </span>
                      {strategy.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Wallet */}
                <div className="text-right text-sm font-medium">
                  {strategy.deposited}
                </div>

                {/* Deposited */}
                <div className="text-right text-sm font-medium">
                  {strategy.deposited}
                </div>

                {/* Current APY */}
                <div className="text-right">
                  <div className="text-sm font-bold text-green-500">
                    {strategy.currentApy.toFixed(2)}%
                  </div>
                </div>

                {/* Daily */}
                <div className="text-right text-sm">
                  {strategy.dailyYield.toFixed(4)}%
                </div>

                {/* TVL */}
                <div className="text-right">
                  <div className="text-sm font-medium">{strategy.tvl}</div>
                  <div className="text-xs text-muted-foreground">
                    ${(strategy.tvlNumeric / 1000000).toFixed(2)}M
                  </div>
                </div>

                {/* Safety Score */}
                <div className="flex justify-end items-center">
                  <div className={cn("flex gap-0.5", getSafetyColor(strategy.safetyScore))}>
                    {[1, 2, 3].map((bar) => (
                      <div
                        key={bar}
                        className={cn(
                          "w-1 rounded-full",
                          bar === 1 && "h-2",
                          bar === 2 && "h-3",
                          bar === 3 && "h-4",
                          bar <= strategy.safetyScore ? "bg-current" : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-center items-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => handleQuickDeposit(e, strategy)}
                    className="gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Deposit
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {strategies.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            No strategies found matching your filters.
          </div>
        )}
      </Card>

      <QuickDepositDialog
        open={depositDialogOpen}
        onOpenChange={setDepositDialogOpen}
        strategy={selectedStrategy}
      />
    </>
  );
}
