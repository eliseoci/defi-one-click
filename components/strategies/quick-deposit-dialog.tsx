"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { mockTokens } from "@/lib/mock-data";
import { Strategy } from "@/lib/mock-data";
import { ArrowDownUp, Info } from 'lucide-react';

interface QuickDepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategy: Strategy | null;
}

export function QuickDepositDialog({ open, onOpenChange, strategy }: QuickDepositDialogProps) {
  const [selectedToken, setSelectedToken] = useState<string>("USDC");
  const [amount, setAmount] = useState<string>("");
  const [percentage, setPercentage] = useState<number>(0);

  if (!strategy) return null;

  const selectedTokenData = mockTokens.find(t => t.symbol === selectedToken);
  const maxAmount = selectedTokenData?.balance || 0;

  const handlePercentage = (pct: number) => {
    setPercentage(pct);
    setAmount(((maxAmount * pct) / 100).toFixed(2));
  };

  const needsSwap = !strategy.name.toUpperCase().includes(selectedToken.toUpperCase());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Deposit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Strategy Info */}
          <div className="p-3 rounded-lg bg-muted/50 space-y-1">
            <div className="flex items-center gap-2">
              {strategy.tokenIcons.map((icon, idx) => (
                <span key={idx} className="text-xl">{icon}</span>
              ))}
              <span className="font-semibold">{strategy.name}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {strategy.protocol} • APY: {strategy.currentApy.toFixed(2)}%
            </div>
          </div>

          {/* Token Selection */}
          <div className="space-y-2">
            <Label>Select Token</Label>
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
                      <span className="text-muted-foreground text-xs">
                        {token.balance.toFixed(2)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-16"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1 h-7"
                onClick={() => handlePercentage(100)}
              >
                MAX
              </Button>
            </div>
            <div className="flex gap-2">
              {[25, 50, 75, 100].map((pct) => (
                <Button
                  key={pct}
                  size="sm"
                  variant={percentage === pct ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => handlePercentage(pct)}
                >
                  {pct}%
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Available: {maxAmount.toFixed(2)} {selectedToken}
            </p>
          </div>

          {/* Swap Notice */}
          {needsSwap && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
              <ArrowDownUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-medium text-blue-500">Swap Required</p>
                <p className="text-muted-foreground mt-1">
                  Your {selectedToken} will be automatically swapped to match the strategy tokens
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* Summary */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">You deposit</span>
              <span className="font-medium">{amount || "0"} {selectedToken}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expected APY</span>
              <span className="font-medium text-green-500">{strategy.currentApy.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deposit Fee</span>
              <span className="font-medium">0%</span>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            className="w-full" 
            size="lg"
            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAmount}
          >
            {needsSwap ? 'Swap & Deposit' : 'Deposit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
