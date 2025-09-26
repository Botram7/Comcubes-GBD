import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getImageForEntity } from "@/lib/constants";
import { useLocation } from "wouter";
import { Crown, ExternalLink } from "lucide-react";
import type { Sector, Industry, Company } from "@/lib/types";

interface BusinessGridProps {
  items: (Sector | Industry | Company)[];
  type: 'sector' | 'industry' | 'company';
  onItemClick: (item: Sector | Industry | Company) => void;
  showClaimButtons?: boolean;
  currentSector?: string;
  currentIndustry?: string;
}

export function BusinessGrid({ items, type, onItemClick, showClaimButtons = false, currentSector, currentIndustry }: BusinessGridProps) {
  const [, setLocation] = useLocation();

  const handleClaimClick = (e: React.MouseEvent, company: Company) => {
    e.stopPropagation();
    const searchParams = new URLSearchParams({
      companyId: company.id.toString(),
      companyName: company.name,
      industryName: company.industryName || currentIndustry || '',
      sectorName: company.sectorName || currentSector || ''
    });
    setLocation(`/claim-company?${searchParams.toString()}`);
  };
  // Function to get colorful gradient for company cards
  const getCompanyCardGradient = (index: number): string => {
    const gradients = [
      'bg-gradient-to-br from-blue-500 to-blue-700',
      'bg-gradient-to-br from-purple-500 to-purple-700',
      'bg-gradient-to-br from-green-500 to-green-700',
      'bg-gradient-to-br from-orange-500 to-orange-700',
      'bg-gradient-to-br from-red-500 to-red-700',
      'bg-gradient-to-br from-teal-500 to-teal-700',
      'bg-gradient-to-br from-pink-500 to-pink-700',
      'bg-gradient-to-br from-indigo-500 to-indigo-700',
      'bg-gradient-to-br from-yellow-500 to-yellow-600',
      'bg-gradient-to-br from-cyan-500 to-cyan-700',
      'bg-gradient-to-br from-emerald-500 to-emerald-700',
      'bg-gradient-to-br from-violet-500 to-violet-700',
      'bg-gradient-to-br from-rose-500 to-rose-700',
      'bg-gradient-to-br from-sky-500 to-sky-700',
      'bg-gradient-to-br from-amber-500 to-amber-700',
      'bg-gradient-to-br from-lime-500 to-lime-700',
      'bg-gradient-to-br from-fuchsia-500 to-fuchsia-700',
      'bg-gradient-to-br from-slate-500 to-slate-700',
      'bg-gradient-to-br from-zinc-500 to-zinc-700',
      'bg-gradient-to-br from-stone-500 to-stone-700'
    ];
    
    return gradients[index % gradients.length];
  };
  // Ensure items is always an array and exactly 20 items for 5x4 grid
  const validItems = Array.isArray(items) ? items : [];
  const gridItems = [...validItems];
  
  while (gridItems.length < 20) {
    gridItems.push({
      id: -1,
      name: 'Available Slot',
      ...(type === 'industry' && { sectorName: '' }),
      ...(type === 'company' && { industryName: '', sectorName: '', websiteUrl: null })
    } as any);
  }

  const displayItems = gridItems.slice(0, 20);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-1 sm:gap-3 w-full max-w-4xl mx-auto px-1 sm:px-4">
      {displayItems.map((item, index) => (
        <Card
          key={`${type}-${item.id}-${index}`}
          className="relative overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl aspect-square group"
          onClick={() => {
            if (item.id === -1) {
              // Navigate to company listing page for "Available Slot" items
              // Navigate to list company page with pre-filled sector and industry
              const params = new URLSearchParams();
              if (currentSector) params.set('sector', currentSector);
              if (currentIndustry) params.set('industry', currentIndustry);
              const queryString = params.toString();
              setLocation(`/list-company${queryString ? '?' + queryString : ''}`);
              console.log('Navigating to list company with params:', { currentSector, currentIndustry });
            } else {
              onItemClick(item);
            }
          }}
        >
          {type === 'company' ? (
            /* Colorful gradient cards for companies */
            <div className={`absolute inset-0 ${getCompanyCardGradient(index)}`}>
              {/* Claim button for existing companies */}
              {showClaimButtons && item.id !== -1 && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2 z-10 h-6 px-2 text-xs bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border border-yellow-500"
                  onClick={(e) => handleClaimClick(e, item as Company)}
                >
                  <Crown className="h-3 w-3 mr-1" />
                  Claim
                </Button>
              )}

              {/* Website link for companies with URLs */}
              {(item as Company).websiteUrl && item.id !== -1 && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 left-2 z-10 h-6 px-2 text-xs bg-white/20 hover:bg-white/30 text-white border border-white/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open((item as Company).websiteUrl!, '_blank');
                  }}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}

              {/* Text positioned at bottom center */}
              <div className="absolute inset-0 flex items-end justify-center">
                <div className="text-center text-white p-3 pb-4">
                  <h3 className="text-xs font-bold mb-1 leading-tight drop-shadow-md">
                    {item.name}
                  </h3>
                  <p className="text-xs opacity-90 font-medium">
                    {item.id === -1 
                      ? 'Get Listed'
                      : showClaimButtons
                      ? 'Click to claim or visit'
                      : (item as Company).websiteUrl
                      ? 'Visit Website'
                      : 'View Details'
                    }
                  </p>
                  {item.id === -1 && (
                    <div className="mt-1 text-xs opacity-75">Reach out to us now</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Image background for sectors and industries */
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${getImageForEntity(item.name, type)}')`
              }}
            >
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              
              {/* Text positioned at center-bottom */}
              <div className="absolute inset-0 flex items-end justify-center">
                <div className="text-center text-white p-3 pb-4">
                  <h3 className="text-xs font-bold mb-1 leading-tight drop-shadow-lg">
                    {item.name}
                  </h3>
                  <p className="text-xs opacity-90 font-medium">
                    {item.id === -1 
                      ? 'Get Listed'
                      : type === 'industry' 
                      ? 'View Companies'
                      : 'View Industries'
                    }
                  </p>
                  {item.id === -1 && (
                    <div className="mt-1 text-xs opacity-75">Reach out to us now</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
