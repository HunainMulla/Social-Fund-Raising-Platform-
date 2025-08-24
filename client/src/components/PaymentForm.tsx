import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Lock, DollarSign, AlertCircle } from 'lucide-react';

interface PaymentFormProps {
  amount: string;
  message: string;
  onAmountChange: (amount: string) => void;
  onMessageChange: (message: string) => void;
  onSubmit: (paymentMethod: any) => Promise<void>;
  isProcessing: boolean;
  error: string;
  maxAmount?: number;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: true,
};

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  message,
  onAmountChange,
  onMessageChange,
  onSubmit,
  isProcessing,
  error,
  maxAmount = 0
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState<string>('');
  const [cardComplete, setCardComplete] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    // Validate amount
    if (!amount || parseFloat(amount) <= 0) {
      setCardError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) < 1) {
      setCardError('Minimum donation amount is $1');
      return;
    }

    // Create payment method
    const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (paymentMethodError) {
      setCardError(paymentMethodError.message || 'An error occurred');
      return;
    }

    // Clear any previous errors
    setCardError('');

    // Call the parent's submit handler
    await onSubmit(paymentMethod);
  };

  const handleCardChange = (event: any) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError('');
    }
    setCardComplete(event.complete);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount */}
      <div>
        <Label htmlFor="amount">Pledge Amount *</Label>
        <div className="relative mt-1">
          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="amount"
            name="amount"
            type="number"
            min="1"
            step="0.01"
            max={maxAmount > 0 ? maxAmount : undefined}
            placeholder={`Enter amount (max $${maxAmount})`}
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="pl-10"
            disabled={isProcessing}
          />
        </div>
      </div>

      {/* Card Details */}
      <div>
        <Label htmlFor="card-element">Card Details *</Label>
        <div className="mt-1 p-3 border border-gray-300 rounded-md bg-white">
          <CardElement
            id="card-element"
            options={CARD_ELEMENT_OPTIONS}
            onChange={handleCardChange}
          />
        </div>
        {cardError && (
          <p className="text-sm text-red-600 mt-1">{cardError}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <Label htmlFor="message">Message to Creator (Optional)</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Leave a message of support..."
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          className="mt-1"
          rows={3}
          disabled={isProcessing}
        />
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Security Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-sm mb-2 flex items-center">
          <Lock className="h-4 w-4 mr-2 text-green-600" />
          Secure Payment
        </h4>
        <p className="text-xs text-gray-600">
          Your payment is processed securely through Stripe. We never store your payment information.
        </p>
        <div className="mt-2 text-xs text-gray-500">
          <strong>Test Mode:</strong> Use card 4242 4242 4242 4242 for testing
        </div>
      </div>

      {/* Payment Button */}
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isProcessing || !amount || !cardComplete || !stripe}
      >
        {isProcessing ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          <div className="flex items-center">
            <Lock className="h-4 w-4 mr-2" />
            Back with ${amount || '0'}
          </div>
        )}
      </Button>
    </form>
  );
};

export default PaymentForm; 