"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal } from 'lucide-react';
import { cn } from "@/lib/utils";

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

const protocols = [
  { name: 'Kodiak', icon: '🐻' },
  { name: 'Balancer', icon: '⚖️' },
  { name: 'Stellaswap', icon: '⭐' },
  { name: 'Beamswap', icon: '🌟' },
  { name: 'Sushi', icon: '🍣' },
  { name: 'Curve', icon: '🌀' },
  { name: 'Uniswap', icon: '🦄' },
  { name: 'Pendle', icon: '⏱️' },
];

export function StrategiesFilters({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: StrategiesFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Protocol Icons Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {protocols.map((protocol) => (
          <Button
            key={protocol.name}
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full shrink-0"
            title={protocol.name}
          >
            <span className="text-xl">{protocol.icon}</span>
          </Button>
        ))}
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className="gap-2"
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
            {category.badge && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                🔥
              </Badge>
            )}
          </Button>
        ))}
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <span>Clear All</span>
          <Badge variant="secondary" className="h-5 px-1.5 text-xs">1</Badge>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by asset name"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}
