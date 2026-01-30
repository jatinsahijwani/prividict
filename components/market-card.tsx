'use client';

import { useState } from 'react';
import { Market, placeBet, resolveMarket } from '@/lib/leo';
import { useMarkets } from '@/contexts/market-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {

  const wallet = useWallet();

  const { updateMarket } = useMarkets();
  const { toast } = useToast();


  const [betAmount, setBetAmount] = useState('');
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const total = market.totalYes + market.totalNo;
  const yesPercentage = total > 0 ? (market.totalYes / total) * 100 : 50;
  const noPercentage = total > 0 ? (market.totalNo / total) * 100 : 50;

  const handlePlaceBet = async (isYes: boolean) => {
    if (!betAmount || Number(betAmount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid bet amount',
        variant: 'destructive',
      });
      return;
    }

    setIsPlacingBet(true);
    try {
      const amount = Number(betAmount);
      const updatedMarket = await placeBet(wallet, market.id, amount, isYes);
      updateMarket(updatedMarket);

      toast({
        title: 'Bet placed successfully!',
        description: `Placed ${amount} credits on ${isYes ? 'YES' : 'NO'}`,
      });

      setBetAmount('');
    } catch (error) {
      toast({
        title: 'Error placing bet',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsPlacingBet(false);
    }
  };

  const handleResolve = async (outcome: 'YES' | 'NO') => {
    setIsResolving(true);
    try {
      const updatedMarket = await resolveMarket(market.id, outcome);
      updateMarket(updatedMarket);

      toast({
        title: 'Market resolved!',
        description: `Market outcome: ${outcome}`,
      });
    } catch (error) {
      toast({
        title: 'Error resolving market',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-card/80 hover:border-primary/40 transition-colors">
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        {market.isResolved ? (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-300"
          >
            <Check className="w-3 h-3 mr-1" /> Resolved
          </Badge>
        ) : (
          <Badge className="bg-primary/20 text-primary">Open</Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-base leading-tight pr-20">
          {market.question}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Outcome Bars */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-green-600 dark:text-green-400">
              <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400" />
              YES
            </span>
            <span className="text-xs text-muted-foreground">{market.totalYes}</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 dark:bg-green-600 transition-all"
              style={{ width: `${yesPercentage}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-red-600 dark:text-red-400">
              <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400" />
              NO
            </span>
            <span className="text-xs text-muted-foreground">{market.totalNo}</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 dark:bg-red-600 transition-all"
              style={{ width: `${noPercentage}%` }}
            />
          </div>
        </div>

        {/* Bet Placement Section */}
        {!market.isResolved && (
          <div className="space-y-3 pt-2 border-t border-border/40">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Bet Amount (credits)
              </label>
              <Input
                type="number"
                placeholder="Enter amount..."
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                disabled={isPlacingBet}
                className="h-8"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                onClick={() => handlePlaceBet(true)}
                disabled={isPlacingBet || !betAmount}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
              >
                {isPlacingBet ? 'Placing...' : 'Bet YES'}
              </Button>
              <Button
                size="sm"
                onClick={() => handlePlaceBet(false)}
                disabled={isPlacingBet || !betAmount}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
              >
                {isPlacingBet ? 'Placing...' : 'Bet NO'}
              </Button>
            </div>
          </div>
        )}

        {/* Resolved Outcome Display */}
        {market.isResolved && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              {market.resolvedOutcome === 'YES' ? (
                <>
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium">Outcome: YES</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium">Outcome: NO</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Resolve Button (Admin/Oracle only) */}
        {!market.isResolved && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleResolve('YES')}
              disabled={isResolving}
              className="text-xs"
            >
              Resolve YES
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleResolve('NO')}
              disabled={isResolving}
              className="text-xs"
            >
              Resolve NO
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
