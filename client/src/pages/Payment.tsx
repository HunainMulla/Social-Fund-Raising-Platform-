import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { 
  CreditCard, 
  CheckCircle, 
  ArrowLeft,
  Heart,
  Calendar,
  Users,
  AlertCircle
} from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '../components/PaymentForm';
import { API_BASE_URL } from "../lib/api";

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51Qki3JCTFACjR68uzZq4NRHk8iFMm0OHTmm2qG68n22Rw89QmPNa2tPuThN96AQpLO7puzEGuqJo5xVkGKVeaIL3008HZ3EOjv');

interface Campaign {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  goal: number;
  raised: number;
  daysLeft: number;
  backers: number;
  creator: {
    name: string;
    email: string;
    avatar: string;
  };
}

const PaymentPage = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [searchParams] = useSearchParams();
  const creatorEmail = searchParams.get('creator');
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));

    // Validate required parameters
    if (!campaignId || !creatorEmail) {
      setError("Missing campaign information. Please go back and try again.");
      return;
    }

    // Fetch campaign data
    fetchCampaignData();
  }, [campaignId, creatorEmail, navigate]);

  const fetchCampaignData = async () => {
    try {
      console.log('Fetching campaign data:', { campaignId, creatorEmail });
      
      const response = await fetch(`${API_BASE_URL}/payments/campaign/${campaignId}/${creatorEmail}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Failed to fetch campaign data: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Campaign data received:', data);
      setCampaign(data);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      setError(`Failed to load campaign data: ${error.message}. Please try again.`);
    }
  };

  const createPaymentIntent = async (amount: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: amount,
          campaignId: campaignId,
          creatorEmail: creatorEmail
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  };

  const confirmPayment = async (paymentIntentId: string, amount: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntentId,
          campaignId: campaignId,
          creatorEmail: creatorEmail,
          amount: amount,
          message: message
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to confirm payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  };

  const handlePaymentSubmit = async (paymentMethod: any) => {
    setIsPaymentProcessing(true);
    setError("");

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const donationAmount = parseFloat(amount);

      // Create payment intent
      const { clientSecret, paymentIntentId } = await createPaymentIntent(donationAmount);

      // Confirm the payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirm payment on backend and update campaign
        const result = await confirmPayment(paymentIntentId, donationAmount);
        
        setPaymentSuccess(true);
        
        // Update campaign state with new amount
        if (campaign) {
          setCampaign(prev => prev ? {
            ...prev,
            raised: result.updatedAmount
          } : null);
        }

        // Show success message for 3 seconds then redirect
        setTimeout(() => {
          navigate(`/campaigns`);
        }, 3000);
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (error && !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for backing "{campaign.title}". Your contribution of ${amount} has been processed successfully.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to campaigns page...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercentage = (campaign.raised / campaign.goal) * 100;
  const maxAmount = campaign ? Math.max(0, campaign.goal - campaign.raised) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            onClick={handleBack}
            variant="outline" 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaign
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Back this project</h1>
          <p className="text-gray-600 mt-2">
            Support {campaign.creator.name}'s campaign with a secure payment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Campaign Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <img 
                    src={campaign.image} 
                    alt={campaign.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{campaign.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {campaign.description}
                    </p>
                    <Badge variant="secondary">{campaign.category}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  Campaign Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Raised</span>
                      <span className="font-medium">${campaign.raised.toLocaleString()} of ${campaign.goal.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-center text-sm text-gray-500 mt-2">
                      {progressPercentage.toFixed(1)}% funded
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-2xl font-bold text-gray-900">{campaign.backers}</span>
                      </div>
                      <p className="text-sm text-gray-600">Backers</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-2xl font-bold text-gray-900">{campaign.daysLeft}</span>
                      </div>
                      <p className="text-sm text-gray-600">Days left</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Creator Info */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Creator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <img 
                    src={campaign.creator.avatar} 
                    alt={campaign.creator.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium">{campaign.creator.name}</h4>
                    <p className="text-sm text-gray-600">{campaign.creator.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Back this project
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise}>
                  <PaymentForm
                    amount={amount}
                    message={message}
                    onAmountChange={(val) => {
                      // Prevent entering more than maxAmount
                      if (parseFloat(val) > maxAmount) {
                        setAmount(maxAmount.toString());
                      } else {
                        setAmount(val);
                      }
                    }}
                    onMessageChange={setMessage}
                    onSubmit={handlePaymentSubmit}
                    isProcessing={isPaymentProcessing}
                    error={error}
                    maxAmount={maxAmount}
                  />
                </Elements>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage; 