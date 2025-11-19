"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BridgeFlow } from "./bridge-flow";
import { SwapFlow } from "./swap-flow";
import { StakeFlow } from "./stake-flow";
import { OneStepFlow } from "./one-step-flow";
import { type Wallet } from "@/lib/types";

interface ExecutionInterfaceProps {
  userId: string;
  wallets: Wallet[];
}

export function ExecutionInterface({ userId, wallets }: ExecutionInterfaceProps) {
  const [activeTab, setActiveTab] = useState("one-step");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Execute Transaction</h1>
        <p className="text-muted-foreground">
          Bridge, swap, and stake in one step or execute individual actions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="one-step">One-Step</TabsTrigger>
          <TabsTrigger value="bridge">Bridge</TabsTrigger>
          <TabsTrigger value="swap">Swap</TabsTrigger>
          <TabsTrigger value="stake">Stake</TabsTrigger>
        </TabsList>

        <TabsContent value="one-step" className="mt-6">
          <OneStepFlow userId={userId} wallets={wallets} />
        </TabsContent>

        <TabsContent value="bridge" className="mt-6">
          <BridgeFlow userId={userId} wallets={wallets} />
        </TabsContent>

        <TabsContent value="swap" className="mt-6">
          <SwapFlow userId={userId} wallets={wallets} />
        </TabsContent>

        <TabsContent value="stake" className="mt-6">
          <StakeFlow userId={userId} wallets={wallets} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
