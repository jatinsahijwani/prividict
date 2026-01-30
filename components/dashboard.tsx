'use client';

import { useMarkets } from '@/contexts/market-context';
import { Header } from './header';
import { CreateMarketModal } from './create-market-modal';
import { MarketCard } from './market-card';
import { MarketStats } from './market-stats';
import { Empty } from '@/components/ui/empty';

export function Dashboard() {
  const { markets } = useMarkets();

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <div className="sticky top-16 z-10 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Private Markets
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Privacy-first prediction markets on Aleo
              </p>
            </div>
            <CreateMarketModal />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        {markets.length > 0 && <MarketStats />}

        {/* Markets Grid */}
        {markets.length === 0 ? (
          <div className="flex items-center justify-center min-h-100">
            <Empty
              title="No markets yet"
              description="Create the first market to get started"
              icon="📊"
            />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-max">
            {markets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
