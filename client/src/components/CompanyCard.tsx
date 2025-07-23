import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Building2, Globe, AlertCircle } from 'lucide-react';
import type { Company } from '@shared/schema';

interface CompanyCardProps {
  company: Company;
  onClick?: () => void;
}

export function CompanyCard({ company, onClick }: CompanyCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

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
        {/* Logo/Image Section */}
        <div className="relative h-32 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden rounded-t-lg">
          {company.logoUrl && !imageError ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse">
                    <Building2 className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
              )}
              <img
                src={company.logoUrl}
                alt={`${company.name} logo`}
                className={`max-w-full max-h-full object-contain p-4 transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <Building2 className="h-8 w-8 mb-2" />
              <span className="text-xs text-center px-2 font-medium">
                {company.name.length > 20 
                  ? `${company.name.substring(0, 20)}...` 
                  : company.name
                }
              </span>
            </div>
          )}
          
          {/* Logo Quality Badge */}
          {company.logoQuality && company.logoUrl && !imageError && (
            <div className="absolute top-2 right-2">
              <Badge 
                variant={
                  company.logoQuality === 'high' ? 'default' :
                  company.logoQuality === 'medium' ? 'secondary' : 'outline'
                }
                className="text-xs"
              >
                {company.logoQuality}
              </Badge>
            </div>
          )}
        </div>

        {/* Company Info Section */}
        <div className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
              {company.name}
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {company.industryName}
              </div>
              
              {company.websiteUrl && (
                <button
                  onClick={openCompanyWebsite}
                  className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  title="Visit website"
                >
                  <Globe className="h-3 w-3" />
                  <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Logo Status Indicator */}
            {company.logoStatus && company.logoStatus !== 'fetched' && (
              <div className="flex items-center space-x-1 text-xs">
                {company.logoStatus === 'pending' && (
                  <>
                    <AlertCircle className="h-3 w-3 text-yellow-500" />
                    <span className="text-yellow-600">Logo pending</span>
                  </>
                )}
                {company.logoStatus === 'failed' && (
                  <>
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-red-600">Logo unavailable</span>
                  </>
                )}
                {company.logoStatus === 'removed' && (
                  <>
                    <AlertCircle className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-500">Logo removed</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}