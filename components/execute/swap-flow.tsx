"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_CHAINS, type Wallet, type ChainType } from "@/lib/types";
import { ArrowRightLeft, ArrowDown } from 'lucide-react';

interface SwapFlowProps {
  userId: string;
  wallets: Wallet[];
}

export function SwapFlow({ userId, wallets }: SwapFlowProps) {
  const [chain, setChain] = useState<ChainType>("ethereum");
  const [fromToken, setFromToken] = useState("ETH");
  const [toToken, setToToken] = useState("USDC");
  const [amount, setAmount] = useState("");

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-purple-500" />
          <CardTitle className="text-foreground">Swap Tokens</CardTitle>
        </div>
        <CardDescription>
          Exchange tokens on the same blockchain network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Chain</Label>
          <Select value={chain} onValueChange={(v) => setChain(v as ChainType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_CHAINS.map((chain) => (
                <SelectItem key={chain.id} value={chain.id}>
                  {chain.icon} {chain.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>From</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.000001"
            />
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="USDC">USDC</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="DAI">DAI</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>To</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.0"
              value={amount ? (parseFloat(amount) * 3000).toFixed(2) : ""}
              readOnly
              className="bg-muted"
            />
            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USDC">USDC</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="DAI">DAI</SelectItem>
                <SelectItem value="wstETH">wstETH</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Exchange Rate</span>
            <span className="font-medium text-foreground">1 ETH = 3,000 USDC</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price Impact</span>
            <span className="font-medium text-success">0.12%</span>
          </div>
        </div>

        <Button className="w-full" disabled={!amount || parseFloat(amount) <= 0}>
          Swap Tokens
        </Button>
      </CardContent>
    </Card>
  );
}
