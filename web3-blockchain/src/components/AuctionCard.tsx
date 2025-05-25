
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, Gavel, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuctionCardProps {
  nftId: string;
  nftName: string;
  currentBid: number;
  minBid: number;
  endTime: Date;
  totalBids: number;
}

const AuctionCard: React.FC<AuctionCardProps> = ({
  nftId,
  nftName,
  currentBid,
  minBid,
  endTime,
  totalBids
}) => {
  const [bidAmount, setBidAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      if (distance < 0) {
        setTimeLeft('Auction ended');
        clearInterval(timer);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const handleBid = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bid = parseFloat(bidAmount);
    if (bid <= currentBid) {
      toast({
        title: "Invalid Bid",
        description: `Bid must be higher than current bid of ${currentBid} ETH`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Bid Placed!",
      description: `Your bid of ${bid} ETH has been placed for ${nftName}`,
    });
    
    setBidAmount('');
  };

  const isAuctionEnded = new Date() > endTime;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5" />
            Auction
          </div>
          <Badge variant={isAuctionEnded ? "destructive" : "default"}>
            {isAuctionEnded ? "Ended" : "Live"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400">Current Bid</p>
            <p className="text-xl font-bold">{currentBid} ETH</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Bids</p>
            <p className="text-xl font-bold">{totalBids}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" />
          <span className={isAuctionEnded ? "text-red-400" : "text-green-400"}>
            {timeLeft}
          </span>
        </div>

        {!isAuctionEnded && (
          <form onSubmit={handleBid} className="space-y-3">
            <div>
              <Input
                type="number"
                step="0.01"
                placeholder={`Min: ${Math.max(currentBid + 0.01, minBid)} ETH`}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-web3-gradient">
              <TrendingUp className="w-4 h-4 mr-2" />
              Place Bid
            </Button>
          </form>
        )}

        {isAuctionEnded && (
          <div className="text-center py-4">
            <p className="text-gray-400">Auction has ended</p>
            <p className="font-medium">Winning bid: {currentBid} ETH</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuctionCard;
