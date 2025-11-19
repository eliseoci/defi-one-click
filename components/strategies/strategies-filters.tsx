"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, ChevronDown, Check } from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

interface StrategiesFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const categories = [
  { id: 'all', label: 'All', icon: '📊' },
  { id: 'saved', label: 'Saved', icon: '⭐' },
  { id: 'positions', label: 'My Positions', icon: '💼' },
  { id: 'boosts', label: 'Boosts', icon: '🚀', badge: true },
  { id: 'stablecoin', label: 'Stablecoins', icon: '💵' },
  { id: 'bluechip', label: 'Blue Chips', icon: '💎' },
  { id: 'meme', label: 'Memes', icon: '🎭' },
  { id: 'single', label: 'Single', icon: '🎯' },
  { id: 'lp', label: 'LP', icon: '🔄' },
  { id: 'clm', label: 'CLM', icon: '📈' },
  { id: 'vault', label: 'Vaults', icon: '🏦' },
];

const chains = [
  { id: 'ethereum', name: 'Ethereum' },
  { id: 'arbitrum', name: 'Arbitrum' },
  { id: 'optimism', name: 'Optimism' },
  { id: 'polygon', name: 'Polygon' },
  { id: 'base', name: 'Base' },
  { id: 'avalanche', name: 'Avalanche' },
  { id: 'bsc', name: 'BSC' },
  { id: 'moonbeam', name: 'Moonbeam' },
];

export function StrategiesFilters({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: StrategiesFiltersProps) {
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [isChainPopoverOpen, setIsChainPopoverOpen] = useState(false);

  const toggleChain = (chainId: string) => {
    setSelectedChains(prev =>
      prev.includes(chainId)
        ? prev.filter(id => id !== chainId)
        : [...prev, chainId]
    );
  };

  const clearAllFilters = () => {
    setSelectedChains([]);
    onCategoryChange('all');
  };

  const totalActiveFilters = selectedChains.length + (selectedCategory !== 'all' ? 1 : 0);

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 md:flex-wrap">
        {/* Chains Filter */}
        <Popover open={isChainPopoverOpen} onOpenChange={setIsChainPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={selectedChains.length > 0 ? "default" : "outline"}
              size="sm"
              className="gap-2 shrink-0"
            >
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
                    selectedChains.includes(chain.id) && "bg-accent"
                  )}
                >
                  <span>{chain.name}</span>
                  {selectedChains.includes(chain.id) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Category Filters */}
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className="gap-2 shrink-0"
          >
            <span>{category.icon}</span>
            <span className="hidden sm:inline">{category.label}</span>
            {category.badge && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                🔥
              </Badge>
            )}
          </Button>
        ))}
        
        {totalActiveFilters > 0 && (
          <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={clearAllFilters}>
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Clear All</span>
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {totalActiveFilters}
            </Badge>
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
  );
}
