import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { 
  ArrowLeft, 
  Eye, 
  Check, 
  X, 
  Mail, 
  ExternalLink, 
  Users, 
  Clock, 
  BarChart3, 
  FileText, 
  Settings,
  Building2,
  AlertCircle,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BannerAdManager } from '@/components/BannerAdManager';
import { AdPerformanceDashboard } from '@/components/AdPerformanceDashboard';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import comcubesIcon from '@assets/Artboard 2 copy_1753136360343.png';
import { SEOHead } from '@/components/SEOHead';

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

interface WaitlistEntry {
  id: number;
  companyName: string;
  contactEmail: string;
  industryName: string;
  sectorName: string;
  submittedAt: string;
  currentCount: number;
}

interface IndustryStats {
  industryName: string;
  waitlistCount: number;
  currentSlots: number;
}

interface AdminStats {
  totalCompanies: number;
  pendingListings: number;
  totalWaitlistEntries: number;
  industriesAtCapacity: number;
  recentSubmissions: number;
  completedPayments: number;
  pendingClaims?: number;
}

interface CompanyClaim {
  id: number;
  companyId: number;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  companyDescription: string;
  logoImagePath?: string;
  logoImageOriginalName?: string;
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  emailVerified: boolean;
  submittedAt: string;
  processedAt?: string;
  adminNotes?: string;
}

