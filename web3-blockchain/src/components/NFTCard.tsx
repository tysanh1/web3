import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NFTCardProps {
  id: string;
  name: string;
  image: string;
  price: string;
  currency: string;
  creator: string;
  category: string;
  likes?: number;
  views?: number;
  owner?: string;
}

const NFTCard: React.FC<NFTCardProps> = ({
  id,
  name,
  image,
  price,
  currency,
  creator,
  category,
  likes = 0,
  views = 0
}) => {
  return (
    <div
      id={`nft-${id}`}
      className={cn(
        "bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg",
        "hover:transform hover:-translate-y-1",
        "highlight-new-nft:ring-2 highlight-new-nft:ring-green-500"
      )}
    >
      <Link to={`/nft/${id}`}>
        <div className="relative overflow-hidden">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110" 
          />
          <Badge className="absolute top-2 right-2 bg-blue-600/80 backdrop-blur-sm">
            {category}
          </Badge>
          <div className="absolute top-2 left-2">
            <Badge className="bg-gray-800/80 backdrop-blur-sm">{price} {currency}</Badge>
          </div>
        </div>
        
        <CardContent className="pt-4">
          <h3 className="font-bold text-lg mb-1 text-white">{name}</h3>
          <p className="text-sm text-gray-400 mb-2">Collection: {creator}</p>
        </CardContent>
      </Link>
      
      <CardFooter className="flex justify-between border-t border-gray-800 pt-4 pb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Heart size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400">{likes}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400">{views}</span>
          </div>
        </div>
        <Link to={`/nft/${id}`}>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-all">
            View Details
          </button>
        </Link>
      </CardFooter>
    </div>
  );
};

export default NFTCard;
