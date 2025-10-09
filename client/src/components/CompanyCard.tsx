import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Building2, Globe, AlertCircle } from 'lucide-react';
import type { Company } from '@shared/schema';
import { generateFallbackIcon } from '@/utils/fallbackIcon';

interface CompanyCardProps {
  company: Company;
  onClick?: () => void;
}

export function CompanyCard({ company, onClick }: CompanyCardProps) {
  // Generate fallback icon for all companies (replacing logo system)
  const fallbackIcon = generateFallbackIcon(company.name, { size: 120, fontSize: 48 });

  const openCompanyWebsite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (company.websiteUrl) {
      const url = company.websiteUrl.startsWith('http') 
        ? company.websiteUrl 
        : `https://${company.websiteUrl}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200 bg-white"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Company Icon Section */}
        <div className="relative h-32 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden rounded-t-lg">
          <img
            src={fallbackIcon}
            alt={`${company.name} icon`}
            className="w-20 h-20 transition-transform duration-200 group-hover:scale-110"
          />
        </div>

        {/* Company Info Section */}
        <div className="p-4">
          <div className="space-y-2">
            {/* Industry Label - Prominent display for cross-industry companies */}
            <div className="text-xs font-medium text-blue-600">
              Industry: {company.industryName}
            </div>
            
            <h3 className="font-semibold text-sm text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
              {company.name}
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {company.sectorName}
              </div>
              
              {company.websiteUrl && (
                <button
                  onClick={openCompanyWebsite}
                  className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  title="Visit website"
                  data-testid="button-visit-website"
                >
                  <Globe className="h-3 w-3" />
                  <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}