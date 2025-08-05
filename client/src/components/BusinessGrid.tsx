import { Card } from "@/components/ui/card";
import { getImageForEntity } from "@/lib/constants";
import { generateFallbackIcon } from "@/utils/fallbackIcon";
import type { Sector, Industry, Company } from "@/lib/types";

interface BusinessGridProps {
  items: (Sector | Industry | Company)[];
  type: 'sector' | 'industry' | 'company';
  onItemClick: (item: Sector | Industry | Company) => void;
}

export function BusinessGrid({ items, type, onItemClick }: BusinessGridProps) {
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
    <div className="grid grid-cols-5 grid-rows-4 gap-3 w-full max-w-4xl mx-auto">
      {displayItems.map((item, index) => (
        <Card
          key={`${type}-${item.id}-${index}`}
          className="relative overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl aspect-square group"
          onClick={() => item.id !== -1 && onItemClick(item)}
        >
          {type === 'company' ? (
            /* Company cards with fallback icons */
            <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-2">
              {item.id !== -1 ? (
                <>
                  {/* Company Icon with Name */}
                  <div className="mb-2">
                    <img
                      src={generateFallbackIcon(item.name, { size: 60, fontSize: 8 })}
                      alt={`${item.name} icon`}
                      className="w-15 h-15"
                    />
                  </div>
                  {/* Visit Website Text */}
                  <div className="text-xs text-gray-700 text-center font-medium">
                    Click to Visit
                  </div>

                </>
              ) : (
                /* Available slot styling */
                <div className="text-center text-gray-400">
                  <div className="w-15 h-15 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-2xl">+</span>
                  </div>
                  <h3 className="text-xs font-medium">Available Slot</h3>
                  <p className="text-xs">Get Listed</p>
                </div>
              )}
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
