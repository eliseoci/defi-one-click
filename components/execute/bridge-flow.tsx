"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_CHAINS, type Wallet, type ChainType } from "@/lib/types";
import { BadgeIcon as BridgeIcon, ArrowDown } from 'lucide-react';

interface BridgeFlowProps {
  userId: string;
  wallets: Wallet[];
}

export function BridgeFlow({ userId, wallets }: BridgeFlowProps) {
  const [fromChain, setFromChain] = useState<ChainType>("ethereum");
  const [toChain, setToChain] = useState<ChainType>("arbitrum");
  const [token, setToken] = useState("ETH");
  const [amount, setAmount] = useState("");

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BridgeIcon className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-foreground">Bridge Assets</CardTitle>
        </div>
        <CardDescription>
          Transfer assets across different blockchain networks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>From Chain</Label>
          <Select value={fromChain} onValueChange={(v) => setFromChain(v as ChainType)}>
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

        <div className="flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>To Chain</Label>
          <Select value={toChain} onValueChange={(v) => setToChain(v as ChainType)}>
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
          <Label>Amount</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.000001"
            />
            <Select value={token} onValueChange={setToken}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="USDC">USDC</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Bridge Fee</span>
            <span className="font-medium text-foreground">~0.001 ETH</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated Time</span>
            <span className="font-medium text-foreground">~2 minutes</span>
          </div>
        </div>

        <Button className="w-full" disabled={!amount || parseFloat(amount) <= 0}>
          Bridge Assets
        </Button>
      </CardContent>
    </Card>
  );
}
