
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'transfer';
  nftName: string;
  price?: string;
  from: string;
  to: string;
  date: string;
  txHash: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'buy',
    nftName: 'Cool Cat #1234',
    price: '2.5',
    from: '0x123...abc',
    to: '0x456...def',
    date: '2024-01-15',
    txHash: '0x789...xyz'
  },
  {
    id: '2',
    type: 'sell',
    nftName: 'Bored Ape #5678',
    price: '15.0',
    from: '0x456...def',
    to: '0x789...ghi',
    date: '2024-01-14',
    txHash: '0xabc...123'
  },
  {
    id: '3',
    type: 'transfer',
    nftName: 'Azuki #9876',
    from: '0x789...ghi',
    to: '0x456...def',
    date: '2024-01-13',
    txHash: '0xdef...456'
  }
];

const TransactionHistory = () => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'buy': return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'sell': return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'transfer': return <ArrowRightLeft className="w-4 h-4 text-purple-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      buy: 'bg-green-500/20 text-green-400',
      sell: 'bg-blue-500/20 text-blue-400',
      transfer: 'bg-purple-500/20 text-purple-400'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 border border-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                {getTypeIcon(tx.type)}
                <div>
                  <p className="font-medium">{tx.nftName}</p>
                  <p className="text-sm text-gray-400">
                    {tx.from.substring(0, 6)}...{tx.from.substring(tx.from.length - 4)} 
                    → 
                    {tx.to.substring(0, 6)}...{tx.to.substring(tx.to.length - 4)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Badge className={getTypeBadge(tx.type)}>
                    {tx.type.toUpperCase()}
                  </Badge>
                  {tx.price && (
                    <span className="font-medium">{tx.price} ETH</span>
                  )}
                </div>
                <p className="text-sm text-gray-400">{tx.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
