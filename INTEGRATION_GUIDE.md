# Aleo Leo Integration Guide

This is a privacy-first prediction market MVP built with Next.js and React. The application currently uses mock Leo API calls to simulate blockchain transactions. Follow this guide to integrate real Aleo blockchain functionality.

## Current Architecture

### Mock Implementation (`/lib/leo.ts`)
- `createMarket(question)` - Creates a new market
- `placeBet(marketId, amount, isYes)` - Places a bet on a market
- `resolveMarket(marketId, outcome)` - Resolves a market with a YES/NO outcome
- Mock data is stored in memory for demonstration

### Components

**Dashboard** (`/components/dashboard.tsx`)
- Main interface showing all markets
- Displays market statistics
- Create market button

**MarketCard** (`/components/market-card.tsx`)
- Individual market display with YES/NO totals
- Visual bars showing vote distribution
- Bet placement interface
- Market resolution buttons (admin/oracle only)

**CreateMarketModal** (`/components/create-market-modal.tsx`)
- Modal form to create new markets
- Question input with character limit

**MarketStats** (`/components/market-stats.tsx`)
- Overview statistics dashboard
- Total markets, open markets, resolved, total volume

### State Management

**MarketContext** (`/contexts/market-context.tsx`)
- Global market state using React Context
- Provides `useMarkets()` hook for all components
- Methods: `addMarket()`, `updateMarket()`, `refreshMarkets()`

## Integration Steps

### 1. Setup Aleo Account & Wallet

```bash
# Install Aleo CLI
npm install -g @aleo/cli

# Create an Aleo account
aleo account new
```

### 2. Create Leo Contracts

Create `/contracts/prediction_market.leo`:

```leo
program prediction_market.aleo {
    struct Market {
        id: u32,
        question: field,
        total_yes: u64,
        total_no: u64,
        is_resolved: bool,
        resolved_outcome: u8, // 0: unresolved, 1: yes, 2: no
        oracle: address,
    }

    struct Bet {
        market_id: u32,
        amount: u64,
        is_yes: bool,
        better: address,
    }

    mapping markets: u32 => Market;
    mapping bets: u64 => Bet;

    transition create_market(question: field) -> Market {
        let id: u32 = 1u32; // In real implementation, get from global counter
        let market: Market = Market {
            id: id,
            question: question,
            total_yes: 0u64,
            total_no: 0u64,
            is_resolved: false,
            resolved_outcome: 0u8,
            oracle: self.caller,
        };
        return market;
    }

    transition place_bet(market_id: u32, amount: u64, is_yes: bool) -> Market {
        let market: Market = markets[market_id];
        assert !market.is_resolved;
        
        let updated_market: Market = is_yes ? 
            Market {
                total_yes: market.total_yes + amount,
                ...market
            } : 
            Market {
                total_no: market.total_no + amount,
                ...market
            };
        
        return updated_market;
    }

    transition resolve_market(market_id: u32, outcome: u8) -> Market {
        let market: Market = markets[market_id];
        assert market.oracle == self.caller;
        
        let updated_market: Market = Market {
            is_resolved: true,
            resolved_outcome: outcome,
            ...market
        };
        
        return updated_market;
    }
}
```

### 3. Setup Leo SDK Integration

Install dependencies:

```bash
npm install @aleo/sdk --save
```

Update `/lib/leo.ts`:

```typescript
import { Account } from '@aleo/sdk';

const account = new Account({
  privateKey: process.env.ALEO_PRIVATE_KEY!,
});

export async function createMarket(question: string): Promise<Market> {
  // Call real Leo transition
  const inputs = [
    `"${question}"field`, // Input format: "question"field
  ];

  const response = await account.execute({
    program: 'prediction_market',
    function: 'create_market',
    inputs,
  });

  // Parse response and return Market object
  // Handle credits for transaction fees
  return parseMarketResponse(response);
}

export async function placeBet(
  marketId: string,
  amount: number,
  isYes: boolean
): Promise<Market> {
  const inputs = [
    `${marketId}u32`,
    `${amount}u64`,
    isYes ? 'true' : 'false',
  ];

  const response = await account.execute({
    program: 'prediction_market',
    function: 'place_bet',
    inputs,
  });

  return parseMarketResponse(response);
}

export async function resolveMarket(
  marketId: string,
  outcome: 'YES' | 'NO'
): Promise<Market> {
  const outcomeValue = outcome === 'YES' ? '1u8' : '2u8';
  
  const inputs = [
    `${marketId}u32`,
    outcomeValue,
  ];

  const response = await account.execute({
    program: 'prediction_market',
    function: 'resolve_market',
    inputs,
  });

  return parseMarketResponse(response);
}
```

### 4. Add Wallet Connection

Create `/components/wallet-connector.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function WalletConnector() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>('');
  const { toast } = useToast();

  const connectWallet = async () => {
    try {
      // Connect to Aleo wallet extension or fallback to private key
      // Implementation depends on chosen wallet provider
      
      toast({
        title: 'Wallet connected',
        description: 'You can now place bets and create markets',
      });
      setIsConnected(true);
    } catch (error) {
      toast({
        title: 'Connection failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button onClick={connectWallet} disabled={isConnected}>
      {isConnected ? `Connected: ${address.slice(0, 6)}...` : 'Connect Wallet'}
    </Button>
  );
}
```

### 5. Environment Variables

Add to `.env.local`:

```
ALEO_PRIVATE_KEY=your_private_key_here
ALEO_PROGRAM_ID=your_program_id_here
ALEO_RPC_URL=https://api.testnet.aleo.org
```

### 6. Handle Private Credits

In `/lib/leo.ts`, add credit handling:

```typescript
export async function getUserBalance(): Promise<number> {
  // Query account balance from Aleo
  const balance = await account.getBalance();
  return balance;
}

export async function estimateTransactionCost(
  functionName: string,
  inputs: string[]
): Promise<number> {
  // Estimate Leo transaction fee
  // Return cost in Aleo credits
  return 0.5; // Example: 0.5 credits
}
```

## Testing

1. **Testnet**: Deploy contracts to Aleo testnet
2. **Unit Tests**: Add tests for Leo transitions
3. **Integration Tests**: Test market creation, betting, resolution flow

## Security Considerations

- **Private Bets**: Leverage Aleo's privacy features to keep bet amounts private
- **Oracle Management**: Implement multi-sig oracle for market resolution
- **Payout Logic**: Add secure payout transition in Leo contract
- **Fraud Prevention**: Validate market questions and prevent malicious inputs

## Future Enhancements

- [ ] Multi-user support with proper authentication
- [ ] Market categories and search functionality
- [ ] Betting history and user portfolio
- [ ] Payout distribution system
- [ ] Market dispute resolution
- [ ] Fee structure and treasury management
- [ ] Real-time price feeds for outcome validation
- [ ] Mobile app integration
- [ ] Cross-chain interoperability

## Resources

- [Aleo Documentation](https://developer.aleo.org)
- [Leo Language Guide](https://leo.readme.io)
- [Aleo CLI](https://github.com/aleo/aleo-cli)
- [Privacy-First dApps](https://aleo.org)
