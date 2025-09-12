import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  ArrowLeft
} from "lucide-react";
import comcubesIcon from "@assets/Artboard 2 copy_1753136360343.png";
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
    name: "Premium Claim", 
    features: [
      "Everything in Basic", 
      "Enhanced company description (up to 1000 words)", 
      "Priority placement within industry", 
      "Additional contact methods",
      "Company size and founding year display",
      "Enhanced SEO visibility"
    ] 
  }
};

export default function ClaimCompanyPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'search' | 'select' | 'form' | 'payment'>('search');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
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
        sectorName: sectorName || ''
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
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      return apiRequest("POST", "/api/company-claims", formDataToSend);
    },
    onSuccess: () => {
      toast({
        title: "Claim Submitted Successfully",
        description: "We'll process your company claim and send payment instructions to your email.",
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
    const isDescriptionValid = formData.companyDescription?.trim().length >= 10;

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
    if (formData.companyDescription?.trim().length < 10) return 'Company Description must be at least 10 characters';
    
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

    if (!formData.contactName || !formData.contactEmail || !formData.companyDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
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
            <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation('/')}>
              <img src={comcubesIcon} alt="COMCUBES" className="h-8 w-8" />
              <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'IBM Plex Serif', fontWeight: 500 }}>COMCUBES</h1>
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
                      onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                      placeholder="https://www.yourcompany.com"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyDescription">Company Description *</Label>
                    <Textarea
                      id="companyDescription"
                      value={formData.companyDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyDescription: e.target.value }))}
                      placeholder="Describe your company, products, and services..."
                      rows={6}
                    />
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
                          <p className="text-sm text-gray-500 mb-4">per month, billed annually (${plan.price * 12}/year)</p>
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

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• We'll review your claim within 24-48 hours</li>
                  <li>• You'll receive payment instructions via email</li>
                  <li>• Once payment is confirmed, your enhanced listing goes live</li>
                </ul>
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
                  {claimMutation.isPending ? 'Submitting...' : `Submit Claim ($${CLAIM_PRICING[formData.plan].monthlyPrice}/month)`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

    </div>
  );
}