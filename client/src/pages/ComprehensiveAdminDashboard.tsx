import { useState } from 'react';
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
  MoreHorizontal
} from 'lucide-react';
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
import comcubesIcon from '@assets/default_1752716413946.png';

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
}

export default function ComprehensiveAdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');

  // Data queries
  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ['/api/admin/company-listings'],
  });

  const { data: waitlist, isLoading: waitlistLoading } = useQuery({
    queryKey: ['/api/admin/waitlist'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/waitlist');
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

  const { data: adminStats } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/stats');
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
  const filteredListings = listings?.filter((listing: CompanyListing) => {
    const matchesSearch = listing.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.industryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || listing.paymentStatus === statusFilter;
    const matchesIndustry = industryFilter === 'all' || listing.industryName === industryFilter;
    
    return matchesSearch && matchesStatus && matchesIndustry;
  }) || [];

  const filteredWaitlist = waitlist?.filter((entry: WaitlistEntry) => {
    return entry.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           entry.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
           entry.industryName.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

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
          <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{adminStats?.pendingListings || 0}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting review
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
                {filteredListings.map((listing) => (
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
                        <div className="text-sm text-muted-foreground">${listing.paymentAmount}</div>
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
                {filteredWaitlist.map((entry) => (
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
            <Button 
              variant="outline" 
              onClick={() => setLocation('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="listings" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Company Listings
            </TabsTrigger>
            <TabsTrigger value="waitlist" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Waitlist Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              System Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            {renderCompanyListingsTab()}
          </TabsContent>

          <TabsContent value="waitlist">
            {renderWaitlistTab()}
          </TabsContent>

          <TabsContent value="analytics">
            {renderAnalyticsTab()}
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
                    <strong>Email Service:</strong> SendGrid {import.meta.env.VITE_SENDGRID_API_KEY ? '✅' : '❌'}
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