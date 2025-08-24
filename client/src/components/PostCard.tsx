import { Heart, MessageCircle, MoreHorizontal, CheckCircle } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    handle: string;
    verified: boolean;
  };
  content: string;
  image?: string;
  campaign?: {
    name: string;
    category: string;
  };
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

interface PostCardProps {
  post: Post;
  onLike: () => void;
}

const PostCard = ({ post, onLike }: PostCardProps) => {
  return (
    <Card className="bg-white hover:bg-gray-50 transition-colors duration-200">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          {/* Author Avatar */}
          <div className="flex-shrink-0">
            <img 
              src={post.author.avatar} 
              alt={post.author.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>

          {/* Post Content */}
          <div className="flex-1 min-w-0">
            {/* Author Info */}
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-gray-900 text-sm">{post.author.name}</span>
                {post.author.verified && (
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <span className="text-gray-500 text-sm">{post.author.handle}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500 text-sm">{post.timestamp}</span>
              <Button variant="ghost" size="sm" className="ml-auto p-1 h-6 w-6">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Campaign Badge */}
            {post.campaign && (
              <div className="mb-2">
                <Badge variant="secondary" className="text-xs">
                  {post.campaign.category}
                </Badge>
                <span className="text-xs text-gray-600 ml-2">{post.campaign.name}</span>
              </div>
            )}

            {/* Post Content */}
            <div className="mb-3">
              <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* Post Image */}
            {post.image && (
              <div className="mb-3">
                <img 
                  src={post.image} 
                  alt="Post content"
                  className="w-full rounded-lg object-cover max-h-96"
                />
              </div>
            )}

            {/* Engagement Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-6">
                {/* Comments */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">{post.comments}</span>
                </Button>

                {/* Likes */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onLike}
                  className={`flex items-center space-x-2 hover:bg-red-50 ${
                    post.isLiked 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{post.likes}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard; 