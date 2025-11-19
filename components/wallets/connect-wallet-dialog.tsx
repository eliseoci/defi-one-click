"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_CHAINS, type ChainType, type Wallet } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from 'lucide-react';

interface ConnectWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
  onWalletAdded: (wallet: Wallet) => void;
}

export function ConnectWalletDialog({
  open,
  onOpenChange,
  userId,
  onWalletAdded,
}: ConnectWalletDialogProps) {
  const [chain, setChain] = useState<ChainType>("ethereum");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);

    // Basic validation
    if (!address) {
      setError("Please enter a wallet address");
      setIsLoading(false);
      return;
    }

    if (address.length < 32) {
      setError("Invalid wallet address");
      setIsLoading(false);
      return;
    }

    try {
      if (!userId) {
        const now = new Date().toISOString();
        onWalletAdded({
          id: crypto.randomUUID(),
          user_id: "demo-user",
          address,
          chain,
          is_primary: false,
          created_at: now,
          updated_at: now,
        });
        setAddress("");
        setChain("ethereum");
        onOpenChange(false);
        return;
      }

      const supabase = createClient();

      // Check if wallet already exists
      const { data: existing } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .eq("address", address)
        .eq("chain", chain)
        .single();

      if (existing) {
        setError("This wallet is already connected");
        setIsLoading(false);
        return;
      }

      // Check if this is the first wallet
      const { data: wallets } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId);

      const isPrimary = !wallets || wallets.length === 0;

      // Insert new wallet
      const { data: newWallet, error: insertError } = await supabase
        .from("wallets")
        .insert({
          user_id: userId,
          address,
          chain,
          is_primary: isPrimary,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      onWalletAdded(newWallet);
      setAddress("");
      setChain("ethereum");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Connect Wallet</DialogTitle>
          <DialogDescription>
            Add a wallet address to track your portfolio across chains
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
            <Label>Wallet Address</Label>
            <Input
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="font-mono"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertDescription className="text-sm">
              Note: This is a read-only connection for portfolio tracking. No signatures required.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                "Connect Wallet"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
