'use client';

import { useMarkets } from '@/contexts/market-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export function MarketStats() {
  const { markets } = useMarkets();

  const totalMarkets = markets.length;
  const resolvedMarkets = markets.filter((m) => m.isResolved).length;
  const openMarkets = totalMarkets - resolvedMarkets;
  const totalVolume = markets.reduce(
    (acc, m) => acc + m.totalYes + m.totalNo,
    0
  );

  const stats = [
    {
      label: 'Total Markets',
      value: totalMarkets,
      icon: '📊',
    },
    {
      label: 'Open Markets',
      value: openMarkets,
      icon: '🟢',
    },
    {
      label: 'Resolved',
      value: resolvedMarkets,
      icon: '✓',
    },
    {
      label: 'Total Volume',
      value: totalVolume.toLocaleString(),
      icon: '💰',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-primary/20 bg-gradient-to-br from-card to-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
