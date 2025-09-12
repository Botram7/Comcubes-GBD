import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building2, Star, Globe, MapPin, CheckCircle, ChevronRight, User, ExternalLink, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { SEOHead, createBreadcrumbStructuredData } from "@/components/SEOHead";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { apiRequest } from '@/lib/queryClient';
import comcubesIcon from "@assets/Artboard 2 copy_1753136360343.png";
import { normalizeUrl } from '@/lib/urlUtils';

const companyListingSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  website: z.string()
    .min(1, 'Website is required')
    .transform((value) => {
      const result = normalizeUrl(value);
      return result.normalizedUrl;
    })
    .refine((value) => {
      const result = normalizeUrl(value);
      return result.isValid;
    }, 'Please enter a valid website URL'),
  contactPerson: z.string().min(2, 'Contact person name must be at least 2 characters'),
  businessSector: z.string().min(1, 'Please select a business sector'),
  industry: z.string().min(1, 'Please select an industry'),
  companyDescription: z.string().min(50, 'Company description must be at least 50 characters'),
  companyLogo: z.string().optional(),
  listingPlan: z.enum(['basic', 'premium'], {
    required_error: 'Please select a listing plan',
  }),
  paymentAmount: z.string().optional(),
});

type CompanyListingData = z.infer<typeof companyListingSchema>;

// Fetch sectors from API instead of hardcoded list

// Remove hardcoded industries object - we'll fetch from API

