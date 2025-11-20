"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { type ActionType, type ChainType } from "@/lib/types";
import { AlertCircle, CheckCircle2, Loader2, PlayCircle, ShieldCheck } from "lucide-react";

type WorkflowAction = ActionType | "approve";

export interface TransactionWorkflowStep {
  id: string;
  label: string;
  action: WorkflowAction;
  description?: string;
  fromChain?: ChainType;
  toChain?: ChainType;
  tokenIn?: string;
  tokenOut?: string;
  amount?: number;
  metadata?: Record<string, any>;
  execute?: (
    provider: WalletExecutionProvider,
    step: TransactionWorkflowStep
  ) => Promise<WorkflowStepResult | void>;
}

export interface WorkflowStepResult {
  txHash?: string;
  message?: string;
}

export interface WalletExecutionProvider {
  name: string;
  executeStep: (step: TransactionWorkflowStep) => Promise<WorkflowStepResult>;
}

interface TransactionWorkflowWidgetProps {
  steps: TransactionWorkflowStep[];
  walletProvider?: WalletExecutionProvider;
  onComplete?: () => void;
  variant?: "default" | "minimal";
}

type StepStatus = "idle" | "running" | "success" | "error";

interface StepState {
  status: StepStatus;
  txHash?: string;
  message?: string;
  error?: string;
}

const statusLabels: Record<StepStatus, string> = {
  idle: "Pending",
  running: "Executing",
  success: "Completed",
  error: "Failed",
};

const statusClasses: Record<StepStatus, string> = {
  idle: "bg-secondary text-secondary-foreground",
  running: "bg-blue-500/10 text-blue-500 border border-blue-500/30",
  success: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30",
  error: "bg-destructive/10 text-destructive border border-destructive/40",
};

const createInitialState = (steps: TransactionWorkflowStep[]): Record<string, StepState> => {
  return steps.reduce((acc, step) => {
    acc[step.id] = { status: "idle" };
    return acc;
  }, {} as Record<string, StepState>);
};

const formatAmount = (amount?: number): string | null => {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return null;
  }

  const hasDecimals = !Number.isInteger(amount);

  return amount.toLocaleString(undefined, {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 6 : 0,
  });
};

const mockWalletProvider: WalletExecutionProvider = {
  name: "Mock Wallet Provider",
  async executeStep(step) {
    // Mimic on-chain confirmation delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    return {
      txHash: `0x${step.id.slice(0, 6)}${Date.now().toString(16)}`,
      message: `${step.label} executed via mock provider`,
    };
  },
};

