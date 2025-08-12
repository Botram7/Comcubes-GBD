import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CreditCard, Clock, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface PendingListing {
  id: number;
  companyName: string;
  websiteUrl: string;
  contactEmail: string;
  sectorName: string;
  industryName: string;
  description: string;
  paymentAmount: string;
  paymentStatus: string;
  submittedAt: string;
}

export default function ResumePaymentPage() {
  const [email, setEmail] = useState('');
  const [searchEmail, setSearchEmail] = useState('');

  const { data: pendingListings, isLoading } = useQuery({
    queryKey: ['/api/resume-payment', searchEmail],
    enabled: !!searchEmail,
  });

  const initializePaymentMutation = useMutation({
    mutationFn: async ({ listingId, amount }: { listingId: number; amount: number }) => {
      const response = await apiRequest('POST', '/api/payment/initialize', { listingId, amount });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.authorization_url) {
        window.open(data.authorization_url, '_blank');
      }
    },
  });

  const handleSearch = () => {
    if (email.trim()) {
      setSearchEmail(encodeURIComponent(email.trim()));
    }
  };

  const handlePayment = (listing: PendingListing) => {
    initializePaymentMutation.mutate({
      listingId: listing.id,
      amount: parseFloat(listing.paymentAmount)
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Your Payment</h1>
          <p className="text-gray-600">Complete your pending company listing payments</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Find Your Pending Payments
            </CardTitle>
            <CardDescription>
              Enter the email address you used when submitting your company listing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={!email.trim() || isLoading}>
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {pendingListings && (
          <div className="space-y-6">
            {pendingListings.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  No pending payments found for this email address. All your submissions are either completed or you may have used a different email.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-900">
                  Pending Payments ({pendingListings.length})
                </h2>
                <div className="grid gap-6">
                  {pendingListings.map((listing: PendingListing) => (
                    <Card key={listing.id} className="border-orange-200">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{listing.companyName}</CardTitle>
                            <CardDescription className="mt-1">
                              {listing.sectorName} → {listing.industryName}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Pending Payment
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Website:</span>
                            <p className="text-gray-600">{listing.websiteUrl}</p>
                          </div>
                          <div>
                            <span className="font-medium">Submitted:</span>
                            <p className="text-gray-600">
                              {new Date(listing.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {listing.description && (
                          <div>
                            <span className="font-medium">Description:</span>
                            <p className="text-gray-600 text-sm mt-1">{listing.description}</p>
                          </div>
                        )}

                        <Alert className="border-orange-200 bg-orange-50">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Payment of ₦{listing.paymentAmount} is required to complete your listing submission.
                            Your spot is reserved but will expire if payment is not completed soon.
                          </AlertDescription>
                        </Alert>

                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="text-lg font-bold text-green-600">
                            ₦{listing.paymentAmount}
                          </div>
                          <Button 
                            onClick={() => handlePayment(listing)}
                            disabled={initializePaymentMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {initializePaymentMutation.isPending ? 'Processing...' : 'Complete Payment'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}