export default function ListCompanyPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [listingId, setListingId] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [isWaitlisted, setIsWaitlisted] = useState(false);
  
  // URL validation state
  const [urlToCheck, setUrlToCheck] = useState<string>('');
  const [urlCheckDebounceTimer, setUrlCheckDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Get URL parameters for smart form population
  const urlParams = new URLSearchParams(window.location.search);
  const preSelectedSector = urlParams.get('sector') || '';
  const preSelectedIndustry = urlParams.get('industry') || '';
  
  // Fetch sectors from API
  const { data: sectors } = useQuery({
    queryKey: ['/api/sectors'],
    staleTime: 300000, // 5 minutes
  });

  const form = useForm<CompanyListingData>({
    resolver: zodResolver(companyListingSchema),
    defaultValues: {
      companyName: '',
      email: '',
      phone: '',
      website: '',
      contactPerson: '',
      businessSector: preSelectedSector,
      industry: preSelectedIndustry,
      companyDescription: '',
    },
  });
  
  // URL checking functionality
  const { data: urlCheckResult, isLoading: isCheckingUrl } = useQuery({
    queryKey: ['/api/url-check', urlToCheck],
    queryFn: async ({ queryKey }) => {
      const [, url] = queryKey;
      if (!url) return null;
      const response = await fetch(`/api/url-check?u=${encodeURIComponent(url as string)}`);
      return response.json();
    },
    enabled: !!urlToCheck,
    staleTime: 300000, // 5 minutes
    retry: false
  });

  // Debounced URL handler
  const handleUrlChange = useCallback((value: string) => {
    // Clear existing timer
    if (urlCheckDebounceTimer) {
      clearTimeout(urlCheckDebounceTimer);
    }
    
    // Don't check empty values
    if (!value.trim()) {
      setUrlToCheck('');
      return;
    }

    // Normalize the URL first to check what we'll actually be validating
    const normalizedResult = normalizeUrl(value);
    if (!normalizedResult.isValid) {
      setUrlToCheck('');
      return;
    }

    // Set up new debounced check
    const timer = setTimeout(() => {
      setUrlToCheck(normalizedResult.normalizedUrl);
    }, 600); // 600ms debounce
    
    setUrlCheckDebounceTimer(timer);
  }, [urlCheckDebounceTimer]);

  // Auto-populate fields from URL parameters
  useEffect(() => {
    if (preSelectedSector) {
      form.setValue('businessSector', preSelectedSector);
      setSelectedSector(preSelectedSector);
    }
    if (preSelectedIndustry) {
      form.setValue('industry', preSelectedIndustry);
    }
    console.log('Smart autofill applied:', { preSelectedSector, preSelectedIndustry });
  }, [preSelectedSector, preSelectedIndustry, form]);

  const listingMutation = useMutation({
    mutationFn: async (data: CompanyListingData) => {
      const response = await apiRequest('POST', '/api/company-listing', data);
      return response.json();
    },
    onSuccess: (result) => {
      if (result.isWaitlisted) {
        setIsWaitlisted(true);
        toast({
          title: "Added to Waitlist",
          description: result.message,
          variant: "default",
        });
        setStep('success');
      } else {
        setIsWaitlisted(false);
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
        title: "Failed to Submit Application",
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
      if (result.authorization_url) {
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
    // Map form data to backend schema
    const submissionData = {
      companyName: data.companyName,
      websiteUrl: data.website,
      contactEmail: data.email,
      sectorName: data.businessSector,
      industryName: data.industry,
      description: data.companyDescription,
      logoUrl: data.companyLogo || '',
      contactPerson: data.contactPerson,
      phone: data.phone,
      listingPlan: selectedPlan!,
      paymentAmount: selectedPlan === 'basic' ? '10' : '20',
    };
    listingMutation.mutate(submissionData);
  };

  const handlePayment = () => {
    if (listingId && selectedPlan) {
      const amount = selectedPlan === 'basic' ? 10 : 20;
      paymentMutation.mutate({
        listingId,
        amount,
      });
    }
  };

  const watchedSector = form.watch('businessSector');
  
  // Fetch industries when sector is selected
  const { data: industriesData } = useQuery({
    queryKey: [`/api/sectors/${watchedSector}/industries`],
    enabled: !!watchedSector,
    staleTime: 300000, // 5 minutes
  });
  
  const availableIndustries = industriesData || [];
  
  // Reset industry when sector changes (but not during initial URL parameter population)
  useEffect(() => {
    if (watchedSector && !preSelectedSector && !preSelectedIndustry) {
      form.setValue('industry', ''); // Reset industry selection only if not from URL params
    }
  }, [watchedSector, form, preSelectedSector, preSelectedIndustry]);

  // Payment step component
  const renderPayment = () => (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation('/')}>
              <div className="w-8 h-8 mr-3 flex items-center justify-center">
                <img src={comcubesIcon} alt="COMCUBES" className="w-8 h-8" />
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

      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Payment</h2>
            <p className="text-gray-600 mb-8">
              Your listing has been submitted. Complete the payment to activate your listing in the COMCUBES directory.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">
                  {selectedPlan === 'basic' ? 'Basic' : 'Premium'} Plan
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  ${selectedPlan === 'basic' ? '0.10' : '0.20'}/month
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
                {paymentMutation.isPending ? 'Processing...' : 'Pay with Paystack'}
              </Button>
              
              <div className="text-sm text-gray-500">
                Secure payment powered by Paystack. Supports cards, bank transfers, and mobile money.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Success step component  
  const renderSuccess = () => (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation('/')}>
              <div className="w-8 h-8 mr-3 flex items-center justify-center">
                <img src={comcubesIcon} alt="COMCUBES" className="w-8 h-8" />
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

      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {isWaitlisted ? 'Added to Waitlist!' : 'Application Submitted Successfully!'}
            </h2>
            <p className="text-gray-600 mb-8">
              {isWaitlisted 
                ? 'Thank you for your interest in COMCUBES! All slots for this industry are currently occupied. You have been added to our waitlist and we will contact you as soon as a slot becomes available.'
                : 'Thank you for choosing COMCUBES for your business listing. Our team will review your application and contact you within 48 hours with next steps and payment information.'
              }
            </p>
            <Button onClick={() => setLocation('/')} size="lg">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Render based on current step
  if (step === 'payment') {
    return renderPayment();
  }
  
  if (step === 'success') {
    return renderSuccess();
  }

  // Default form step
  if (false) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation('/')}>
                <div className="w-8 h-8 mr-3 flex items-center justify-center">
                  <img src={comcubesIcon} alt="COMCUBES" className="w-8 h-8" />
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {isWaitlisted ? 'Added to Waitlist!' : 'Application Submitted Successfully!'}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {isWaitlisted 
                ? 'Thank you for your interest in COMCUBES! All slots for this industry are currently occupied. You have been added to our waitlist and we will contact you as soon as a slot becomes available.'
                : 'Thank you for choosing COMCUBES for your business listing. Our team will review your application and contact you within 48 hours with next steps and payment information.'
              }
            </p>
            <Button onClick={() => setLocation('/')} size="lg">
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="List Your Company - Join COMCUBES Global Business Directory"
        description="List your company in COMCUBES Global Business Directory. Choose from Basic or Premium plans to increase your business visibility worldwide."
        keywords={[
          "list company", "business directory", "company listing", "business visibility",
          "global directory", "business registration", "company profile", "business promotion"
        ]}
        canonicalUrl={`${window.location.origin}/list-company`}
        structuredData={createBreadcrumbStructuredData([
          { name: "Home", url: `${window.location.origin}/` },
          { name: "List Your Company", url: `${window.location.origin}/list-company` }
        ])}
      />
      
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation('/')}>
              <div className="w-8 h-8 mr-3 flex items-center justify-center">
                <img src={comcubesIcon} alt="COMCUBES" className="w-8 h-8" />
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

      <Breadcrumbs 
        items={[
          { label: 'Home', href: '/' },
          { label: 'List Your Company', href: '/list-company' }
        ]} 
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">List Your Company</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of companies in the COMCUBES Global Business Directory. 
            Increase your visibility and reach new customers worldwide.
          </p>
        </div>

        {/* Pricing Plans */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            Choose Your Listing Plan
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basic Plan */}
            <Card className={`relative overflow-hidden transition-all duration-300 cursor-pointer ${
              selectedPlan === 'basic' ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
            }`} onClick={() => {
              setSelectedPlan('basic');
              form.setValue('listingPlan', 'basic');
            }}>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl mb-2">Basic</CardTitle>
                <div className="text-3xl font-bold text-gray-900">$0.10<span className="text-lg text-gray-600">/month</span></div>
                <div className="text-sm text-gray-600">Billed quarterly ($0.30)</div>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                    Standard listing in business directory
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                    Company name, logo & contact info
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                    Company website link
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                    Searchable in directory
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                    Direct link to your website
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                    Industry & sector categorization
                  </li>
                </ul>
                {selectedPlan === 'basic' && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">✓ Plan Selected</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className={`relative overflow-hidden transition-all duration-300 cursor-pointer ${
              selectedPlan === 'premium' ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
            }`} onClick={() => {
              setSelectedPlan('premium');
              form.setValue('listingPlan', 'premium');
            }}>
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-xs font-semibold">
                RECOMMENDED
              </div>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl mb-2">Premium</CardTitle>
                <div className="text-3xl font-bold text-gray-900">$0.20<span className="text-lg text-gray-600">/month</span></div>
                <div className="text-sm text-gray-600">Billed quarterly ($0.60)</div>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  <li className="flex items-center text-sm">
                    <Star className="h-4 w-4 text-gold-600 mr-3 flex-shrink-0" />
                    <strong>Everything in Basic, plus:</strong>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                    <strong>Dedicated company profile page</strong>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                    Detailed company description & information
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                    Enhanced search visibility
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                    Professional company rating display
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                    Related companies section
                  </li>
                </ul>
                {selectedPlan === 'premium' && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">✓ Plan Selected</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-start">
                <User className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="font-semibold text-blue-900 mb-1">Premium Plan Advantage:</h4>
                  <p className="text-sm text-blue-800">
                    When users click on your company card, they'll first visit your detailed profile page on COMCUBES, 
                    where they can learn more about your business before visiting your website. Basic plan companies 
                    link directly to external websites.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedPlan && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Company Information Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Company Information
                  </CardTitle>
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
                          name="contactPerson"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Person *</FormLabel>
                              <FormControl>
                                <Input placeholder="Primary contact name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Email *</FormLabel>
                              <FormControl>
                                <Input placeholder="business@company.com" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number *</FormLabel>
                              <FormControl>
                                <Input placeholder="Business phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => {
                          const currentValue = field.value || '';
                          const normalizedResult = normalizeUrl(currentValue);
                          
                          // Get URL check status
                          const getUrlStatus = () => {
                            if (!currentValue.trim()) return null;
                            if (!normalizedResult.isValid) return 'invalid';
                            if (isCheckingUrl) return 'checking';
                            if (urlCheckResult === null) return null;
                            return urlCheckResult?.ok ? 'valid' : 'unreachable';
                          };

                          const urlStatus = getUrlStatus();

                          return (
                            <FormItem>
                              <FormLabel>Company Website *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="yourcompany.com or https://yourcompany.com" 
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleUrlChange(e.target.value);
                                  }}
                                  onBlur={(e) => {
                                    field.onBlur();
                                    // Normalize URL on blur to show final format
                                    if (e.target.value && normalizedResult.isValid) {
                                      field.onChange(normalizedResult.normalizedUrl);
                                    }
                                  }}
                                  data-testid="input-website"
                                />
                              </FormControl>
                              
                              {/* URL Status Indicator */}
                              {currentValue.trim() && (
                                <div 
                                  className="flex items-center text-xs mt-1" 
                                  aria-live="polite"
                                  data-testid="status-website-check"
                                >
                                  {urlStatus === 'checking' && (
                                    <span className="text-blue-600 flex items-center">
                                      <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-1"></div>
                                      Checking website...
                                    </span>
                                  )}
                                  
                                  {urlStatus === 'valid' && (
                                    <span className="text-green-600 flex items-center">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Website looks good!
                                      {urlCheckResult?.finalUrl && urlCheckResult.finalUrl !== currentValue && (
                                        <span className="ml-1 text-gray-500">
                                          → {urlCheckResult.finalUrl}
                                        </span>
                                      )}
                                    </span>
                                  )}
                                  
                                  {urlStatus === 'unreachable' && (
                                    <span className="text-amber-600 flex items-center">
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      We couldn't confirm this website is reachable. You can still submit your listing.
                                      {urlCheckResult?.reason && (
                                        <span className="ml-1 text-gray-500 text-xs">
                                          ({urlCheckResult.reason})
                                        </span>
                                      )}
                                    </span>
                                  )}
                                  
                                  {urlStatus === 'invalid' && normalizedResult.error && (
                                    <span className="text-red-500 flex items-center">
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      {normalizedResult.error}
                                    </span>
                                  )}
                                  
                                  {normalizedResult.isValid && normalizedResult.normalizedUrl !== currentValue && urlStatus !== 'checking' && (
                                    <span className="text-gray-500 ml-auto">
                                      Will be saved as: {normalizedResult.normalizedUrl}
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        control={form.control}
                        name="companyLogo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Logo (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    // In a real implementation, you would upload the file
                                    // For now, we'll just store the filename
                                    field.onChange(file.name);
                                  }
                                }}
                              />
                            </FormControl>
                            <p className="text-xs text-gray-500">Upload your company logo (PNG, JPG, GIF - Max 2MB)</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="businessSector"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Sector *</FormLabel>
                              <Select onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedSector(value);
                                // Only reset industry if not from URL parameters
                                if (!preSelectedSector || !preSelectedIndustry) {
                                  form.setValue('industry', '');
                                }
                              }} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select sector" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {(sectors || []).map((sector: any) => (
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
                          name="industry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Industry *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={!watchedSector ? "First select a business sector" : "Select industry"} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {availableIndustries.map((industry: any) => (
                                    <SelectItem key={industry.id || industry.name} value={industry.name}>
                                      {industry.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="companyDescription"
                        render={({ field }) => {
                          const currentLength = field.value?.length || 0;
                          const minLength = 50;
                          const remaining = Math.max(0, minLength - currentLength);
                          const isMinimumMet = currentLength >= minLength;
                          
                          return (
                            <FormItem>
                              <FormLabel>Company Description *</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us about your company, services, and what makes you unique..."
                                  className="min-h-[120px] resize-y"
                                  {...field}
                                />
                              </FormControl>
                              <div className="flex justify-between items-center text-xs mt-1">
                                <span className={`${isMinimumMet ? 'text-green-600' : 'text-gray-500'}`}>
                                  {currentLength} characters
                                  {!isMinimumMet && remaining > 0 && (
                                    <span className="text-orange-600 ml-1">
                                      ({remaining} more needed)
                                    </span>
                                  )}
                                  {isMinimumMet && (
                                    <span className="text-green-600 ml-1">
                                      ✓ Minimum reached
                                    </span>
                                  )}
                                </span>
                                <span className="text-gray-400">
                                  Minimum: {minLength} characters
                                </span>
                              </div>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <div className="bg-gray-50 border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">Selected Plan:</h4>
                            <p className="text-sm text-gray-600 capitalize">
                              {selectedPlan} - ${selectedPlan === 'basic' ? '0.10' : '0.20'}/month (${selectedPlan === 'basic' ? '0.30' : '0.60'} quarterly)
                            </p>
                          </div>
                          <Badge variant={selectedPlan === 'premium' ? 'default' : 'secondary'}>
                            {selectedPlan?.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={listingMutation.isPending}
                      >
                        {listingMutation.isPending ? 'Submitting...' : 'Submit Listing Request'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Benefits Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-blue-600" />
                    Why List With COMCUBES?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">Global Reach</p>
                      <p className="text-sm text-gray-600">Worldwide business directory visibility</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">Targeted Traffic</p>
                      <p className="text-sm text-gray-600">Business professionals seeking services</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">Easy Management</p>
                      <p className="text-sm text-gray-600">Simple listing process and updates</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">Search Optimization</p>
                      <p className="text-sm text-gray-600">Enhanced discoverability in search</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Questions?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">Need help choosing the right plan?</p>
                  <p className="font-medium text-gray-900 mb-1">Contact us:</p>
                  <p className="text-sm text-gray-600">admin@comcubes.com</p>
                  <p className="text-xs text-gray-500 mt-2">Response time: 24-48 hours</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {!selectedPlan && (
          <div className="text-center py-8">
            <p className="text-gray-600">Please select a listing plan above to continue with your application.</p>
          </div>
        )}
      </div>
      
    </div>
  );
}