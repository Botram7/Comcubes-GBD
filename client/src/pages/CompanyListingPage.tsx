import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Building, Upload, CreditCard, ArrowLeft, CheckCircle, Globe, Mail, Phone, Users, Clock } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { SEOHead } from '@/components/SEOHead';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { BannerAd } from '@/components/BannerAd';
import { GoogleAdSense } from '@/components/GoogleAdSense';
import { apiRequest } from '@/lib/queryClient';
import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";

// Form validation schema
const companyListingSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  websiteUrl: z.string().url('Please enter a valid website URL'),
  contactEmail: z.string().email('Please enter a valid email address'),
  sectorName: z.string().min(1, 'Please select a sector'),
  industryName: z.string().min(1, 'Please select an industry'),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  paymentAmount: z.string().min(1, 'Payment amount is required'),
});

type CompanyListingData = z.infer<typeof companyListingSchema>;

const LISTING_PRICES = {
  basic: 60, // $60 for Basic plan (quarterly billing)
  premium: 90, // $90 for Premium plan (quarterly billing)
  featured: 120, // $120 for Featured plan (quarterly billing)
};

export default function CompanyListingPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [listingId, setListingId] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof LISTING_PRICES>('basic');

  // Fetch sectors and industries for form dropdowns
  const { data: sectors } = useQuery({
    queryKey: ['/api/sectors'],
  });

  const { data: industries } = useQuery({
    queryKey: ['/api/industries?limit=500'], // Fetch all industries
  });

  // Get slot availability for selected industry
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const { data: slotAvailability } = useQuery({
    queryKey: ['/api/industries/slot-availability', selectedIndustry],
    enabled: !!selectedIndustry,
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/industries/${encodeURIComponent(selectedIndustry)}/slot-availability`);
      return response.json();
    },
  });

  const form = useForm<CompanyListingData>({
    resolver: zodResolver(companyListingSchema),
    defaultValues: {
      companyName: '',
      websiteUrl: '',
      contactEmail: '',
      sectorName: '',
      industryName: '',
      description: '',
      logoUrl: '',
      paymentAmount: LISTING_PRICES.basic.toString(),
    },
  });

  const listingMutation = useMutation({
    mutationFn: async (data: CompanyListingData) => {
      const response = await apiRequest('POST', '/api/company-listing', data);
      return response.json();
    },
    onSuccess: (result) => {
      if (result.isWaitlisted) {
        toast({
          title: "Added to Waitlist",
          description: result.message,
          variant: "default",
        });
        setStep('success');
      } else {
        setListingId(result.listingId);
        setStep('payment');
        toast({
          title: "Listing Submitted Successfully",
          description: "Now proceed with payment to activate your listing.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to Submit Listing",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async (data: { listingId: number; amount: number }) => {
      const response = await apiRequest('POST', '/api/payment/initialize', data);
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        // Redirect to Paystack payment page
        window.location.href = result.authorization_url;
      } else {
        toast({
          title: "Payment Setup Failed",
          description: "Could not initialize payment. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CompanyListingData) => {
    // Set the payment amount based on selected plan and convert to string
    data.paymentAmount = (LISTING_PRICES[selectedPlan] * 100).toString(); // Convert to cents
    listingMutation.mutate(data);
  };

  const handlePayment = () => {
    if (listingId) {
      paymentMutation.mutate({
        listingId,
        amount: LISTING_PRICES[selectedPlan] * 100, // Convert to cents for Paystack
      });
    }
  };

  // Filter industries based on selected sector
  const [selectedSector, setSelectedSector] = useState<string>('');
  const allIndustries = (industries as any)?.industries || [];
  const filteredIndustries = allIndustries.filter(
    (industry: any) => industry.sectorName === selectedSector
  );

  // Industry filtering is now working correctly

  const renderForm = () => (
    <div className="space-y-8">
      {/* Pricing Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Listing Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(LISTING_PRICES).map(([plan, price]) => (
              <div
                key={plan}
                className={`p-6 border rounded-lg cursor-pointer transition-all ${
                  selectedPlan === plan
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlan(plan as keyof typeof LISTING_PRICES)}
              >
                <div className="text-center">
                  <h3 className="font-bold capitalize text-lg mb-2">{plan}</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-4">
                    ${price}
                  </div>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {plan === 'basic' && (
                      <>
                        <li>• Standard listing</li>
                        <li>• Company logo display</li>
                        <li>• Contact information</li>
                        <li>• 12 months visibility</li>
                      </>
                    )}
                    {plan === 'premium' && (
                      <>
                        <li>• Enhanced listing</li>
                        <li>• Priority placement</li>
                        <li>• Detailed description</li>
                        <li>• 12 months visibility</li>
                        <li>• Analytics dashboard</li>
                      </>
                    )}
                    {plan === 'featured' && (
                      <>
                        <li>• Featured listing</li>
                        <li>• Top placement</li>
                        <li>• Detailed description</li>
                        <li>• 18 months visibility</li>
                        <li>• Analytics dashboard</li>
                        <li>• Premium support</li>
                      </>
                    )}
                  </ul>
                  {selectedPlan === plan && (
                    <Badge className="mt-4">Selected</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Company Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="websiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL *</FormLabel>
                      <FormControl>
                        <Input placeholder="https://yourcompany.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email *</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@yourcompany.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sectorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Sector *</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedSector(value);
                        // Reset industry when sector changes
                        form.setValue('industryName', '');
                        setSelectedIndustry('');
                      }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sector" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {((sectors as any[]) || []).map((sector: any) => (
                            <SelectItem key={sector.id} value={sector.name}>
                              {sector.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="industryName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry *</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedIndustry(value);
                      }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredIndustries.map((industry: any) => (
                            <SelectItem key={industry.id} value={industry.name}>
                              <div className="flex justify-between items-center w-full">
                                <span>{industry.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Industry Slot Availability Indicator */}
              {selectedIndustry && slotAvailability && (
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">Slot Availability for {selectedIndustry}</span>
                    </div>
                    <Badge variant={slotAvailability.available ? "default" : "destructive"}>
                      {slotAvailability.currentCount}/{slotAvailability.maxSlots} slots filled
                    </Badge>
                  </div>
                  {!slotAvailability.available && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
                      <div className="flex items-center gap-2 text-orange-800">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">Industry Full - Waitlist Available</span>
                      </div>
                      <p className="text-sm text-orange-700 mt-1">
                        This industry currently has all {slotAvailability.maxSlots} slots occupied. 
                        Your submission will be added to our waitlist and we'll contact you when a slot becomes available.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of your company and services..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourcompany.com/logo.png" {...field} />
                    </FormControl>
                    <div className="text-sm text-gray-600">
                      Optional: Link to your company logo (PNG, JPG, or SVG format)
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Total Amount</h3>
                    <p className="text-sm text-gray-600">
                      {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    ${LISTING_PRICES[selectedPlan]}
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={listingMutation.isPending}
                >
                  {listingMutation.isPending ? 'Submitting...' : 'Submit Listing & Proceed to Payment'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );

  const renderPayment = () => (
    <Card>
      <CardContent className="p-12 text-center">
        {/* Back Navigation Button */}
        <div className="flex justify-start mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setStep('form')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Edit Details
          </Button>
        </div>

        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CreditCard className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Payment</h2>
        <p className="text-gray-600 mb-8">
          Your listing has been submitted. Complete the payment to activate your listing in the COMCUBES directory.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">
              {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan
            </span>
            <span className="text-2xl font-bold text-blue-600">
              ${LISTING_PRICES[selectedPlan]}/quarter
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handlePayment}
            size="lg"
            className="w-full"
            disabled={paymentMutation.isPending}
          >
            {paymentMutation.isPending ? 'Processing...' : 'Pay with Paystack (a Stripe subsidiary)'}
          </Button>
          
          <div className="text-sm text-gray-500">
            Secure payment powered by Paystack. Supports cards, bank transfers, and mobile money.
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSuccess = () => {
    // Check if this was a waitlisted submission based on whether we have a listingId
    const isWaitlisted = !listingId;
    
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isWaitlisted ? 'bg-orange-100' : 'bg-green-100'
          }`}>
            {isWaitlisted ? (
              <Clock className="h-8 w-8 text-orange-600" />
            ) : (
              <CheckCircle className="h-8 w-8 text-green-600" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isWaitlisted ? "Added to Waitlist!" : "Payment Successful!"}
          </h2>
          <p className="text-gray-600 mb-8">
            {isWaitlisted 
              ? "Your company has been added to our waitlist. We'll contact you as soon as a slot becomes available in your selected industry."
              : "Thank you for listing your company with COMCUBES. Your listing is now under review and will be published within 2-3 business days."
            }
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => setLocation('/')}>
              Back to Home
            </Button>
            <Button variant="outline" onClick={() => setLocation('/contact')}>
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <SEOHead 
        title="List Your Company - COMCUBES Global Business Directory"
        description="Submit your company for inclusion in COMCUBES global business directory. Reach thousands of potential customers and partners worldwide with our professional listing service."
        keywords={[
          "company listing", "business registration", "submit company", "business directory listing",
          "company submission", "business promotion", "directory inclusion", "company marketing",
          "business visibility", "company advertising"
        ]}
        canonicalUrl={`${window.location.origin}/company-listing`}
      />
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation('/')}>
              <div className="w-16 h-16 mr-3 flex items-center justify-center">
                <img src={comcubesIcon} alt="COMCUBES" className="w-16 h-16" />
              </div>
              <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'IBM Plex Serif', fontWeight: 500 }}>COMCUBES</h1>
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

      {/* Breadcrumbs */}
      <Breadcrumbs 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Company Listing', href: '/company-listing' }
        ]} 
      />

      {/* Three-column layout with sidebar banner ads */}
      <div className="flex gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Left Sidebar - Banner Ad */}
        <div className="hidden lg:block flex-shrink-0">
          <GoogleAdSense 
            format="vertical"
            className="sticky top-24"
            position="listing-page-left-sidebar"
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">List Your Company</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of companies in the COMCUBES Global Business Directory. Increase your visibility and reach new customers worldwide.
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${step === 'form' ? 'text-blue-600' : step === 'payment' || step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'form' ? 'bg-blue-100 text-blue-600' : step === 'payment' || step === 'success' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium">Company Details</span>
              </div>
              <div className={`w-8 h-0.5 ${step === 'payment' || step === 'success' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${step === 'payment' ? 'text-blue-600' : step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'payment' ? 'bg-blue-100 text-blue-600' : step === 'success' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium">Payment</span>
              </div>
              <div className={`w-8 h-0.5 ${step === 'success' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'success' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  3
                </div>
                <span className="ml-2 text-sm font-medium">Complete</span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          {step === 'form' && renderForm()}
          {step === 'payment' && renderPayment()}
          {step === 'success' && renderSuccess()}
        </div>

        {/* Right Sidebar - Advertisement Banner - 160x600 */}
        <div className="hidden lg:block flex-shrink-0">
          <BannerAd 
            className="sticky top-24" 
            position="right"
          />
        </div>
      </div>
    </div>
  );
}