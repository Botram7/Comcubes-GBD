import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateFallbackIcon, getCompanyInitials, getBrandColor } from '@/utils/fallbackIcon';

interface FallbackIconPreviewProps {
  companyNames: string[];
}

export function FallbackIconPreview({ companyNames }: FallbackIconPreviewProps) {
  const sampleCompanies = companyNames.slice(0, 12); // Show first 12 for preview
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Fallback Icon Generator Preview</CardTitle>
        <p className="text-sm text-gray-600">
          Generated icons for companies without logos using initials and brand colors
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {sampleCompanies.map((companyName, index) => {
            const fallbackIcon = generateFallbackIcon(companyName);
            const initials = getCompanyInitials(companyName);
            const brandColor = getBrandColor(companyName);
            
            return (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div className="relative">
                  <img
                    src={fallbackIcon}
                    alt={`${companyName} icon`}
                    className="w-16 h-16 rounded-lg shadow-sm"
                  />
                  <Badge 
                    variant="outline" 
                    className="absolute -top-1 -right-1 text-xs px-1 py-0 bg-white"
                  >
                    {initials}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-900 truncate max-w-20" title={companyName}>
                    {companyName.length > 12 ? `${companyName.substring(0, 12)}...` : companyName}
                  </p>
                  <div 
                    className="w-4 h-2 rounded-full mx-auto mt-1" 
                    style={{ backgroundColor: brandColor }}
                    title={brandColor}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Features:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Consistent brand colors based on company name hash</li>
            <li>• Smart initial extraction (removes common suffixes like Inc, LLC, Corp)</li>
            <li>• Gradient backgrounds for visual appeal</li>
            <li>• SVG-based for perfect scaling at any size</li>
            <li>• Automatic fallback when logos fail to load</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}