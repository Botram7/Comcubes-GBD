import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArrowLeft, Eye, Check, X, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CompanyListing {
  id: number;
  companyName: string;
  websiteUrl: string;
  contactEmail: string;
  sectorName: string;
  industryName: string;
  description: string;
  logoUrl: string;
  paymentAmount: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentReference: string;
  submittedAt: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: listings, isLoading } = useQuery({
    queryKey: ['/api/admin/company-listings'],
  });

  const approveMutation = useMutation({
    mutationFn: async (listingId: number) => {
      const response = await apiRequest('POST', `/api/admin/company-listings/${listingId}/approve`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Company Approved",
        description: "Company has been approved and added to the directory.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/company-listings'] });
    },
    onError: (error) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve company listing.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (listingId: number) => {
      const response = await apiRequest('POST', `/api/admin/company-listings/${listingId}/reject`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Company Rejected",
        description: "Company listing has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/company-listings'] });
    },
    onError: (error) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject company listing.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Payment</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Payment Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{listings?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {listings?.filter((l: CompanyListing) => l.paymentStatus === 'pending').length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Paid Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {listings?.filter((l: CompanyListing) => l.paymentStatus === 'completed').length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Failed Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {listings?.filter((l: CompanyListing) => l.paymentStatus === 'failed').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company Listings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Company Listings</CardTitle>
          </CardHeader>
          <CardContent>
            {listings && listings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Contact Email</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing: CompanyListing) => (
                    <TableRow key={listing.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{listing.companyName}</div>
                          {listing.websiteUrl && (
                            <a
                              href={listing.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm flex items-center"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              {listing.websiteUrl}
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{listing.sectorName}</TableCell>
                      <TableCell>{listing.industryName}</TableCell>
                      <TableCell>
                        <a href={`mailto:${listing.contactEmail}`} className="text-blue-600 hover:underline">
                          {listing.contactEmail}
                        </a>
                      </TableCell>
                      <TableCell>{getStatusBadge(listing.paymentStatus)}</TableCell>
                      <TableCell>₦{parseInt(listing.paymentAmount).toLocaleString()}</TableCell>
                      <TableCell>{formatDate(listing.submittedAt)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Company Listing Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="font-medium">Company Name:</label>
                                    <p>{listing.companyName}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Website URL:</label>
                                    <p>{listing.websiteUrl || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Contact Email:</label>
                                    <p>{listing.contactEmail}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Business Sector:</label>
                                    <p>{listing.sectorName}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Industry:</label>
                                    <p>{listing.industryName}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Payment Status:</label>
                                    <p>{getStatusBadge(listing.paymentStatus)}</p>
                                  </div>
                                </div>
                                {listing.description && (
                                  <div>
                                    <label className="font-medium">Description:</label>
                                    <p className="mt-1">{listing.description}</p>
                                  </div>
                                )}
                                {listing.logoUrl && (
                                  <div>
                                    <label className="font-medium">Logo URL:</label>
                                    <p>{listing.logoUrl}</p>
                                  </div>
                                )}
                                <div>
                                  <label className="font-medium">Payment Reference:</label>
                                  <p>{listing.paymentReference || 'Not available'}</p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {listing.paymentStatus === 'completed' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => approveMutation.mutate(listing.id)}
                                disabled={approveMutation.isPending}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => rejectMutation.mutate(listing.id)}
                                disabled={rejectMutation.isPending}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No company listings found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}