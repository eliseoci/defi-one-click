"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SUPPORTED_CHAINS, type Wallet, type ChainType } from "@/lib/types";
import { Coins, TrendingUp } from 'lucide-react';

interface StakeFlowProps {
  userId: string;
  wallets: Wallet[];
}

export function StakeFlow({ userId, wallets }: StakeFlowProps) {
  const [chain, setChain] = useState<ChainType>("ethereum");
  const [token, setToken] = useState("ETH");
  const [protocol, setProtocol] = useState("lido");
  const [amount, setAmount] = useState("");

  const protocols = [
    { id: "lido", name: "Lido", apy: "6.8", risk: "Low" },
    { id: "aave", name: "Aave", apy: "8.2", risk: "Low" },
    { id: "compound", name: "Compound", apy: "7.5", risk: "Low" },
    { id: "curve", name: "Curve", apy: "9.1", risk: "Medium" },
  ];

  const selectedProtocol = protocols.find(p => p.id === protocol);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-green-500" />
          <CardTitle className="text-foreground">Stake Assets</CardTitle>
        </div>
        <CardDescription>
          Earn rewards by staking your tokens in DeFi protocols
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
          <Label>Protocol</Label>
          <Select value={protocol} onValueChange={setProtocol}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {protocols.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{p.name}</span>
                    <span className="text-success ml-2">{p.apy}% APY</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProtocol && (
          <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">APY</span>
              <div className="flex items-center gap-1 text-success font-semibold">
                <TrendingUp className="h-4 w-4" />
                {selectedProtocol.apy}%
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Risk Level</span>
              <Badge variant={selectedProtocol.risk === "Low" ? "default" : "secondary"}>
                {selectedProtocol.risk}
              </Badge>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Amount to Stake</Label>
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

        {amount && parseFloat(amount) > 0 && selectedProtocol && (
          <div className="pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated Yearly Rewards</span>
              <span className="font-medium text-success">
                {(parseFloat(amount) * parseFloat(selectedProtocol.apy) / 100).toFixed(6)} {token}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated Monthly Rewards</span>
              <span className="font-medium text-foreground">
                {(parseFloat(amount) * parseFloat(selectedProtocol.apy) / 100 / 12).toFixed(6)} {token}
              </span>
            </div>
          </div>
        )}

        <Button className="w-full" disabled={!amount || parseFloat(amount) <= 0}>
          Stake Assets
        </Button>
      </CardContent>
    </Card>
  );
}