export default function ComprehensiveAdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');

  // Safe currency formatter - converts cents to dollars for display
  const formatPaymentAmount = (amount: string | number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (!isFinite(numAmount) || isNaN(numAmount)) {
      return 'N/A';
    }
    // Convert cents to dollars and format as currency
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numAmount / 100);
  };

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await apiRequest('GET', '/api/admin/stats');
      } catch (error) {
        // If we get a 401, redirect to login
        if (error instanceof Error && error.message.includes('401')) {
          window.location.href = '/admin/login';
        }
      }
    };
    checkAuth();
  }, []);

  // Data queries
  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ['/api/admin/company-listings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/company-listings');
      return response.json();
    },
  });

  const { data: waitlist, isLoading: waitlistLoading } = useQuery({
    queryKey: ['/api/admin/waitlist'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/waitlist');
      return response.json();
    },
  });

  const { data: companyClaims, isLoading: claimsLoading } = useQuery({
    queryKey: ['/api/admin/company-claims'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/company-claims');
      return response.json();
    },
  });

  // Mutations for company claims
  const approveClaimMutation = useMutation({
    mutationFn: async (claimId: number) => {
      const response = await apiRequest('POST', `/api/admin/company-claims/${claimId}/approve`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/company-claims'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Success",
        description: "Company claim approved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve claim",
        variant: "destructive",
      });
    },
  });

  const rejectClaimMutation = useMutation({
    mutationFn: async (claimId: number) => {
      const response = await apiRequest('POST', `/api/admin/company-claims/${claimId}/reject`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/company-claims'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Success",
        description: "Company claim rejected successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject claim",
        variant: "destructive",
      });
    },
  });

  const { data: adminStats } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/stats');
      return response.json();
    },
  });

  const { data: industryStats } = useQuery({
    queryKey: ['/api/admin/industry-stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/industry-stats');
      return response.json();
    },
  });

  // Mutations
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
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
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
        description: "Company listing has been rejected and removed.",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/company-listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject company listing.",
        variant: "destructive",
      });
    },
  });

  const contactWaitlistMutation = useMutation({
    mutationFn: async (waitlistId: number) => {
      const response = await apiRequest('POST', `/api/admin/waitlist/${waitlistId}/contact`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Contact Sent",
        description: "Notification email sent to waitlisted company.",
      });
    },
    onError: (error) => {
      toast({
        title: "Contact Failed",
        description: error.message || "Failed to send notification email.",
        variant: "destructive",
      });
    },
  });

  // Filter functions  
  const filteredListings = (listings || []).filter((listing: CompanyListing) => {
    const matchesSearch = listing.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.industryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || listing.paymentStatus === statusFilter;
    const matchesIndustry = industryFilter === 'all' || listing.industryName === industryFilter;
    
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  const filteredWaitlist = (waitlist || []).filter((entry: WaitlistEntry) => {
    return entry.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           entry.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
           entry.industryName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get unique industries for filter dropdown
  const uniqueIndustries = Array.from(new Set([
    ...(listings || []).map((l: CompanyListing) => l.industryName),
    ...(waitlist || []).map((w: WaitlistEntry) => w.industryName)
  ]));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      completed: 'default',
      failed: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{adminStats?.totalCompanies || 0}</div>
          <p className="text-xs text-muted-foreground">
            Active listings in directory
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{adminStats?.pendingClaims || 0}</div>
          <p className="text-xs text-muted-foreground">
            Company claims awaiting review
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Waitlist Total</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{adminStats?.totalWaitlistEntries || 0}</div>
          <p className="text-xs text-muted-foreground">
            Companies awaiting slots
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Full Industries</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{adminStats?.industriesAtCapacity || 0}</div>
          <p className="text-xs text-muted-foreground">
            At 20/20 capacity
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderCompanyListingsTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies, emails, or industries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {uniqueIndustries.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Listings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Company Listings</CardTitle>
        </CardHeader>
        <CardContent>
          {listingsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.map((listing: any) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{listing.companyName}</div>
                        <div className="text-sm text-muted-foreground">{listing.contactEmail}</div>
                        {listing.websiteUrl && (
                          <div className="text-sm">
                            <ExternalLink className="inline h-3 w-3 mr-1" />
                            <a 
                              href={listing.websiteUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{listing.industryName}</div>
                        <div className="text-sm text-muted-foreground">{listing.sectorName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {getPaymentStatusBadge(listing.paymentStatus)}
                        <div className="text-sm text-muted-foreground">{formatPaymentAmount(listing.paymentAmount)}</div>
                        {listing.paymentReference && (
                          <div className="text-xs text-muted-foreground">
                            Ref: {listing.paymentReference}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(listing.submittedAt)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{listing.companyName} - Full Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Company Name:</label>
                                  <p>{listing.companyName}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Website:</label>
                                  <p>{listing.websiteUrl || 'Not provided'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Contact Email:</label>
                                  <p>{listing.contactEmail}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Industry:</label>
                                  <p>{listing.industryName}</p>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Description:</label>
                                <p className="mt-1 text-sm text-muted-foreground">{listing.description}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {listing.paymentStatus === 'completed' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => approveMutation.mutate(listing.id)}
                              disabled={approveMutation.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => rejectMutation.mutate(listing.id)}
                              disabled={rejectMutation.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderWaitlistTab = () => (
    <div className="space-y-6">
      {/* Waitlist Search */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search waitlisted companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      {/* Industry Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {industryStats?.map((stat: IndustryStats) => (
          <Card key={stat.industryName}>
            <CardHeader>
              <CardTitle className="text-base">{stat.industryName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold text-orange-600">{stat.waitlistCount}</div>
                  <p className="text-sm text-muted-foreground">On Waitlist</p>
                </div>
                <div>
                  <div className="text-lg font-medium">{stat.currentSlots}/20</div>
                  <p className="text-sm text-muted-foreground">Current Slots</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Waitlist Table */}
      <Card>
        <CardHeader>
          <CardTitle>Waitlist Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {waitlistLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Current Slots</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWaitlist.map((entry: any) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{entry.companyName}</div>
                        <div className="text-sm text-muted-foreground">{entry.contactEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{entry.industryName}</div>
                        <div className="text-sm text-muted-foreground">{entry.sectorName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{entry.currentCount}/20</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(entry.submittedAt)}</div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => contactWaitlistMutation.mutate(entry.id)}
                        disabled={contactWaitlistMutation.isPending}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderCompanyClaimsTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search company names, contact emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Claim Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>Company Claims</CardTitle>
        </CardHeader>
        <CardContent>
          {claimsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(companyClaims || []).filter((claim: CompanyClaim) => {
                  const matchesSearch = claim.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                       claim.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                       claim.contactName.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
                  return matchesSearch && matchesStatus;
                }).map((claim: CompanyClaim) => (
                  <TableRow key={claim.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{claim.companyName}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {claim.companyId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{claim.contactName}</div>
                        <div className="text-sm text-muted-foreground">{claim.contactEmail}</div>
                        {claim.contactPhone && (
                          <div className="text-sm text-muted-foreground">{claim.contactPhone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={claim.plan === 'premium' ? 'default' : 'secondary'}>
                        {claim.plan.charAt(0).toUpperCase() + claim.plan.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        See Payment Records
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge 
                          variant={
                            claim.status === 'approved' ? 'default' :
                            claim.status === 'rejected' ? 'destructive' :
                            claim.status === 'completed' ? 'default' :
                            'secondary'
                          }
                        >
                          {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                        </Badge>
                        {claim.emailVerified && (
                          <Badge variant="outline" className="text-xs">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(claim.submittedAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Company Claim Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <strong>Company:</strong> {claim.companyName}
                                </div>
                                <div>
                                  <strong>Plan:</strong> {claim.plan}
                                </div>
                                <div>
                                  <strong>Contact:</strong> {claim.contactName}
                                </div>
                                <div>
                                  <strong>Email:</strong> {claim.contactEmail}
                                </div>
                                <div>
                                  <strong>Phone:</strong> {claim.contactPhone}
                                </div>
                                <div>
                                  <strong>Website:</strong> 
                                  <a href={claim.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                                    {claim.websiteUrl} <ExternalLink className="h-3 w-3 inline" />
                                  </a>
                                </div>
                              </div>
                              <div>
                                <strong>Description:</strong>
                                <p className="mt-1 text-sm">{claim.companyDescription}</p>
                              </div>
                              {claim.logoImagePath && (
                                <div>
                                  <strong>Logo:</strong>
                                  <img 
                                    src={claim.logoImagePath?.startsWith('uploads/') ? `/${claim.logoImagePath}` : `/uploads/${claim.logoImagePath}`} 
                                    alt="Company Logo"
                                    className="mt-2 w-20 h-20 object-cover border rounded"
                                  />
                                </div>
                              )}
                              {claim.adminNotes && (
                                <div>
                                  <strong>Admin Notes:</strong>
                                  <p className="mt-1 text-sm bg-gray-50 p-2 rounded">{claim.adminNotes}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {claim.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => approveClaimMutation.mutate(claim.id)}
                              disabled={approveClaimMutation.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectClaimMutation.mutate(claim.id)}
                              disabled={rejectClaimMutation.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!claimsLoading && (!companyClaims || companyClaims.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No company claims found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats?.recentSubmissions || 0}</div>
            <p className="text-sm text-muted-foreground">Submissions in last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adminStats?.completedPayments && adminStats?.pendingListings + adminStats?.completedPayments > 0
                ? Math.round((adminStats.completedPayments / (adminStats.pendingListings + adminStats.completedPayments)) * 100)
                : 0}%
            </div>
            <p className="text-sm text-muted-foreground">Successful payments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm">
            <strong>Total Industries:</strong> {uniqueIndustries.length}
          </div>
          <div className="text-sm">
            <strong>Industries at Capacity:</strong> {adminStats?.industriesAtCapacity || 0}
          </div>
          <div className="text-sm">
            <strong>Available Slots System-wide:</strong> {((uniqueIndustries.length * 20) - (adminStats?.totalCompanies || 0))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <SEOHead 
        title="Admin Dashboard - COMCUBES Management Portal"
        description="Comprehensive administrative dashboard for managing COMCUBES global business directory. Monitor company listings, manage waitlists, and track industry statistics."
        keywords={[
          "admin dashboard", "management portal", "directory administration", "business management",
          "company listings management", "administrative tools", "directory management",
          "business analytics", "admin panel"
        ]}
        canonicalUrl={`${window.location.origin}/admin`}
        ogType="website"
      />
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation('/')}>
              <div className="w-8 h-8 mr-3 flex items-center justify-center">
                <img src={comcubesIcon} alt="COMCUBES" className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'IBM Plex Serif', fontWeight: 500 }}>COMCUBES</h1>
              <Badge variant="secondary" className="ml-2">Admin</Badge>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setLocation('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => window.location.href = '/admin/logout'}
                className="flex items-center space-x-2"
              >
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive management of company listings, waitlist, and system analytics</p>
        </div>

        {/* Stats Cards */}
        {renderStatsCards()}

        {/* Main Content Tabs */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="listings" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Company Listings
            </TabsTrigger>
            <TabsTrigger value="claims" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Company Claims
              {(adminStats?.pendingClaims || 0) > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs px-1 py-0 h-4 w-4 rounded-full">
                  {adminStats.pendingClaims}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="waitlist" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Waitlist Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="ad-performance" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Ad Performance
            </TabsTrigger>
            <TabsTrigger value="banners" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Banner Ads
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              System Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            {renderCompanyListingsTab()}
          </TabsContent>

          <TabsContent value="claims">
            {renderCompanyClaimsTab()}
          </TabsContent>

          <TabsContent value="waitlist">
            {renderWaitlistTab()}
          </TabsContent>

          <TabsContent value="analytics">
            {renderAnalyticsTab()}
          </TabsContent>

          <TabsContent value="ad-performance">
            <AdPerformanceDashboard />
          </TabsContent>

          <TabsContent value="banners">
            <BannerAdManager />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm">
                    <strong>Max Companies per Industry:</strong> 20
                  </div>
                  <div className="text-sm">
                    <strong>Payment Provider:</strong> Paystack
                  </div>
                  <div className="text-sm">
                    <strong>Email Service:</strong> SendGrid ✅
                  </div>
                  <div className="text-sm">
                    <strong>Database:</strong> PostgreSQL ✅
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}