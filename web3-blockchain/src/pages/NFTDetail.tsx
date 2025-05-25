
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Share2, Eye, ExternalLink, ShoppingCart } from 'lucide-react';
import NFTComments from '@/components/NFTComments';
import NFTTransfer from '@/components/NFTTransfer';
import AuctionCard from '@/components/AuctionCard';
import TransactionHistory from '@/components/TransactionHistory';
import { useToast } from '@/hooks/use-toast';

const NFTDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock NFT data
  const nft = {
    id: id || '1',
    name: 'Digital Dreamscape #1234',
    image: 'https://picsum.photos/id/1/600/600',
    price: '2.5',
    currency: 'ETH',
    creator: 'ArtistName',
    collection: 'Digital Dreams',
    category: 'Art',
    likes: 142,
    views: 1205,
    description: 'A mesmerizing digital artwork that captures the essence of dreams and reality blending together in perfect harmony.',
    properties: [
      { trait: 'Background', value: 'Cosmic', rarity: '12%' },
      { trait: 'Style', value: 'Abstract', rarity: '8%' },
      { trait: 'Colors', value: 'Vibrant', rarity: '15%' }
    ],
    owner: '0x123...abc',
    contractAddress: '0x456...def'
  };

  const handleBuy = () => {
    toast({
      title: "Purchase Initiated",
      description: `Starting purchase process for ${nft.name}`,
    });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: `${nft.name} ${isLiked ? 'removed from' : 'added to'} your favorites`,
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "NFT link has been copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* NFT Image */}
          <div>
            <Card className="overflow-hidden">
              <img 
                src={nft.image} 
                alt={nft.name} 
                className="w-full h-[600px] object-cover"
              />
            </Card>
          </div>

          {/* NFT Info */}
          <div className="space-y-6">
            <div>
              <Link to={`/collection/${nft.collection}`} className="text-blue-400 hover:underline">
                {nft.collection}
              </Link>
              <h1 className="text-3xl font-bold mt-2">{nft.name}</h1>
              <p className="text-gray-400 mt-2">
                Owned by <span className="text-blue-400">{nft.owner}</span>
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{nft.views} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                <span className="text-sm">{nft.likes + (isLiked ? 1 : 0)} likes</span>
              </div>
              <Badge>{nft.category}</Badge>
            </div>

            {/* Price & Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Current Price</p>
                    <p className="text-3xl font-bold">{nft.price} {nft.currency}</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={handleBuy} className="flex-1 bg-web3-gradient">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Buy Now
                  </Button>
                  <Button variant="outline" onClick={handleLike}>
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Auction Card */}
            <AuctionCard
              nftId={nft.id}
              nftName={nft.name}
              currentBid={2.5}
              minBid={2.0}
              endTime={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)} // 3 days from now
              totalBids={12}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800 mb-6">
          <nav className="flex space-x-8">
            {['overview', 'properties', 'history', 'comments', 'transfer'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Description</h3>
                  <p className="text-gray-300 leading-relaxed">{nft.description}</p>
                  
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Contract Address</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{nft.contractAddress}</span>
                          <ExternalLink className="w-4 h-4 text-blue-400" />
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Token ID</span>
                        <span>{nft.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Blockchain</span>
                        <span>Ethereum</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'properties' && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Properties</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {nft.properties.map((prop, index) => (
                      <div key={index} className="border border-gray-800 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-400 uppercase tracking-wide">{prop.trait}</p>
                        <p className="font-semibold mt-1">{prop.value}</p>
                        <p className="text-xs text-blue-400 mt-1">{prop.rarity} have this trait</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'history' && <TransactionHistory />}
            {activeTab === 'comments' && <NFTComments />}
            {activeTab === 'transfer' && (
              <NFTTransfer nftId={nft.id} nftName={nft.name} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">More from this collection</h3>
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex gap-3">
                      <img 
                        src={`https://picsum.photos/id/${60 + item}/60/60`} 
                        alt={`NFT ${item}`}
                        className="w-15 h-15 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium">Digital Dream #{1230 + item}</p>
                        <p className="text-sm text-gray-400">{2.1 + item * 0.3} ETH</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDetail;
