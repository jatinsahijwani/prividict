'use client';

import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";

export function Header() {
  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Private Markets
              </h1>
              <p className="text-xs text-muted-foreground">
                Built on Aleo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://aleo.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              About Aleo
            </a>
            {/* <Button
              variant="outline"
              size="sm"
              disabled
              className="text-xs bg-transparent"
            >
              Connect Wallet
            </Button> */}
            <WalletMultiButton />
          </div>
        </div>
      </div>
    </header>
  );
}
