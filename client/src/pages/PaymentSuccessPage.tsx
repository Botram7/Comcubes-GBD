import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, XCircle, Home, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";

export default function PaymentSuccessPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const PayerID = params.get('PayerID');

        console.log('Payment success page loaded. Token:', token, 'PayerID:', PayerID);

        if (!token) {
          setError('Missing payment information. Please contact support.');
          setVerifying(false);
          return;
        }

        const response = await fetch('/api/claims/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: token,
            paymentMethod: 'paypal'
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Payment verification failed');
        }

        const data = await response.json();
        console.log('Payment verified:', data);

        setVerified(true);
        setVerifying(false);

        toast({
          title: "Payment Successful!",
          description: "Your payment has been processed successfully.",
        });

      } catch (err) {
        console.error('Payment verification error:', err);
        setError(err instanceof Error ? err.message : 'Payment verification failed');
        setVerifying(false);

        toast({
          title: "Verification Error",
          description: "Unable to verify your payment. Please contact support.",
          variant: "destructive",
        });
      }
    };

    verifyPayment();
  }, [toast]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center">
              <img src={comcubesIcon} alt="COMCUBES" className="h-12 mr-3" />
              <span className="text-2xl font-bold text-gray-900">COMCUBES</span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <Card className="max-w-lg w-full shadow-xl">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin mb-6" />
              <p className="text-xl font-medium text-gray-900 mb-2">Verifying your payment...</p>
              <p className="text-sm text-gray-500">Please wait while we confirm your transaction.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center cursor-pointer" onClick={() => setLocation('/')}>
              <img src={comcubesIcon} alt="COMCUBES" className="h-12 mr-3" />
              <span className="text-2xl font-bold text-gray-900">COMCUBES</span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <Card className="max-w-lg w-full shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <CardTitle className="text-3xl text-gray-900">Verification Error</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <p className="text-lg text-gray-700">{error}</p>
              <p className="text-sm text-gray-500">
                Please contact our support team with your payment details.
              </p>
              <div className="flex gap-4 justify-center pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setLocation('/')}
                  className="flex items-center gap-2"
                  data-testid="button-home"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
                <Button 
                  onClick={() => setLocation('/contact')}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-contact-support"
                >
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center cursor-pointer" onClick={() => setLocation('/')}>
            <img src={comcubesIcon} alt="COMCUBES" className="h-12 mr-3" />
            <span className="text-2xl font-bold text-gray-900">COMCUBES</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="max-w-lg w-full shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl text-gray-900">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-lg text-gray-700">
              Thank you for your payment. Your transaction has been completed successfully.
            </p>
            <p className="text-sm text-gray-500">
              You will receive a confirmation email shortly with your payment details.
            </p>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mt-6">
              <p className="text-base font-medium text-blue-900 mb-2">
                ✓ Your listing will be reviewed and activated within 24-48 hours.
              </p>
              <p className="text-sm text-blue-700">
                We'll notify you once your company profile is live.
              </p>
            </div>
            <div className="flex gap-4 justify-center pt-6">
              <Button 
                variant="outline" 
                onClick={() => setLocation('/companies')}
                className="flex items-center gap-2"
                data-testid="button-browse-companies"
              >
                <Building2 className="h-4 w-4" />
                Browse Companies
              </Button>
              <Button 
                onClick={() => setLocation('/')}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                data-testid="button-home"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
