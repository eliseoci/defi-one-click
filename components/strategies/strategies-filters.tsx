"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface StrategiesFiltersProps {
  selectedChains: string[]
  onChainsChange: (chains: string[]) => void
  stablecoinsOnly: boolean
  onStablecoinsOnlyChange: (value: boolean) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

const chains = [
  { id: "Ethereum", name: "Ethereum" },
  { id: "Arbitrum", name: "Arbitrum" },
  { id: "Optimism", name: "Optimism" },
  { id: "Polygon", name: "Polygon" },
  { id: "Base", name: "Base" },
  { id: "Avalanche", name: "Avalanche" },
  { id: "BSC", name: "BSC" },
  { id: "Moonbeam", name: "Moonbeam" },
]

export function StrategiesFilters({
  selectedChains,
  onChainsChange,
  stablecoinsOnly,
  onStablecoinsOnlyChange,
  searchQuery,
  onSearchChange,
}: StrategiesFiltersProps) {
  const [isChainPopoverOpen, setIsChainPopoverOpen] = useState(false)

  const toggleChain = (chainId: string) => {
    const newChains = selectedChains.includes(chainId)
      ? selectedChains.filter((id) => id !== chainId)
      : [...selectedChains, chainId]
    onChainsChange(newChains)
  }

  const clearAllFilters = () => {
    onChainsChange([])
    onStablecoinsOnlyChange(false)
  }

  const totalActiveFilters = selectedChains.length + (stablecoinsOnly ? 1 : 0)

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 md:flex-wrap">
        {/* Chains Filter */}
        <Popover open={isChainPopoverOpen} onOpenChange={setIsChainPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant={selectedChains.length > 0 ? "default" : "outline"} size="sm" className="gap-2 shrink-0">
              <span>Chains</span>
              {selectedChains.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {selectedChains.length}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="space-y-1">
              {chains.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => toggleChain(chain.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors",
                    selectedChains.includes(chain.id) && "bg-accent",
                  )}
                >
                  <span>{chain.name}</span>
                  {selectedChains.includes(chain.id) && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2 px-3 h-9 rounded-md border border-input bg-background shrink-0">
          <Checkbox
            id="stablecoins-only"
            checked={stablecoinsOnly}
            onCheckedChange={(checked) => onStablecoinsOnlyChange(checked as boolean)}
          />
          <Label htmlFor="stablecoins-only" className="text-sm font-medium cursor-pointer select-none">
            Stablecoins Only
          </Label>
        </div>

        {totalActiveFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={clearAllFilters}
          >
            <span>Clear All ({totalActiveFilters})</span>
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by asset name"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-10 md:h-9"
        />
      </div>
    </div>
  )
}
