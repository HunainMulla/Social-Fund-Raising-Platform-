import { X, Heart, Share2, MessageCircle, Clock, MapPin, User, Mail, Phone, Calendar, Check } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CampaignCreator {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinedDate: string;
}

interface CampaignDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: {
    id: string;
    title: string;
    description: string;
    longDescription: string;
    image: string;
    additionalImages: string[];
    raised: number;
    goal: number;
    daysLeft: number;
    location: string;
    category: string;
    backers: number;
    creator: CampaignCreator;
    startDate: string;
    endDate: string;
  } | null;
}

const CampaignDetailModal = ({ isOpen, onClose, campaign }: CampaignDetailModalProps) => {
  const [isCopied, setIsCopied] = useState(false);
  
  const handleShare = async () => {
    if (!campaign) return;
    
    try {
      const url = `${window.location.origin}/campaigns/${campaign.id}`;
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
          title: campaign.title,
          text: `Check out this campaign: ${campaign.title}`,
          url: url,
        });
      }
    } catch (err) {
      console.error('Failed to share:', err);
      if (!navigator.share) {
        toast.error('Web Share API not supported. Link copied to clipboard.');
      } else {
        toast.error('Failed to share campaign. Please try again.');
      }
    }
  };
  const navigate = useNavigate();
  
  if (!campaign) return null;

  const progress = (campaign.raised / campaign.goal) * 100;
  
  // Check if campaign has ended
  const isCampaignEnded = campaign.endDate ? new Date(campaign.endDate) < new Date() : false;
  const isGoalAchieved = campaign.raised >= campaign.goal;
  const isDisabled = isGoalAchieved || isCampaignEnded;
  
  const getButtonText = () => {
    if (isGoalAchieved) return "Goal Achieved";
    if (isCampaignEnded) return "Campaign Ended";
    return "Back This Project";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] overflow-hidden p-0">
        <div className="flex flex-col h-full max-h-[95vh]">
          <DialogHeader className="p-4 md:p-6 border-b flex-shrink-0">
            <DialogTitle className="flex items-center justify-between">
              <span className="text-xl md:text-2xl font-bold pr-4 line-clamp-2">{campaign.title}</span>
              {/* <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0">
                <X className="h-5 w-5" />
              </Button> */}
            </DialogTitle>
          </DialogHeader>

          <div className="flex- 1 overflow-y-auto p-4 md:p-6">
            <div className="space-y-6">
              {/* Main Image and Gallery */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <img 
                    src={campaign.image} 
                    alt={campaign.title}
                    className="w-full h-48 md:h-64 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80";
                    }}
                  />
                  {campaign.additionalImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {campaign.additionalImages.map((image, index) => (
                        <img 
                          key={index}
                          src={image} 
                          alt={`${campaign.title} - Image ${index + 2}`}
                          className="w-full h-16 md:h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Campaign Stats */}
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4 md:p-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Raised</span>
                            <span className="text-gray-600">{Math.round(progress)}% of goal</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="font-bold text-xl md:text-2xl text-green-600">${campaign.raised.toLocaleString()}</div>
                            <div className="text-xs md:text-sm text-gray-500">raised of ${campaign.goal.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="font-bold text-xl md:text-2xl text-blue-600">{campaign.backers}</div>
                            <div className="text-xs md:text-sm text-gray-500">backers</div>
                          </div>
                        </div>

                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-2" />
                          {isCampaignEnded ? "Campaign ended" : `${campaign.daysLeft} days left`}
                        </div>

                        <Button 
                          className={`w-full text-sm md:text-lg py-2 md:py-3 ${
                            isDisabled 
                              ? "bg-gray-400 cursor-not-allowed" 
                              : "bg-yellow-500 hover:bg-yellow-600"
                          }`}
                          onClick={() => {
                            if (!isDisabled) {
                              navigate(`/payment/${campaign.id}?creator=${encodeURIComponent(campaign.creator.email)}`);
                              onClose();
                            }
                          }}
                          disabled={isDisabled}
                        >
                          {getButtonText()}
                        </Button>

                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            className="flex-1 text-xs md:text-sm relative overflow-hidden"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare();
                            }}
                          >
                            <div className={`flex items-center justify-center transition-transform duration-300 ${isCopied ? 'translate-y-[-100%]' : 'translate-y-0'}`}>
                              <Share2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                              Share
                            </div>
                            <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ${isCopied ? 'translate-y-0' : 'translate-y-full'}`}>
                              <Check className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-green-600" />
                              Copied!
                            </div>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Campaign Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Description */}
                  <Card>
                    <CardContent className="p-4 md:p-6">
                      <h3 className="text-lg md:text-xl font-bold mb-4">About this campaign</h3>
                      <div className="prose prose-sm md:prose max-w-none">
                        <p className="text-gray-700 leading-relaxed text-sm md:text-base whitespace-pre-wrap break-words">
                          {campaign.longDescription}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Campaign Info */}
                  <Card>
                    <CardContent className="p-4 md:p-6">
                      <h3 className="text-lg md:text-xl font-bold mb-4">Campaign Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 mr-3 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-sm md:text-base break-words">{campaign.location}</span>
                        </div>
                        <div className="flex items-start">
                          <Calendar className="h-4 w-4 mr-3 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-sm md:text-base break-words">
                            Started {campaign.startDate} • Ends {campaign.endDate}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Badge variant="secondary" className="text-xs md:text-sm">{campaign.category}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Creator Information */}
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-4 md:p-6">
                      <h3 className="text-lg md:text-xl font-bold mb-4">Campaign Creator</h3>
                      <div className="flex items-center mb-4">
                        <img 
                          src={campaign.creator.avatar || "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80"} 
                          alt={campaign.creator.name}
                          className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover mr-4 flex-shrink-0"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80";
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-sm md:text-lg truncate">{campaign.creator.name}</h4>
                          <p className="text-xs md:text-sm text-gray-500">Joined {campaign.creator.joinedDate}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Mail className="h-4 w-4 mr-3 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-xs md:text-sm break-all">{campaign.creator.email}</span>
                        </div>
                        <div className="flex items-start">
                          <Phone className="h-4 w-4 mr-3 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-xs md:text-sm break-all">{campaign.creator.phone}</span>
                        </div>
                      </div>

                      {/* <Button variant="outline" className="w-full mt-4 text-xs md:text-sm">
                        <MessageCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        Contact Creator
                      </Button> */}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignDetailModal; 