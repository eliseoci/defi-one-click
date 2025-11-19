"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Wallet, Trash2, Star } from 'lucide-react';
import { type Wallet as WalletType, SUPPORTED_CHAINS } from "@/lib/types";
import { ConnectWalletDialog } from "./connect-wallet-dialog";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';

interface WalletManagerProps {
  userId?: string;
  initialWallets?: WalletType[];
}

export function WalletManager({ userId, initialWallets = [] }: WalletManagerProps) {
  const [wallets, setWallets] = useState<WalletType[]>(initialWallets);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  const handleWalletAdded = (newWallet: WalletType) => {
    const hasPrimary = wallets.some((wallet) => wallet.is_primary);
    const walletToAdd = hasPrimary ? newWallet : { ...newWallet, is_primary: true };
    setWallets([walletToAdd, ...wallets]);
    setDialogOpen(false);
    if (userId) {
      router.refresh();
    }
  };

  const handleDeleteWallet = async (walletId: string) => {
    if (!userId) {
      setWallets(wallets.filter((w) => w.id !== walletId));
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("wallets")
      .delete()
      .eq("id", walletId);

    if (!error) {
      setWallets(wallets.filter(w => w.id !== walletId));
      router.refresh();
    }
  };

  const handleSetPrimary = async (walletId: string) => {
    if (!userId) {
      setWallets(wallets.map((w) => ({
        ...w,
        is_primary: w.id === walletId
      })));
      return;
    }

    const supabase = createClient();
    
    // Set all to false first
    await supabase
      .from("wallets")
      .update({ is_primary: false })
      .eq("user_id", userId);

    // Set selected to true
    const { error } = await supabase
      .from("wallets")
      .update({ is_primary: true })
      .eq("id", walletId);

    if (!error) {
      setWallets(wallets.map(w => ({
        ...w,
        is_primary: w.id === walletId
      })));
      router.refresh();
    }
  };

  const getChainInfo = (chainId: string) => {
    return SUPPORTED_CHAINS.find(c => c.id === chainId);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Connected Wallets</h1>
          <p className="text-muted-foreground">
            Manage your wallet connections across different chains
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
      </div>

      {wallets.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary mb-4">
              <Wallet className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No wallets connected</h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
              Connect your first wallet to start tracking your portfolio across multiple chains
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {wallets.map((wallet) => {
            const chainInfo = getChainInfo(wallet.chain);
            return (
              <Card key={wallet.id} className="bg-card border-border">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-lg text-xl font-bold"
                      style={{ backgroundColor: chainInfo?.color + "20", color: chainInfo?.color }}
                    >
                      {chainInfo?.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{chainInfo?.name}</p>
                        {wallet.is_primary && (
                          <Badge variant="default" className="gap-1">
                            <Star className="h-3 w-3" />
                            Primary
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground font-mono">
                        {truncateAddress(wallet.address)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!wallet.is_primary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetPrimary(wallet.id)}
                      >
                        Set Primary
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteWallet(wallet.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ConnectWalletDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        userId={userId}
        onWalletAdded={handleWalletAdded}
      />
    </div>
  );
}
