import { Heart, Share2, MessageCircle, Clock, MapPin, Check } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface CampaignCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  raised: number;
  goal: number;
  daysLeft: number;
  location: string;
  category: string;
  backers: number;
  creator?: {
    email: string;
  };
  onClick?: () => void;
  endDate?: string;
}

const CampaignCard = ({ 
  id,
  title, 
  description, 
  image, 
  raised, 
  goal, 
  daysLeft, 
  location, 
  category, 
  backers,
  creator,
  onClick,
  endDate
}: CampaignCardProps) => {
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);
  const progress = (raised / goal) * 100;
  
  const isCampaignEnded = endDate ? new Date(endDate) < new Date() : false;
  const isGoalAchieved = raised >= goal;
  const isDisabled = isGoalAchieved || isCampaignEnded;
  
  const getButtonText = () => {
    if (isGoalAchieved) return "Goal Achieved";
    if (isCampaignEnded) return "Campaign Ended";
    return "Back This Project";
  };
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer" onClick={onClick}>
      <div className="relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80";
          }}
        />
        <Badge className="absolute top-3 left-3 bg-white/90 text-gray-700 hover:bg-white">
          {category}
        </Badge>
        {isCampaignEnded && (
          <Badge className="absolute top-3 right-3 bg-red-500 text-white">
            Ended
          </Badge>
        )}
      </div>
      
      <CardContent className="p-5">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="h-3 w-3 mr-1" />
          {location}
        </div>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {description}
        </p>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Raised</span>
              <span className="text-gray-600">{Math.round(progress)}% of goal</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold text-lg">${raised.toLocaleString()}</div>
              <div className="text-sm text-gray-500">of ${goal.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                {isCampaignEnded ? "Campaign ended" : `${daysLeft} days left`}
              </div>
              <div className="text-sm text-gray-500">{backers} backers</div>
            </div>
          </div>
          
          <div className="flex space-x-2 pt-2">
            <Button 
              className={`flex-1 ${
                isDisabled 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-yellow-500 hover:bg-yellow-600"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isDisabled && creator?.email) {
                  navigate(`/payment/${id}?creator=${encodeURIComponent(creator.email)}`);
                } else if (!isDisabled) {
                  alert('Creator information not available');
                }
              }}
              disabled={isDisabled}
            >
              {getButtonText()}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const url = `${window.location.origin}/campaigns/${id}`;
                  await navigator.clipboard.writeText(url);
                  setIsCopied(true);
                  toast.success('Campaign link copied to clipboard!');
                  
                  // Reset the copied state after 2 seconds
                  setTimeout(() => {
                    setIsCopied(false);
                  }, 2000);
                  
                  // Try to use the Web Share API if available
                  if (navigator.share) {
                    await navigator.share({
                      title: title,
                      text: `Check out this campaign: ${title}`,
                      url: url,
                    });
                  }
                } catch (err) {
                  console.error('Failed to share:', err);
                  toast.error('Failed to share campaign. Please try again.');
                }
              }}
              className="relative overflow-hidden"
            >
              <div className={`flex items-center transition-transform duration-300 ${isCopied ? 'translate-y-[-100%]' : 'translate-y-0'}`}>
                <Share2 className="h-4 w-4" />
              </div>
              <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ${isCopied ? 'translate-y-0' : 'translate-y-full'}`}>
                <Check className="h-4 w-4 text-green-600" />
              </div>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignCard;