export function TransactionWorkflowWidget({
  steps,
  walletProvider,
  onComplete,
  variant = "default",
}: TransactionWorkflowWidgetProps) {
  const provider = walletProvider ?? mockWalletProvider;
  const [stepStates, setStepStates] = useState<Record<string, StepState>>(() =>
    createInitialState(steps)
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const previousStepsSignature = useRef<string | null>(null);

  const stepsSignature = useMemo(() => {
    return JSON.stringify(
      steps.map((step) => ({
        id: step.id,
        label: step.label,
        action: step.action,
        description: step.description,
        fromChain: step.fromChain,
        toChain: step.toChain,
        tokenIn: step.tokenIn,
        tokenOut: step.tokenOut,
        amount: step.amount,
        metadata: step.metadata ?? null,
      }))
    );
  }, [steps]);

  useEffect(() => {
    if (previousStepsSignature.current === stepsSignature) {
      return;
    }
    previousStepsSignature.current = stepsSignature;
    setStepStates(createInitialState(steps));
    setActiveStepId(null);
    setExecutionLog([]);
    setGlobalError(null);
  }, [steps, stepsSignature]);

  const completedSteps = useMemo(
    () => steps.filter((step) => stepStates[step.id]?.status === "success").length,
    [steps, stepStates]
  );

  const overallProgress = steps.length
    ? Math.round((completedSteps / steps.length) * 100)
    : 0;

  const updateStepState = (stepId: string, updates: Partial<StepState>) => {
    setStepStates((prev) => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        ...updates,
      },
    }));
  };

  const handleReset = () => {
    setStepStates(createInitialState(steps));
    setActiveStepId(null);
    setExecutionLog([]);
    setGlobalError(null);
  };

  const executeWorkflow = async () => {
    if (!steps.length || isExecuting) return;

    setIsExecuting(true);
    setGlobalError(null);
    setExecutionLog([]);

    for (const step of steps) {
      setActiveStepId(step.id);
      updateStepState(step.id, { status: "running", error: undefined });
      setExecutionLog((prev) => [...prev, `▶️ ${step.label}`]);

      try {
        const result = await (step.execute
          ? step.execute(provider, step)
          : provider.executeStep(step));

        updateStepState(step.id, {
          status: "success",
          txHash: result?.txHash,
          message: result?.message,
        });
        setExecutionLog((prev) => [
          ...prev,
          `✅ ${step.label}${result?.txHash ? ` (${result.txHash})` : ""}`,
        ]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        updateStepState(step.id, { status: "error", error: errorMessage });
        setGlobalError(`Stopped at ${step.label}: ${errorMessage}`);
        setExecutionLog((prev) => [...prev, `🛑 ${step.label} failed: ${errorMessage}`]);
        setActiveStepId(null);
        setIsExecuting(false);
        return;
      }
    }

    setActiveStepId(null);
    setIsExecuting(false);
    setExecutionLog((prev) => [...prev, "🎉 Workflow completed"]);
    onComplete?.();
  };

  if (variant === "minimal") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {completedSteps} / {steps.length} steps ready
          </span>
          <Badge variant="outline" className="gap-2 text-[11px]">
            <ShieldCheck className="h-4 w-4" />
            {provider.name}
          </Badge>
        </div>

        <div className="space-y-2">
          {steps.map((step, index) => {
            const state = stepStates[step.id] ?? { status: "idle" };

            return (
              <div
                key={step.id}
                className="flex items-center justify-between rounded-xl border border-border/70 bg-background/80 px-4 py-3"
              >
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground/80">
                    Step {index + 1}
                  </p>
                  <p className="text-sm font-medium text-foreground">{step.label}</p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
                    state.status === "success" && "bg-emerald-500/10 text-emerald-500",
                    state.status === "running" && "bg-blue-500/10 text-blue-500",
                    state.status === "error" && "bg-destructive/10 text-destructive",
                    state.status === "idle" && "bg-muted text-muted-foreground"
                  )}
                >
                  {state.status === "running" && <Loader2 className="h-3 w-3 animate-spin" />}
                  {statusLabels[state.status]}
                </span>
              </div>
            );
          })}
        </div>

        {globalError && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="mr-2 h-4 w-4" />
            {globalError}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleReset} disabled={isExecuting} className="flex-1">
            Reset
          </Button>
          <Button
            onClick={executeWorkflow}
            disabled={!steps.length || isExecuting}
            className="flex-1"
          >
            {isExecuting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executing…
              </>
            ) : (
              "Start Flow"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-foreground">Transaction Workflow</CardTitle>
            <CardDescription>
              Pass structured steps to orchestrate approves, bridges, swaps, and stakes.
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-2 text-xs">
            <ShieldCheck className="h-4 w-4" />
            {provider.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {completedSteps} / {steps.length} steps completed
            </span>
            {activeStepId && <span>Executing: {steps.find((s) => s.id === activeStepId)?.label}</span>}
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        <Separator />

        <div className="space-y-6">
          {steps.map((step, index) => {
            const state = stepStates[step.id] ?? { status: "idle" };
            const formattedAmount = formatAmount(step.amount);

            return (
              <div key={step.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold",
                      state.status === "success" && "border-emerald-500 bg-emerald-500 text-white",
                      state.status === "running" && "border-blue-500 text-blue-500",
                      state.status === "error" && "border-destructive text-destructive",
                      state.status === "idle" && "border-border text-muted-foreground"
                    )}
                  >
                    {state.status === "success" ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                  </div>
                  {index < steps.length - 1 && <div className="my-2 h-full w-px bg-border" />}
                </div>

                <div className="flex-1 rounded-lg border border-border/80 bg-muted/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-muted-foreground">{step.action}</p>
                      <h3 className="text-lg font-semibold text-foreground">{step.label}</h3>
                    </div>
                    <Badge className={cn("text-xs", statusClasses[state.status])}>
                      {state.status === "running" && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
                      {statusLabels[state.status]}
                    </Badge>
                  </div>

                  {step.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                  )}

                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    {step.fromChain && (
                      <div>
                        <p className="text-xs uppercase">From Chain</p>
                        <p className="font-medium text-foreground">{step.fromChain}</p>
                      </div>
                    )}
                    {step.toChain && (
                      <div>
                        <p className="text-xs uppercase">To Chain</p>
                        <p className="font-medium text-foreground">{step.toChain}</p>
                      </div>
                    )}
                    {step.tokenIn && (
                      <div>
                        <p className="text-xs uppercase">Token In</p>
                        <p className="font-medium text-foreground">{step.tokenIn}</p>
                      </div>
                    )}
                    {step.tokenOut && (
                      <div>
                        <p className="text-xs uppercase">Token Out</p>
                        <p className="font-medium text-foreground">{step.tokenOut}</p>
                      </div>
                    )}
                    {formattedAmount && (
                      <div>
                        <p className="text-xs uppercase">Amount</p>
                        <p className="font-medium text-foreground">
                          {formattedAmount} {step.tokenOut ?? step.tokenIn ?? ""}
                        </p>
                      </div>
                    )}
                  </div>

                  {step.metadata && (
                    <pre className="mt-3 overflow-auto rounded-md bg-background/70 p-3 text-xs text-muted-foreground">
                      {JSON.stringify(step.metadata, null, 2)}
                    </pre>
                  )}

                  {state.txHash && (
                    <p className="mt-3 text-xs font-mono text-muted-foreground">
                      tx: {state.txHash}
                    </p>
                  )}
                  {state.error && (
                    <p className="mt-3 text-sm text-destructive">{state.error}</p>
                  )}
                </div>
              </div>
            );
          })}

          {!steps.length && (
            <div className="text-sm text-muted-foreground">
              Provide at least one step to preview the workflow.
            </div>
          )}
        </div>

        <Separator />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            Steps run sequentially against the connected wallet provider.
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReset} disabled={isExecuting}>
              Reset
            </Button>
            <Button onClick={executeWorkflow} disabled={!steps.length || isExecuting}>
              {isExecuting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Executing
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Execute Workflow
                </>
              )}
            </Button>
          </div>
        </div>

        {globalError && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            {globalError}
          </div>
        )}

        {executionLog.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Execution log
            </p>
            <div className="rounded-md border border-border bg-background/70 p-3 text-xs font-mono text-foreground/80">
              {executionLog.map((entry, idx) => (
                <div key={`${entry}-${idx}`} className="leading-relaxed">
                  {entry}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
