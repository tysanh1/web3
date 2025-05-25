
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRightLeft, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NFTTransferProps {
  nftId: string;
  nftName: string;
}

const NFTTransfer: React.FC<NFTTransferProps> = ({ nftId, nftName }) => {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const { toast } = useToast();

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipientAddress) {
      toast({
        title: "Error",
        description: "Please enter a recipient address",
        variant: "destructive"
      });
      return;
    }

    setIsTransferring(true);
    
    // Simulate transfer
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Transfer Successful!",
      description: `${nftName} has been transferred to ${recipientAddress.substring(0, 6)}...${recipientAddress.substring(recipientAddress.length - 4)}`,
    });
    
    setRecipientAddress('');
    setIsTransferring(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5" />
          Transfer NFT
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              required
            />
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-sm text-yellow-400">
              ⚠️ Make sure the recipient address is correct. NFT transfers cannot be reversed.
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-web3-gradient"
            disabled={isTransferring}
          >
            {isTransferring ? (
              <>Transferring...</>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Transfer NFT
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NFTTransfer;
