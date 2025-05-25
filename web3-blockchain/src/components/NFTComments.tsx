
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Star } from 'lucide-react';

interface Comment {
  id: string;
  user: string;
  avatar: string;
  comment: string;
  rating: number;
  date: string;
}

const mockComments: Comment[] = [
  {
    id: '1',
    user: 'CryptoCollector',
    avatar: 'https://picsum.photos/id/64/40/40',
    comment: 'Amazing artwork! The detail is incredible.',
    rating: 5,
    date: '2 hours ago'
  },
  {
    id: '2',
    user: 'NFTEnthusiast',
    avatar: 'https://picsum.photos/id/65/40/40',
    comment: 'Love the color scheme and composition.',
    rating: 4,
    date: '1 day ago'
  }
];

const NFTComments = () => {
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New comment:', { comment: newComment, rating: newRating });
    setNewComment('');
    setNewRating(5);
  };

  const renderStars = (rating: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'} ${
          interactive ? 'cursor-pointer hover:text-yellow-400' : ''
        }`}
        onClick={interactive ? () => setNewRating(i + 1) : undefined}
      />
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comments & Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-4 border border-gray-800 rounded-lg p-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Rating</label>
            <div className="flex items-center gap-1">
              {renderStars(newRating, true)}
            </div>
          </div>
          
          <Textarea
            placeholder="Share your thoughts about this NFT..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          
          <Button type="submit" className="bg-web3-gradient">
            Post Comment
          </Button>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {mockComments.map((comment) => (
            <div key={comment.id} className="flex gap-3 border border-gray-800 rounded-lg p-4">
              <Avatar>
                <AvatarImage src={comment.avatar} />
                <AvatarFallback>{comment.user[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{comment.user}</span>
                  <span className="text-sm text-gray-400">{comment.date}</span>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(comment.rating)}
                </div>
                
                <p className="text-gray-300">{comment.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NFTComments;
