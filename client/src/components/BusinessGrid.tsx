import { Card } from "@/components/ui/card";
import { getImageForEntity } from "@/lib/constants";
import type { Sector, Industry, Company } from "@/lib/types";

interface BusinessGridProps {
  items: (Sector | Industry | Company)[];
  type: 'sector' | 'industry' | 'company';
  onItemClick: (item: Sector | Industry | Company) => void;
}

export function BusinessGrid({ items, type, onItemClick }: BusinessGridProps) {
  // Ensure items is always an array and exactly 20 items for 5x4 grid
  const validItems = Array.isArray(items) ? items : [];
  const gridItems = [...validItems];
  
  while (gridItems.length < 20) {
    gridItems.push({
      id: -1,
      name: 'Coming Soon',
      ...(type === 'industry' && { sectorName: '' }),
      ...(type === 'company' && { industryName: '', sectorName: '', websiteUrl: null })
    } as any);
  }

  const displayItems = gridItems.slice(0, 20);

  return (
    <div className="grid grid-cols-5 grid-rows-4 gap-4 w-full">
      {displayItems.map((item, index) => (
        <Card
          key={`${type}-${item.id}-${index}`}
          className="relative overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl aspect-[1/1.125] group"
          onClick={() => item.id !== -1 && onItemClick(item)}
        >
          {type === 'company' ? (
            /* Plain colored card for companies */
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600">
              {/* Text positioned at center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <h3 className="text-lg font-bold mb-2 leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-sm opacity-90 font-medium">
                    {(item as Company).websiteUrl && item.id !== -1
                      ? 'Visit Website'
                      : 'More data coming soon'
                    }
                  </p>
                  {(item as Company).websiteUrl && item.id !== -1 && (
                    <div className="mt-1 text-xs opacity-75">External Link</div>
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
                <div className="text-center text-white p-4 pb-6">
                  <h3 className="text-lg font-bold mb-2 leading-tight drop-shadow-lg">
                    {item.name}
                  </h3>
                  <p className="text-sm opacity-90 font-medium">
                    {type === 'industry' 
                      ? 'View Companies'
                      : 'View Industries'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
