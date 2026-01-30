'use client';

import React, { useState } from "react";
import { createMarket } from '@/lib/leo';
import { useMarkets } from '@/contexts/market-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

export function CreateMarketModal() {

  const wallet = useWallet();


  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { refreshMarkets } = useMarkets(); // ✅ Use refresh instead
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      toast({
        title: 'Invalid input',
        description: 'Please enter a market question',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {

      // ✅ Execute Aleo transaction
      const txId = await createMarket(wallet, question.trim());

      toast({
        title: 'Transaction Submitted',
        description: `Tx: ${txId.slice(0, 12)}...`,
      });

      // ✅ Wait a bit for indexing
      await new Promise((r) => setTimeout(r, 8000));

      // ✅ Reload markets from records
      await refreshMarkets();

      toast({
        title: 'Market Created',
        description: 'Your market is now live on-chain.',
      });

      setQuestion('');
      setOpen(false);

    } catch (error) {

      console.error(error);

      toast({
        title: 'Error creating market',
        description:
          error instanceof Error
            ? error.message
            : 'Transaction failed',
        variant: 'destructive',
      });

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>

      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          Create Market
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-106.25">

        <DialogHeader>
          <DialogTitle>Create New Market</DialogTitle>
          <DialogDescription>
            Ask a yes/no question about future events.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-2">
            <Label htmlFor="question">Market Question</Label>

            <Input
              id="question"
              placeholder="e.g., Will BTC reach $100k by 2026?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isLoading}
              maxLength={200}
            />

            <p className="text-xs text-muted-foreground">
              {question.length}/200 characters
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-4">

            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isLoading || !question.trim()}
            >
              {isLoading ? 'Creating...' : 'Create Market'}
            </Button>

          </div>

        </form>

      </DialogContent>

    </Dialog>
  );
}
