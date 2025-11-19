"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Transaction, SUPPORTED_CHAINS } from "@/lib/types";
import { ArrowRightLeft, BadgeIcon as BridgeIcon, Coins, ExternalLink, CheckCircle2, XCircle, Loader2, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityTimelineProps {
  userId: string;
  initialTransactions: Transaction[];
}

export function ActivityTimeline({ userId, initialTransactions }: ActivityTimelineProps) {
  const [transactions] = useState<Transaction[]>(initialTransactions);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "bridge":
        return <BridgeIcon className="h-5 w-5" />;
      case "swap":
        return <ArrowRightLeft className="h-5 w-5" />;
      case "stake":
      case "unstake":
        return <Coins className="h-5 w-5" />;
      default:
        return <ArrowRightLeft className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "pending":
      case "confirming":
        return <Loader2 className="h-5 w-5 text-warning animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getChainInfo = (chainId: string) => {
    return SUPPORTED_CHAINS.find(c => c.id === chainId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "failed":
        return "destructive";
      case "pending":
      case "confirming":
        return "secondary";
      default:
        return "secondary";
    }
  };

  if (transactions.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No activity yet</h3>
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
            Your transaction history will appear here once you start using the platform
          </p>
          <Button asChild>
            <a href="/execute">Execute Transaction</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => {
        const fromChain = getChainInfo(tx.from_chain);
        const toChain = tx.to_chain ? getChainInfo(tx.to_chain) : null;

        return (
          <Card key={tx.id} className="bg-card border-border hover:bg-secondary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                  {getActionIcon(tx.action)}
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground capitalize">
                          {tx.action}
                        </h3>
                        <Badge variant={getStatusColor(tx.status)}>
                          {tx.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(tx.created_at), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(tx.status)}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary">
                      <span
                        className="font-bold"
                        style={{ color: fromChain?.color }}
                      >
                        {fromChain?.icon}
                      </span>
                      <span className="text-foreground">
                        {tx.from_amount} {tx.from_token}
                      </span>
                    </div>

                    {toChain && tx.to_token && (
                      <>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary">
                          <span
                            className="font-bold"
                            style={{ color: toChain?.color }}
                          >
                            {toChain?.icon}
                          </span>
                          <span className="text-foreground">
                            {tx.to_amount || '...'} {tx.to_token}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {tx.gas_fee && (
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <div>
                        Gas Fee: <span className="text-foreground font-medium">${(parseFloat(tx.gas_fee) * 3000).toFixed(2)}</span>
                      </div>
                      {tx.bridge_fee && (
                        <div>
                          Bridge Fee: <span className="text-foreground font-medium">${(parseFloat(tx.bridge_fee) * 3000).toFixed(2)}</span>
                        </div>
                      )}
                      {tx.estimated_time_seconds && (
                        <div>
                          Est. Time: <span className="text-foreground font-medium">~{tx.estimated_time_seconds}s</span>
                        </div>
                      )}
                    </div>
                  )}

                  {tx.error_message && (
                    <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive">{tx.error_message}</p>
                    </div>
                  )}

                  {tx.tx_hash && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-8">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        View on Explorer
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
