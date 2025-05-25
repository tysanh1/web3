
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import NFTCard from '@/components/NFTCard';
import CategoryFilter from '@/components/CategoryFilter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

// Mock data for NFTs
const mockNFTs = [
  {
    id: '1',
    name: 'Cosmic Dreamer #1',
    image: 'https://picsum.photos/id/123/800/800',
    price: '0.5',
    currency: 'ETH',
    creator: 'CryptoPunks',
    category: 'art',
    collection: 'CryptoPunks',
    description: 'A journey through the cosmic dreamscape of the digital universe.',
    views: 1500,
    likes: 120
  },
  {
    id: '2',
    name: 'Neon Ape #42',
    image: 'https://picsum.photos/id/124/800/800',
    price: '2.5',
    currency: 'ETH',
    creator: 'Bored Ape Yacht Club',
    category: 'collectibles',
    collection: 'Bored Ape Yacht Club',
    description: 'A unique neon-themed ape from the famous collection.',
    views: 4200,
    likes: 350
  },
  {
    id: '3',
    name: 'Digital Soundscape #7',
    image: 'https://picsum.photos/id/125/800/800',
    price: '0.3',
    currency: 'ETH',
    creator: 'Art Blocks',
    category: 'music',
    collection: 'Art Blocks',
    description: 'An audio-visual experience encoded as an NFT.',
    views: 1200,
    likes: 89
  },
  {
    id: '4',
    name: 'Pixel Cat #103',
    image: 'https://picsum.photos/id/126/800/800',
    price: '0.8',
    currency: 'ETH',
    creator: 'Cool Cats',
    category: 'collectibles',
    collection: 'Cool Cats',
    description: 'A cute pixelated cat with unique traits.',
    views: 2700,
    likes: 210
  },
  {
    id: '5',
    name: 'Ethereal Landscape #5',
    image: 'https://picsum.photos/id/127/800/800',
    price: '1.2',
    currency: 'ETH',
    creator: 'ModernArtist',
    category: 'art',
    collection: 'Digital Landscapes',
    description: 'A breathtaking view of an otherworldly landscape.',
    views: 3100,
    likes: 175
  },
  {
    id: '6',
    name: 'Metaverse Apartment',
    image: 'https://picsum.photos/id/128/800/800',
    price: '1.5',
    currency: 'ETH',
    creator: 'VirtualArchitect',
    category: 'virtual-worlds',
    collection: 'Metaverse Properties',
    description: 'Prime real estate in the hottest virtual world.',
    views: 1800,
    likes: 95
  }
];

// Mock data for categories and collections
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

const Marketplace = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('latest');
  const [priceRange, setPriceRange] = useState([0, 5]);

  // Filter NFTs based on category, collection, search query, and price range
  const filteredNFTs = mockNFTs.filter(nft => {
    const matchesCategory = selectedCategory === 'all' || nft.category === selectedCategory;
    const matchesCollection = selectedCollection === 'all' || nft.collection.toLowerCase() === selectedCollection;
    const matchesSearch = nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          nft.creator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriceRange = parseFloat(nft.price) >= priceRange[0] && parseFloat(nft.price) <= priceRange[1];
    
    return matchesCategory && matchesCollection && matchesSearch && matchesPriceRange;
  });

  // Sort NFTs based on selected option
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
    // Default to 'latest' (using ID as proxy for date)
    return parseInt(b.id) - parseInt(a.id);
  });

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">NFT Marketplace</h1>
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
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedCollection('all');
                  setPriceRange([0, 5]);
                  setSortOption('latest');
                  setSearchQuery('');
                }}
                variant="outline"
                className="w-full"
              >
                Reset Filters
              </Button>
              <Button className="w-full mt-2 bg-blue-600 hover:bg-blue-700">
                Apply Filters
              </Button>
            </div>
          </div>
          
          {/* NFT Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedNFTs.map((nft) => (
                <NFTCard
                  key={nft.id}
                  id={nft.id}
                  name={nft.name}
                  image={nft.image}
                  price={nft.price}
                  currency={nft.currency}
                  creator={nft.collection}
                  category={nft.category}
                  likes={nft.likes}
                  views={nft.views}
                />
              ))}
            </div>
            
            {sortedNFTs.length === 0 && (
              <div className="text-center py-16 bg-gray-900 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">No NFTs Found</h3>
                <p className="text-gray-400">
                  Try adjusting your search or filter criteria
                </p>
              </div>
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

export default Marketplace;
