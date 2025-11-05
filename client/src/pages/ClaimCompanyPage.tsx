import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SearchBar } from "@/components/SearchBar";
import { BusinessGrid } from "@/components/BusinessGrid";
import { 
  Search, 
  Building2, 
  ArrowRight, 
  CheckCircle, 
  Upload,
  Globe,
  FileText,
  CreditCard,
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import { normalizeUrl } from '@/lib/urlUtils';
import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";
import paystackLogo from "@assets/Paystack Icon_1762301215124.jpg";
import paypalLogo from "@assets/Paypal Icon_1762300482205.jpg";
import { SEOHead } from "@/components/SEOHead";
import type { Sector, Industry, Company, SearchResults } from "@/lib/types";

interface ClaimFormData {
  companyId: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  companyDescription: string;
  logoImage?: File;
  plan: 'basic' | 'premium';
}

const CLAIM_PRICING = {
  basic: { 
    price: 30, 
    monthlyPrice: 30,
    annualPrice: 360, // $30 × 12 for annual billing
    name: "Basic Claim", 
    features: [
      "Company logo upload", 
      "Website link (clickable)", 
      "Company description (up to 500 words)", 
      "Contact information display",
      "Industry and sector placement"
    ] 
  },
  premium: { 
    price: 50, 
    monthlyPrice: 50,
    annualPrice: 600, // $50 × 12 for annual billing
    name: "Premium Claim", 
    features: [
      "Everything in Basic", 
      "Enhanced company description (up to 1000 words)", 
      "Priority placement within industry", 
      "Additional contact methods",
      "Enhanced SEO visibility"
    ] 
  }
};

export default function ClaimCompanyPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState<'search' | 'select' | 'form' | 'payment'>('search');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [claimId, setClaimId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'paystack'>('paystack');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [formData, setFormData] = useState<ClaimFormData>({
    companyId: '',
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    websiteUrl: '',
    companyDescription: '',
    plan: 'basic'
  });

  // URL validation state
  const [urlToCheck, setUrlToCheck] = useState<string>('');
  const [urlCheckDebounceTimer, setUrlCheckDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Fetch exchange rate when payment method changes to Paystack
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (paymentMethod === 'paystack' && claimId) {
        setIsLoadingRate(true);
        try {
          const response = await fetch('/api/currency/usd-to-ngn');
          const data = await response.json();
          if (data.rate) {
            setExchangeRate(data.rate);
          }
        } catch (error) {
          console.error('Failed to fetch exchange rate:', error);
          setExchangeRate(null);
        } finally {
          setIsLoadingRate(false);
        }
      }
    };
    
    fetchExchangeRate();
  }, [paymentMethod, claimId]);

  // Check for URL parameters and auto-populate form data
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get('companyId');
    const companyName = urlParams.get('companyName');
    const industryName = urlParams.get('industryName');
    const sectorName = urlParams.get('sectorName');
    
    // If company details are provided via URL, skip search and go directly to form
    if (companyId && companyName) {
      setFormData(prev => ({
        ...prev,
        companyId: companyId,
        companyName: companyName
      }));
      
      // Create a mock company object for selected company state
      const mockCompany: Company = {
        id: parseInt(companyId),
        name: companyName,
        industryName: industryName || '',
        websiteUrl: '',
        sectorName: sectorName || '',
        employeeCount: null,
        revenueEstimate: null,
        foundedYear: null,
        companySize: null,
        specializationTags: null,
        verificationStatus: null
      };
      
      setSelectedCompany(mockCompany);
      setStep('form'); // Skip directly to form step
      
      // Show success message about auto-population
      toast({
        title: "Company Pre-selected",
        description: `${companyName} has been automatically selected. You can edit any details below.`,
      });
    }
  }, []);

  const { data: sectors } = useQuery<Sector[]>({
    queryKey: ["/api/sectors"],
    staleTime: Infinity,
  });

  // Fetch additional company details when company is pre-selected
  const { data: companyDetails } = useQuery({
    queryKey: ["/api/companies", formData.companyId],
    enabled: !!formData.companyId && !!selectedCompany,
    staleTime: Infinity,
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

    // Set a new timer
    const timer = setTimeout(() => {
      setUrlToCheck(normalizedResult.normalizedUrl);
    }, 600); // 600ms debounce to match ListCompanyPage
    
    setUrlCheckDebounceTimer(timer);
  }, [urlCheckDebounceTimer]);

  const handleSearchResults = (results: SearchResults | null) => {
    setSearchResults(results);
    if (results) {
      setStep('select');
    }
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setFormData(prev => ({
      ...prev,
      companyId: company.id.toString(),
      companyName: company.name,
      websiteUrl: company.websiteUrl || ''
    }));
    setStep('form');
  };

  const handleSectorClick = (sector: Sector) => {
    setLocation(`/sector/${encodeURIComponent(sector.name)}`);
  };

  const claimMutation = useMutation({
    mutationFn: async (data: ClaimFormData) => {
      console.log("Data being sent to mutation:", data);
      
      const formDataToSend = new FormData();
      
      // Debug: Log each field being appended
      console.log("Appending fields:");
      console.log("companyId:", data.companyId);
      console.log("companyName:", data.companyName);
      console.log("contactName:", data.contactName);
      console.log("contactEmail:", data.contactEmail);
      console.log("plan:", data.plan);
      
      // Append all required fields, even if empty (let backend validation handle it)
      formDataToSend.append('companyId', data.companyId || '');
      formDataToSend.append('companyName', data.companyName || '');
      formDataToSend.append('contactName', data.contactName || '');
      formDataToSend.append('contactEmail', data.contactEmail || '');
      formDataToSend.append('contactPhone', data.contactPhone || '');
      formDataToSend.append('websiteUrl', data.websiteUrl || '');
      formDataToSend.append('companyDescription', data.companyDescription || '');
      formDataToSend.append('plan', data.plan || '');
      
      if (data.logoImage) {
        formDataToSend.append('logoImage', data.logoImage);
      }

      // Debug: Log FormData contents
      console.log("FormData contents:");
      for (const [key, value] of Array.from(formDataToSend.entries())) {
        console.log(key, value);
      }

      const response = await apiRequest("POST", "/api/company-claims", formDataToSend);
      return response.json();
    },
    onSuccess: (result) => {
      setClaimId(result.claimId);
      toast({
        title: "Claim Submitted Successfully",
        description: "Please complete payment to activate your company claim.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin"] });
      setStep('payment');
    },
    onError: (error) => {
      toast({
        title: "Claim Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Payment mutation for company claims
  const paymentMutation = useMutation({
    mutationFn: async (data: { claimId: number; paymentMethod: string }) => {
      const response = await apiRequest('POST', '/api/claims/payment/initialize', data);
      return response.json();
    },
    onSuccess: (result) => {
      if (result.paymentMethod === 'paypal' && result.approval_url) {
        // Redirect to PayPal payment page
        window.location.href = result.approval_url;
      } else if (result.paymentMethod === 'paystack' && result.authorization_url) {
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

  // Handle payment with annual billing calculation
  const handlePayment = () => {
    if (claimId) {
      paymentMutation.mutate({
        claimId: claimId,
        paymentMethod: paymentMethod,
      });
    }
  };

  // Domain validation helper functions
  const getExpectedDomain = (websiteUrl: string): string | null => {
    if (!websiteUrl) return null;
    try {
      const url = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`);
      let domain = url.hostname.toLowerCase();
      // Remove www. prefix if present
      if (domain.startsWith('www.')) {
        domain = domain.substring(4);
      }
      return domain;
    } catch {
      return null;
    }
  };

  const isValidBusinessEmail = (email: string, websiteUrl: string): boolean => {
    if (!email || !websiteUrl) return false;
    
    const expectedDomain = getExpectedDomain(websiteUrl);
    if (!expectedDomain) return false;
    
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (!emailDomain) return false;
    
    // Allow exact domain match or subdomains
    return emailDomain === expectedDomain || emailDomain.endsWith(`.${expectedDomain}`);
  };

  // Validation function to check if all required fields are filled
  const isFormValid = (): boolean => {
    // Check required fields
    const requiredFieldsFilled = !!(
      formData.contactName?.trim() &&
      formData.contactEmail?.trim() &&
      formData.companyDescription?.trim()
    );

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailFormatValid = emailRegex.test(formData.contactEmail);

    // Check minimum lengths
    const isContactNameValid = formData.contactName?.trim().length >= 2;
    const isDescriptionValid = (formData.companyDescription?.length || 0) >= 50;

    // If website URL is provided, validate business email against domain
    let isBusinessEmailValid = true;
    if (formData.websiteUrl?.trim()) {
      isBusinessEmailValid = isValidBusinessEmail(formData.contactEmail, formData.websiteUrl);
    }

    return requiredFieldsFilled && 
           isEmailFormatValid && 
           isContactNameValid && 
           isDescriptionValid && 
           isBusinessEmailValid;
  };

  // Get validation error message for display
  const getValidationMessage = (): string => {
    if (!formData.contactName?.trim()) return 'Full Name is required';
    if (formData.contactName?.trim().length < 2) return 'Full Name must be at least 2 characters';
    
    if (!formData.contactEmail?.trim()) return 'Business Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) return 'Please enter a valid email address';
    
    if (formData.websiteUrl?.trim() && !isValidBusinessEmail(formData.contactEmail, formData.websiteUrl)) {
      return 'Business email must match your company domain for security';
    }
    
    if (!formData.companyDescription?.trim()) return 'Company Description is required';
    if ((formData.companyDescription?.length || 0) < 50) return 'Company Description must be at least 50 characters';
    
    return '';
  };

  const handleSubmit = () => {
    // Debug log to see what data we're trying to submit
    console.log("Form data being submitted:", formData);
    console.log("Individual fields:");
    console.log("companyId:", formData.companyId);
    console.log("companyName:", formData.companyName);
    console.log("contactName:", formData.contactName);
    console.log("contactEmail:", formData.contactEmail);
    console.log("plan:", formData.plan);

    // Enforce form validation before submission
    if (!isFormValid()) {
      toast({
        title: "Validation Error",
        description: getValidationMessage(),
        variant: "destructive",
      });
      return;
    }

    // Normalize website URL before submission
    if (formData.websiteUrl?.trim()) {
      const normalizedResult = normalizeUrl(formData.websiteUrl);
      if (normalizedResult.isValid) {
        formData.websiteUrl = normalizedResult.normalizedUrl;
      }
    }

    // Validate business email domain only if website URL is provided
    if (formData.websiteUrl?.trim() && !isValidBusinessEmail(formData.contactEmail, formData.websiteUrl)) {
      const expectedDomain = getExpectedDomain(formData.websiteUrl);
      toast({
        title: "Invalid Business Email",
        description: `For security verification, your business email must use your company domain${expectedDomain ? ` (@${expectedDomain})` : ''}. This prevents unauthorized claims.`,
        variant: "destructive",
      });
      return;
    }

    claimMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Claim Your Company Listing | COMCUBES Global Business Directory"
        description="Claim and enhance your company's listing in COMCUBES directory. Add your logo, website, and detailed description to attract more customers."
        canonicalUrl="/claim-company"
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation('/')}>
              <div className="w-16 h-16 mr-3 flex items-center justify-center">
                <img src={comcubesIcon} alt="COMCUBES" className="w-16 h-16" />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Claim Your Company Listing</h1>
          <p className="text-gray-600">
            Is your company already listed in our directory? Claim your listing to add your logo, 
            website link, and detailed description to attract more customers.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl">
            {[
              { key: 'search', label: 'Find Company', icon: Search },
              { key: 'select', label: 'Select Listing', icon: Building2 },
              { key: 'form', label: 'Add Details', icon: FileText },
              { key: 'payment', label: 'Choose Plan', icon: CreditCard },
            ].map((stepInfo, index) => {
              const Icon = stepInfo.icon;
              const isActive = step === stepInfo.key;
              // Mark search and select as completed when coming from URL parameters
              const stepOrder = ['search', 'select', 'form', 'payment'];
              const currentStepIndex = stepOrder.indexOf(step);
              const stepIndex = stepOrder.indexOf(stepInfo.key);
              const isCompleted = currentStepIndex > stepIndex || (selectedCompany && ['search', 'select'].includes(stepInfo.key));
              
              return (
                <div key={stepInfo.key} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`ml-3 text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {stepInfo.label}
                  </span>
                  {index < 3 && (
                    <ArrowRight className="h-4 w-4 text-gray-400 mx-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        {step === 'search' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Your Company
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Search for your company</Label>
                <div className="mt-2">
                  <SearchBar onSearchResults={handleSearchResults} />
                </div>
              </div>

              <div className="text-center text-gray-500">
                <p className="mb-4">OR browse by business sector</p>
              </div>

              {sectors && (
                <div>
                  <Label className="text-base font-medium">Browse by Sector</Label>
                  <div className="mt-2">
                    <BusinessGrid items={sectors} type="sector" onItemClick={handleSectorClick} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 'select' && searchResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Select Your Company
              </CardTitle>
            </CardHeader>
            <CardContent>
              {searchResults.companies.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-gray-600">Found {searchResults.companies.length} companies matching your search:</p>
                  <div className="grid gap-4">
                    {searchResults.companies.map((company) => (
                      <div
                        key={company.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer"
                        onClick={() => handleCompanySelect(company)}
                      >
                        <div>
                          <h3 className="font-medium text-gray-900">{company.name}</h3>
                          <p className="text-sm text-gray-500">{company.industryName}</p>
                          {company.websiteUrl && (
                            <p className="text-sm text-blue-600">{company.websiteUrl}</p>
                          )}
                        </div>
                        <Button size="sm">
                          Claim This Listing
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                  <p className="text-gray-500 mb-4">
                    We couldn't find any companies matching your search. Try a different search term or browse by sector.
                  </p>
                  <Button onClick={() => setStep('search')} variant="outline">
                    Try Another Search
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 'form' && selectedCompany && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Enhance Your Listing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900">Selected Company: {selectedCompany.name}</h3>
                <p className="text-sm text-blue-700">Industry: {selectedCompany.industryName}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contactName">Your Full Name *</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactEmail">Business Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="your.name@company.com"
                      required
                      className={formData.websiteUrl?.trim() && formData.contactEmail && !isValidBusinessEmail(formData.contactEmail, formData.websiteUrl) ? 'border-red-500' : ''}
                    />
                    {formData.websiteUrl?.trim() && formData.contactEmail && !isValidBusinessEmail(formData.contactEmail, formData.websiteUrl) && (
                      <p className="text-red-500 text-xs mt-1">
                        For security, business email must match your company domain. 
                        {getExpectedDomain(formData.websiteUrl) && ` Expected: @${getExpectedDomain(formData.websiteUrl)}`}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.websiteUrl?.trim() 
                        ? 'Security requirement: Your email domain must match your company website domain' 
                        : 'Add your company website to verify domain matching'
                      }
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="contactPhone">Phone Number</Label>
                    <Input
                      id="contactPhone"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="websiteUrl">Company Website</Label>
                    <Input
                      id="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, websiteUrl: e.target.value }));
                        handleUrlChange(e.target.value);
                      }}
                      onBlur={(e) => {
                        // Normalize URL on blur to show final format
                        const normalizedResult = normalizeUrl(e.target.value);
                        if (e.target.value && normalizedResult.isValid) {
                          setFormData(prev => ({ ...prev, websiteUrl: normalizedResult.normalizedUrl }));
                        }
                      }}
                      placeholder="yourcompany.com or https://yourcompany.com"
                      data-testid="input-website"
                    />
                    
                    {/* URL Status Indicator */}
                    {formData.websiteUrl.trim() && (
                      <div 
                        className="flex items-center text-xs mt-1" 
                        aria-live="polite"
                        data-testid="status-website-check"
                      >
                        {(() => {
                          const currentValue = formData.websiteUrl || '';
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
                            <>
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
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyDescription">Company Description *</Label>
                    <Textarea
                      id="companyDescription"
                      value={formData.companyDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyDescription: e.target.value }))}
                      placeholder="Tell us about your company, services, and what makes you unique..."
                      className="min-h-[120px] resize-y"
                      rows={6}
                    />
                    {(() => {
                      const currentLength = formData.companyDescription?.length || 0;
                      const minLength = 50;
                      const remaining = Math.max(0, minLength - currentLength);
                      const isMinimumMet = currentLength >= minLength;
                      
                      return (
                        <div className="flex justify-between items-center text-xs mt-1">
                          <span className={isMinimumMet ? 'text-green-600' : 'text-gray-500'}>
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
                      );
                    })()}
                  </div>

                  <div>
                    <Label htmlFor="logoImage">Company Logo</Label>
                    <Input
                      id="logoImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData(prev => ({ ...prev, logoImage: file }));
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a square logo (recommended: 200x200px, max 2MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Validation Error Message */}
              {!isFormValid() && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm font-medium">
                    Please complete the following to continue:
                  </p>
                  <p className="text-red-700 text-sm mt-1">
                    {getValidationMessage()}
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button onClick={() => setStep('select')} variant="outline">
                  Back to Selection
                </Button>
                <Button 
                  onClick={() => setStep('payment')} 
                  className="flex items-center gap-2"
                  disabled={!isFormValid()}
                  data-testid="button-continue-pricing"
                >
                  Continue to Pricing
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'payment' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Choose Your Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900">Company: {formData.companyName}</h3>
                <p className="text-sm text-green-700">Ready to enhance your listing!</p>
              </div>

              <RadioGroup
                value={formData.plan}
                onValueChange={(value) => setFormData(prev => ({ ...prev, plan: value as any }))}
              >
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {Object.entries(CLAIM_PRICING).map(([key, plan]) => (
                    <div key={key} className="relative">
                      <RadioGroupItem value={key} id={key} className="sr-only" />
                      <Label
                        htmlFor={key}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.plan === key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <h3 className="font-semibold text-lg">{plan.name}</h3>
                          <p className="text-3xl font-bold text-blue-600 my-2">${plan.monthlyPrice}</p>
                          <p className="text-sm text-gray-500 mb-4">per month, billed annually (${plan.annualPrice}/year)</p>
                          <ul className="text-left space-y-2">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              {!claimId ? (
                <>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2">Ready to proceed?</h4>
                    <p className="text-sm text-yellow-800">
                      Submit your claim and proceed to secure payment with PayPal or Paystack.
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button onClick={() => setStep('form')} variant="outline">
                      Back to Details
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={claimMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      {claimMutation.isPending ? 'Submitting...' : `Submit Claim ($${CLAIM_PRICING[formData.plan].annualPrice}/year)`}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Claim Submitted Successfully!</h4>
                    <p className="text-sm text-green-800">
                      Complete your payment to activate your enhanced company listing.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-blue-900">Selected Plan:</h4>
                        <p className="text-sm text-blue-700 capitalize">
                          {formData.plan} - ${CLAIM_PRICING[formData.plan].annualPrice}/year
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-900">
                          ${CLAIM_PRICING[formData.plan].annualPrice}
                        </p>
                        <p className="text-sm text-blue-600">Annual Payment</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">Select Payment Method</Label>
                    <RadioGroup 
                      value={paymentMethod} 
                      onValueChange={(value) => setPaymentMethod(value as 'paypal' | 'paystack')}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setPaymentMethod('paystack')}>
                        <RadioGroupItem value="paystack" id="claim-paystack" data-testid="radio-claim-paystack" />
                        <img src={paystackLogo} alt="Paystack" className="h-6 w-auto object-contain" />
                        <Label htmlFor="claim-paystack" className="flex-1 cursor-pointer">
                          <div className="font-medium">Paystack</div>
                          <div className="text-sm text-gray-500">Pay securely with Paystack (a Stripe subsidiary)</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setPaymentMethod('paypal')}>
                        <RadioGroupItem value="paypal" id="claim-paypal" data-testid="radio-claim-paypal" />
                        <img src={paypalLogo} alt="PayPal" className="h-6 w-auto object-contain" />
                        <Label htmlFor="claim-paypal" className="flex-1 cursor-pointer">
                          <div className="font-medium">PayPal (Account may be required)</div>
                          <div className="text-sm text-gray-500">Alternative payment option</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Currency Conversion Notice for Paystack */}
                  {paymentMethod === 'paystack' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-amber-900 mb-1">Currency Conversion Notice</h4>
                          <p className="text-sm text-amber-800">
                            You're paying <strong>${CLAIM_PRICING[formData.plan].annualPrice} USD</strong>
                            {isLoadingRate && <span className="ml-1">(fetching exchange rate...)</span>}
                            {!isLoadingRate && exchangeRate && (
                              <span>
                                , which equals approximately <strong>₦{(CLAIM_PRICING[formData.plan].annualPrice * exchangeRate).toLocaleString('en-NG', { maximumFractionDigits: 0 })} NGN</strong> at the current exchange rate of ₦{exchangeRate.toFixed(2)}/USD.
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-amber-700 mt-2">
                            The Paystack checkout page will display the NGN amount, but rest assured you're being charged the correct equivalent of your USD payment.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Button 
                      onClick={() => setStep('form')} 
                      variant="outline"
                      disabled={paymentMutation.isPending}
                    >
                      Edit Details
                    </Button>
                    <Button 
                      onClick={handlePayment}
                      disabled={paymentMutation.isPending}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                      data-testid="button-proceed-claim-payment"
                    >
                      {paymentMutation.isPending ? 'Initializing...' : `Proceed with ${paymentMethod === 'paypal' ? 'PayPal' : 'Paystack'}`}
                    </Button>
                  </div>
                  
                  <div className="text-sm text-gray-500 text-center">
                    {paymentMethod === 'paypal' 
                      ? 'Secure payment powered by PayPal. All transactions in USD.'
                      : 'Secure payment powered by Paystack. Supports cards, bank transfers, and mobile money.'
                    }
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </main>

    </div>
  );
}