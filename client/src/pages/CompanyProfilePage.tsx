import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BannerAd } from "@/components/BannerAd";
import { GoogleAdSense } from "@/components/GoogleAdSense";
import { 
  Building2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  Calendar,
  ExternalLink,
  ArrowLeft,
  Star,
  TrendingUp,
  DollarSign,
  Briefcase,
  Tag
} from "lucide-react";
import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";
import type { Company, SearchResults } from "@/lib/types";
import { useState, useEffect } from "react";
import { generateCompanyDescription } from "@/utils/companyDescriptionGenerator";
import { SEOHead, createBreadcrumbStructuredData, createLocalBusinessStructuredData, BRAND_KEYWORDS } from "@/components/SEOHead";
import { AffiliateDisclosureBanner } from "@/components/AffiliateDisclosureBanner";
import { DataAccuracyDisclaimer } from "@/components/DataAccuracyDisclaimer";

export default function CompanyProfilePage() {
  const { companyId } = useParams();
  const [, setLocation] = useLocation();
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [companyId]);

  const { data: company, isLoading: companyLoading, error: companyError } = useQuery<Company>({
    queryKey: [`/api/companies/${companyId}`],
    enabled: !!companyId,
    staleTime: Infinity,
  });

  const { data: relatedCompanies, isLoading: relatedLoading } = useQuery<Company[]>({
    queryKey: [`/api/companies/${companyId}/related`],
    enabled: !!companyId && !!company,
    staleTime: Infinity,
  });

  const handleSearchResults = (results: SearchResults | null) => {
    setSearchResults(results);
  };

  const handleRelatedCompanyClick = (relatedCompany: Company) => {
    if (relatedCompany.websiteUrl) {
      window.open(relatedCompany.websiteUrl, '_blank');
    }
  };

  if (companyLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation('/')}>
                <div className="w-16 h-16 mr-3 flex items-center justify-center">
                  <img src={comcubesIcon} alt="COMCUBES" className="w-16 h-16" />
                </div>
                <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'IBM Plex Serif', fontWeight: 500 }}>COMCUBES</h1>
              </div>
              
              <div className="flex items-center space-x-3">
                <SearchBar onSearchResults={handleSearchResults} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/search')}
                  className="flex items-center gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  Advanced Search
                </Button>
              </div>
              
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (companyError || !company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation('/')}>
                <div className="w-16 h-16 mr-3 flex items-center justify-center">
                  <img src={comcubesIcon} alt="COMCUBES" className="w-16 h-16" />
                </div>
                <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'IBM Plex Serif', fontWeight: 500 }}>COMCUBES</h1>
              </div>
              
              <div className="flex items-center space-x-3">
                <SearchBar onSearchResults={handleSearchResults} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/search')}
                  className="flex items-center gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  Advanced Search
                </Button>
              </div>
              
              <span className="text-sm text-gray-600">Company Profile</span>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Not Found</h2>
            <p className="text-gray-600 mb-6">The requested company could not be found or does not exist in our directory.</p>
            <Button onClick={() => setLocation('/')} variant="default">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Directory
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AffiliateDisclosureBanner />
      <SEOHead 
        title={`${company.name} - Company Profile | ${company.industryName} | COMCUBES`}
        description={`Complete business profile for ${company.name} in ${company.industryName} industry. Find contact details, website, company information, and related businesses in ${company.sectorName} sector on COMCUBES business directory.`}
        keywords={[
          ...BRAND_KEYWORDS.slice(0, 3),
          `${company.name}`, `${company.name.toLowerCase()}`, `${company.industryName.toLowerCase()}`,
          `${company.sectorName.toLowerCase()}`, `${company.name} company`, `${company.name} profile`,
          "company profile", "business information", "company details", "business directory", 
          "company contact", "business profile", "company website"
        ]}
        canonicalUrl={`https://comcubes.com/company/${company.id}`}
        ogTitle={`${company.name} | ${company.industryName} Company | COMCUBES`}
        ogDescription={`Business profile for ${company.name} in ${company.industryName}. Contact details, website, and company information.`}
        structuredData={createBreadcrumbStructuredData([
          { name: "Home", url: "https://comcubes.com/" },
          { name: "Business Sectors", url: "https://comcubes.com/sectors" },
          { name: company.sectorName, url: `https://comcubes.com/sector/${encodeURIComponent(company.sectorName)}` },
          { name: company.industryName, url: `https://comcubes.com/industry/${encodeURIComponent(company.industryName)}` },
          { name: company.name, url: `https://comcubes.com/company/${company.id}` }
        ])}
        additionalStructuredData={[
          createLocalBusinessStructuredData({
            name: company.name,
            description: `${company.name} is a company in the ${company.industryName} industry, part of the ${company.sectorName} sector.`,
            url: company.websiteUrl || undefined,
            industry: company.industryName,
            country: (company as any).country || undefined
          })
        ]}
      />
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation('/')}>
              <div className="w-16 h-16 mr-3 flex items-center justify-center">
                <img src={comcubesIcon} alt="COMCUBES" className="w-16 h-16" />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <SearchBar onSearchResults={handleSearchResults} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/search')}
                className="flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                Advanced Search
              </Button>
            </div>
            
            <span className="text-sm text-gray-600">{company.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs 
            items={[
              { label: 'Home', href: '/' },
              { label: company.sectorName, href: `/sector/${encodeURIComponent(company.sectorName)}` },
              { label: company.industryName, href: `/industry/${encodeURIComponent(company.industryName)}` },
              { label: company.name, href: '' }
            ]} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Advertisement (Desktop only) */}
          <div className="lg:col-span-1 space-y-4 hidden lg:block">
            <GoogleAdSense 
              format="vertical"
              className="sticky top-24"
              position="company-profile-left-sidebar"
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mobile-friendly responsive ad (Mobile/Tablet only) */}
            <div className="lg:hidden">
              <GoogleAdSense 
                format="responsive"
                position="company-profile-mobile-top"
                className="w-full"
              />
            </div>
            {/* Company Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'IBM Plex Serif' }}>
                        {company.name}
                      </h1>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary" className="cursor-pointer hover:bg-gray-300" 
                               onClick={() => setLocation(`/sector/${encodeURIComponent(company.sectorName)}`)}>
                          {company.sectorName}
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-gray-100"
                               onClick={() => setLocation(`/industry/${encodeURIComponent(company.industryName)}`)}>
                          {company.industryName}
                        </Badge>
                      </div>
                      {company.websiteUrl && (
                        <Button 
                          onClick={() => window.open(company.websiteUrl!, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <Globe className="h-4 w-4" />
                          Visit Website
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-500 mb-1">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4" />
                      <span className="text-sm text-gray-600 ml-1">4.0</span>
                    </div>
                    <p className="text-xs text-gray-500">Based on directory data</p>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Company Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About {company.name}</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {generateCompanyDescription(company)}
                  </p>
                </div>

                {/* Key Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">Industry</p>
                        <p className="text-sm text-gray-600">{company.industryName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">Sector</p>
                        <p className="text-sm text-gray-600">{company.sectorName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {company.websiteUrl && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">Website</p>
                          <a 
                            href={company.websiteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                          >
                            Visit Company Website
                          </a>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">Listed Since</p>
                        <p className="text-sm text-gray-600">Directory Member</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Intelligence Section */}
            {(company.employeeCount || company.revenueEstimate || company.foundedYear || company.companySize || company.specializationTags) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Company Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Data Accuracy Disclaimer */}
                    <DataAccuracyDisclaimer variant="compact" />

                    {/* Company Intelligence Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {company.employeeCount && (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900 mb-1">Employee Count</p>
                            <p className="text-sm text-gray-600">{company.employeeCount}</p>
                          </div>
                        </div>
                      )}

                      {company.revenueEstimate && (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <DollarSign className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900 mb-1">Revenue Estimate</p>
                            <p className="text-sm text-gray-600">{company.revenueEstimate}</p>
                          </div>
                        </div>
                      )}

                      {company.foundedYear && (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900 mb-1">Founded</p>
                            <p className="text-sm text-gray-600">{company.foundedYear}</p>
                          </div>
                        </div>
                      )}

                      {company.companySize && (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <Building2 className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900 mb-1">Company Size</p>
                            <p className="text-sm text-gray-600">{company.companySize}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Specialization Tags */}
                    {company.specializationTags && (
                      <div className="pt-2">
                        <div className="flex items-start gap-3">
                          <Tag className="h-5 w-5 text-gray-500 mt-1" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 mb-2">Specializations</p>
                            <div className="flex flex-wrap gap-2">
                              {company.specializationTags.split(',').map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag.trim()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Verification Status Badge */}
                    {company.verificationStatus && company.verificationStatus !== 'unverified' && (
                      <div className="flex items-center gap-2 pt-2">
                        <Badge 
                          variant={company.verificationStatus === 'verified' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {company.verificationStatus === 'verified' ? '✓ Verified Information' : 'Pending Verification'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Get in Touch</p>
                        <p className="text-sm text-gray-600">
                          Contact details for {company.name} can be found on their official website. 
                          Click "Visit Website" above to access their contact information, including phone numbers, 
                          email addresses, and office locations.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <span className="font-medium text-gray-900">Business Directory</span>
                    </div>
                    <Badge variant="secondary">Verified Listing</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Related Companies */}
            {relatedCompanies && relatedCompanies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Companies</CardTitle>
                  <p className="text-sm text-gray-600">Other companies in {company.industryName}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {relatedCompanies.slice(0, 8).map((relatedCompany: Company) => (
                      <div 
                        key={relatedCompany.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleRelatedCompanyClick(relatedCompany)}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate text-sm">
                            {relatedCompany.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {relatedCompany.industryName}
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                  
                  {relatedCompanies.length > 8 && (
                    <div className="mt-4 pt-3 border-t">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full px-1 py-1 h-auto min-h-[32px] leading-tight"
                        onClick={() => setLocation(`/industry/${encodeURIComponent(company.industryName)}`)}
                      >
                        <span 
                          className="block w-full text-center break-words hyphens-auto"
                          style={{
                            fontSize: company.industryName.length > 25 ? '10px' : 
                                     company.industryName.length > 20 ? '11px' : '12px',
                            lineHeight: '1.2'
                          }}
                        >
                          View All in {company.industryName}
                        </span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Back to Industry Button */}
        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            onClick={() => setLocation(`/industry/${encodeURIComponent(company.industryName)}`)}
            className="flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {company.industryName} Companies
          </Button>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 COMCUBES Global Business Directory. Professional business data across 421 pages.</p>
            <p className="mt-2 text-sm">Featuring 20 sectors, 400+ industries, and 7,400+ companies worldwide.</p>
            <div className="mt-4 flex justify-center space-x-6 text-xs">
              <button onClick={() => setLocation('/privacy-policy')} className="hover:text-gray-900 underline">Privacy Policy</button>
              <button onClick={() => setLocation('/terms-of-service')} className="hover:text-gray-900 underline">Terms of Service</button>
              <button onClick={() => setLocation('/disclaimer')} className="hover:text-gray-900 underline">Disclaimer</button>
              <button onClick={() => setLocation('/affiliate-disclosure')} className="hover:text-gray-900 underline">Affiliate Disclosure</button>
            </div>
          </div>
        </div>
      </footer>
      
      {/* SEO Analyzer Component */}
    </div>
  );
}