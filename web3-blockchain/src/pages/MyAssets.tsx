import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import NFTCard from '@/components/NFTCard';
import CategoryFilter from '@/components/CategoryFilter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useWeb3 } from '@/context/Web3Context';
import { nftService } from '@/services/nftService';
import { NFT } from '@/types/nft';
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Categories and collections data
const categories = [
  { id: 'art', name: 'Art' },
  { id: 'collectibles', name: 'Collectibles' },
  { id: 'music', name: 'Music' },
  { id: 'virtual-worlds', name: 'Virtual Worlds' },
  { id: 'sports', name: 'Sports' }
];

const collections = [
  { id: 'cryptopunks', name: 'CryptoPunks' },
  { id: 'bayc', name: 'Bored Ape Yacht Club' },
  { id: 'art-blocks', name: 'Art Blocks' },
  { id: 'cool-cats', name: 'Cool Cats' },
  { id: 'digital-landscapes', name: 'Digital Landscapes' }
];

const MyAssets = () => {
  const [searchParams] = useSearchParams();
  const newNftId = searchParams.get('new');
  const { account } = useWeb3();
  const { toast } = useToast();
  
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('latest');
  const [priceRange, setPriceRange] = useState([0, 5]);

  // Fetch user's NFTs
  const fetchNFTs = useCallback(async () => {
    if (!account) return;

    try {
      setIsLoading(true);
      console.log('Fetching NFTs for account:', account);

      // If we have a new NFT ID, fetch it specifically first
      let newNFT: NFT | null = null;
      if (newNftId) {
        console.log('Fetching new NFT:', newNftId);
        try {
          newNFT = await nftService.getNFTById(newNftId);
          if (newNFT && newNFT.owner.toLowerCase() === account.toLowerCase()) {
            toast({
              title: "New NFT Found",
              description: `Successfully loaded "${newNFT.name}"`,
            });
          } else {
            console.warn('New NFT not found or not owned by current account');
          }
        } catch (error) {
          console.error('Error fetching new NFT:', error);
          toast({
            title: "Warning",
            description: "Could not load the newly created NFT. Please refresh the page.",
            variant: "destructive",
          });
        }
      }

      // Fetch all user's NFTs
      const userNFTs = await nftService.getNFTsByOwner(account);
      console.log('User NFTs:', userNFTs);

      // Combine new NFT with existing NFTs, avoiding duplicates
      const combinedNFTs = newNFT 
        ? [newNFT, ...userNFTs.filter(nft => nft.id !== newNFT.id)]
        : userNFTs;
      
      console.log('Combined NFTs:', combinedNFTs);
      setNfts(combinedNFTs);

      if (combinedNFTs.length === 0) {
        toast({
          title: "No NFTs Found",
          description: "You don't own any NFTs yet. Create your first NFT!",
        });
      } else if (newNftId && newNFT) {
        // Scroll to the new NFT
        setTimeout(() => {
          const newNftElement = document.getElementById(`nft-${newNftId}`);
          if (newNftElement) {
            newNftElement.scrollIntoView({ behavior: 'smooth' });
            newNftElement.classList.add('highlight-new-nft');
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your NFTs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [account, newNftId, toast]);

  // Initial fetch when component mounts or account changes
  useEffect(() => {
    if (account) {
      console.log('Account detected, fetching NFTs...');
      fetchNFTs();
    }
  }, [account, fetchNFTs]);

  // Listen for Transfer events
  useEffect(() => {
    if (!account) return;

    const listenToTransferEvents = async () => {
      try {
        console.log('Setting up Transfer event listeners...');
        const contract = await nftService.getContract();
        
        if (!contract) {
          console.warn('Contract not available, skipping event listeners');
          return () => {};
        }

        const handleTransfer = (from: string, to: string, tokenId: string) => {
          console.log('Transfer event detected:', { from, to, tokenId });
          if (from.toLowerCase() === account.toLowerCase() || 
              to.toLowerCase() === account.toLowerCase()) {
            console.log('Transfer involves current user, refreshing NFTs...');
            fetchNFTs();
          }
        };

        contract.on("Transfer", handleTransfer);
        
        return () => {
          contract.off("Transfer", handleTransfer);
        };
      } catch (error) {
        console.error('Error setting up event listeners:', error);
      }
    };

    const cleanup = listenToTransferEvents();
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, [account, fetchNFTs]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNFTs();
    setIsRefreshing(false);
  };

  // Filter and sort NFTs
  const filteredNFTs = nfts.filter(nft => {
    const matchesCategory = selectedCategory === 'all' || nft.category === selectedCategory;
    const matchesCollection = selectedCollection === 'all' || nft.collection.toLowerCase() === selectedCollection.toLowerCase();
    const matchesSearch = nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          nft.creator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriceRange = parseFloat(nft.price) >= priceRange[0] && parseFloat(nft.price) <= priceRange[1];
    
    return matchesCategory && matchesCollection && matchesSearch && matchesPriceRange;
  });

  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    if (sortOption === 'price-high') {
      return parseFloat(b.price) - parseFloat(a.price);
    } else if (sortOption === 'price-low') {
      return parseFloat(a.price) - parseFloat(b.price);
    } else if (sortOption === 'most-liked') {
      return b.likes - a.likes;
    } else if (sortOption === 'most-viewed') {
      return b.views - a.views;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedCollection('all');
    setPriceRange([0, 5]);
    setSortOption('latest');
    setSearchQuery('');
  };

  if (!account) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400">Please connect your wallet to view your NFTs</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">My Assets</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
                className={isRefreshing ? 'animate-spin' : ''}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <p className="text-sm text-gray-400">
                Connected: {account.substring(0, 6)}...{account.substring(38)}
              </p>
            </div>
          </div>
          <div className="w-1/3 max-w-xs">
            <Input
              placeholder="Search NFTs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">Category</h3>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">Collection</h3>
              <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="All Collections" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="all">All Collections</SelectItem>
                  {collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">Price Range (ETH)</h3>
              <div className="px-2">
                <Slider
                  defaultValue={[0, 5]}
                  min={0}
                  max={5}
                  step={0.1}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="my-6"
                />
                <div className="flex justify-between text-sm">
                  <span>{priceRange[0]} ETH</span>
                  <span>{priceRange[1]} ETH</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">Sort By</h3>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="most-liked">Most Liked</SelectItem>
                  <SelectItem value="most-viewed">Most Viewed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4">
              <Button 
                onClick={resetFilters}
                variant="outline"
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
          
          {/* NFT Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <>
                {newNftId && (
                  <div className="mb-6 p-4 bg-green-900/20 rounded-lg">
                    <p className="text-green-400">
                      Your new NFT has been created! It should appear in the list below.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedNFTs.map((nft) => (
                    <NFTCard
                      key={nft.id}
                      id={nft.id}
                      name={nft.name}
                      image={nft.image}
                      price={nft.price}
                      currency={nft.currency}
                      creator={nft.creator}
                      category={nft.category}
                      likes={nft.likes}
                      views={nft.views}
                      owner={nft.owner}
                    />
                  ))}
                </div>
                
                {sortedNFTs.length === 0 && (
                  <div className="text-center py-16 bg-gray-900 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">No NFTs Found</h3>
                    <p className="text-gray-400">
                      {searchQuery || selectedCategory !== 'all' || selectedCollection !== 'all'
                        ? 'Try adjusting your search or filter criteria'
                        : 'You don\'t own any NFTs yet. Create your first NFT!'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-900 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            © 2025 NFT Nexus. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MyAssets;
