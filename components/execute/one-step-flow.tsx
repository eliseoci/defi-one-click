"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { SUPPORTED_CHAINS, type Wallet, type ChainType } from "@/lib/types";
import { ArrowDown, Zap, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

interface OneStepFlowProps {
  userId: string;
  wallets: Wallet[];
}

type ExecutionStep = 'bridge' | 'swap' | 'stake';
type ExecutionStatus = 'idle' | 'simulating' | 'confirming' | 'executing' | 'completed' | 'failed';

interface SimulationResult {
  totalGasFee: number;
  bridgeFee: number;
  swapFee: number;
  estimatedTime: number;
  priceImpact: number;
  finalAmount: string;
  steps: Array<{
    step: ExecutionStep;
    status: string;
    estimatedTime: number;
  }>;
}

export function OneStepFlow({ userId, wallets }: OneStepFlowProps) {
  const [fromChain, setFromChain] = useState<ChainType>("ethereum");
  const [toChain, setToChain] = useState<ChainType>("arbitrum");
  const [fromToken, setFromToken] = useState("ETH");
  const [toToken, setToToken] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [stakingProtocol, setStakingProtocol] = useState("aave");
  
  const [status, setStatus] = useState<ExecutionStatus>("idle");
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [currentStep, setCurrentStep] = useState<ExecutionStep | null>(null);
  const [progress, setProgress] = useState(0);

  const handleSimulate = async () => {
    setStatus("simulating");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockSimulation: SimulationResult = {
      totalGasFee: 0.0045,
      bridgeFee: 0.001,
      swapFee: 0.003,
      estimatedTime: 180,
      priceImpact: 0.12,
      finalAmount: (parseFloat(amount || "0") * 0.995).toFixed(6),
      steps: [
        { step: 'bridge', status: 'pending', estimatedTime: 60 },
        { step: 'swap', status: 'pending', estimatedTime: 30 },
        { step: 'stake', status: 'pending', estimatedTime: 90 },
      ],
    };
    
    setSimulation(mockSimulation);
    setStatus("confirming");
  };

  const handleExecute = async () => {
    setStatus("executing");
    setProgress(0);
    
    // Simulate execution steps
    const steps: ExecutionStep[] = ['bridge', 'swap', 'stake'];
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i]);
      
      // Simulate step execution
      for (let p = 0; p <= 100; p += 10) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setProgress((i * 100 + p) / 3);
      }
    }
    
    setStatus("completed");
    setCurrentStep(null);
  };

  const getStepLabel = (step: ExecutionStep) => {
    switch (step) {
      case 'bridge':
        return `Bridge ${fromToken} from ${fromChain} to ${toChain}`;
      case 'swap':
        return `Swap ${fromToken} to ${toToken}`;
      case 'stake':
        return `Stake ${toToken} on ${stakingProtocol}`;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-foreground">One-Step Execution</CardTitle>
          </div>
          <CardDescription>
            Bridge, swap, and stake in a single transaction flow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Bridge */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">1</Badge>
              <h3 className="font-semibold text-foreground">Bridge Assets</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Select value={fromToken} onValueChange={setFromToken}>
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
          </div>

          <Separator />

          {/* Step 2: Swap */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">2</Badge>
              <h3 className="font-semibold text-foreground">Swap Tokens</h3>
            </div>
            
            <div className="space-y-2">
              <Label>Swap to</Label>
              <Select value={toToken} onValueChange={setToToken}>
                <SelectTrigger>
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

          <Separator />

          {/* Step 3: Stake */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">3</Badge>
              <h3 className="font-semibold text-foreground">Stake for Yield</h3>
            </div>
            
            <div className="space-y-2">
              <Label>Protocol</Label>
              <Select value={stakingProtocol} onValueChange={setStakingProtocol}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aave">Aave (8.2% APY)</SelectItem>
                  <SelectItem value="compound">Compound (7.5% APY)</SelectItem>
                  <SelectItem value="lido">Lido (6.8% APY)</SelectItem>
                  <SelectItem value="curve">Curve (9.1% APY)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Simulation Results */}
          {simulation && status === "confirming" && (
            <>
              <Separator />
              <div className="space-y-4 p-4 rounded-lg bg-secondary/50">
                <h3 className="font-semibold text-foreground">Simulation Results</h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Fees</p>
                    <p className="font-semibold text-foreground">
                      ${((simulation.totalGasFee + simulation.bridgeFee + simulation.swapFee) * 3000).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Estimated Time</p>
                    <p className="font-semibold text-foreground">~{simulation.estimatedTime}s</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price Impact</p>
                    <p className="font-semibold text-foreground">{simulation.priceImpact}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Final Amount</p>
                    <p className="font-semibold text-foreground">{simulation.finalAmount} {toToken}</p>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This is a simulated transaction. Always verify amounts and fees before executing.
                  </AlertDescription>
                </Alert>
              </div>
            </>
          )}

          {/* Execution Progress */}
          {status === "executing" && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Executing Transaction</h3>
                  <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
                
                {currentStep && (
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-muted-foreground">
                      {getStepLabel(currentStep)}...
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Completion */}
          {status === "completed" && (
            <>
              <Separator />
              <Alert className="bg-success/10 border-success">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  Transaction completed successfully! Your {toToken} is now staked on {stakingProtocol}.
                </AlertDescription>
              </Alert>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {status === "idle" && (
              <Button
                onClick={handleSimulate}
                className="flex-1"
                disabled={!amount || parseFloat(amount) <= 0}
              >
                Simulate Transaction
              </Button>
            )}
            
            {status === "simulating" && (
              <Button className="flex-1" disabled>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Simulating...
              </Button>
            )}
            
            {status === "confirming" && (
              <>
                <Button variant="outline" className="flex-1" onClick={() => setStatus("idle")}>
                  Cancel
                </Button>
                <Button onClick={handleExecute} className="flex-1">
                  Execute Transaction
                </Button>
              </>
            )}
            
            {status === "executing" && (
              <Button className="flex-1" disabled>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Executing...
              </Button>
            )}
            
            {status === "completed" && (
              <Button onClick={() => window.location.href = "/dashboard"} className="flex-1">
                Back to Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
