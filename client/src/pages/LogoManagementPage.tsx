import { Link } from 'wouter';
import { ArrowLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogoFetchingPanel } from '@/components/LogoFetchingPanel';
import { FallbackIconPreview } from '@/components/FallbackIconPreview';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { useQuery } from "@tanstack/react-query";
import comcubesIcon from "@assets/Artboard 2 copy_1753136360343.png";

export default function LogoManagementPage() {
  // Get sample company names for fallback icon preview
  const { data: companyData } = useQuery({
    queryKey: ['/api/companies?page=1&limit=30'],
    staleTime: 30000,
  });

  const sampleCompanyNames = companyData?.companies?.map((c: any) => c.name) || [
    'Apple Inc.', 'Microsoft Corporation', 'Google LLC', 'Amazon.com Inc.', 
    'Tesla Inc.', 'Meta Platforms', 'Netflix Inc.', 'Adobe Systems',
    'Salesforce Inc.', 'Oracle Corporation', 'IBM Corporation', 'Spotify Technology'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 mr-3 flex items-center justify-center">
                  <img src={comcubesIcon} alt="COMCUBES" className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'IBM Plex Serif', fontWeight: 500 }}>
                  COMCUBES
                </h1>
              </div>
            </Link>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 flex items-center">
                <Settings className="h-4 w-4 mr-1" />
                Logo Management
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <Breadcrumbs 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Logo Management', href: '/logo-management' }
        ]} 
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Logo Management System
              </h1>
              <p className="text-gray-600 max-w-3xl">
                Manage company logos across the COMCUBES directory. This system automatically fetches 
                high-quality logos from multiple sources while respecting trademark rights and maintaining 
                compliance with our Terms of Service.
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Directory</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Enhanced Safeguards Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">Enhanced Trademark Compliance</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">✓ Safeguards Implemented:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Takedown mechanism for trademark requests</li>
                <li>• Logo quality standards enforcement</li>
                <li>• Attribution links to official websites</li>
                <li>• Regular compliance audits</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📧 Contact for Takedowns:</h4>
              <p className="text-blue-700">
                Trademark owners can request logo removal at{' '}
                <span className="font-mono bg-blue-100 px-1 rounded">
                  contact-cgbd@comcubes.com
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Logo Fetching Panel */}
        <LogoFetchingPanel />

        {/* Fallback Icon Preview */}
        <FallbackIconPreview companyNames={sampleCompanyNames} />

        {/* Usage Guidelines */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Usage Guidelines</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-700">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Nominative Fair Use</h4>
              <p>
                Logos are used solely for identification purposes within our business directory, 
                consistent with nominative fair use principles.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Quality Standards</h4>
              <p>
                Only high-quality, official logos are displayed. Low-quality or inappropriate 
                images are automatically filtered out.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Attribution Links</h4>
              <p>
                All company logos link directly to their official websites, providing proper 
                attribution and user value.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}