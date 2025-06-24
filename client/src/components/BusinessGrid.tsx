import { Card } from "@/components/ui/card";
import { getImageForEntity } from "@/lib/constants";
import type { Sector, Industry, Company } from "@/lib/types";

interface BusinessGridProps {
  items: (Sector | Industry | Company)[];
  type: 'sector' | 'industry' | 'company';
  onItemClick: (item: Sector | Industry | Company) => void;
}

export function BusinessGrid({ items, type, onItemClick }: BusinessGridProps) {
  // Ensure exactly 20 items for 5x4 grid
  const gridItems = items ? [...items] : [];
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
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${getImageForEntity(item.name, type)}')`
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <div className="text-center text-white p-4">
                <h3 className="text-lg font-semibold mb-2 leading-tight">
                  {item.name}
                </h3>
                <p className="text-sm opacity-90">
                  {type === 'company' && (item as Company).websiteUrl && item.id !== -1
                    ? 'Visit Website'
                    : type === 'industry' 
                    ? 'View Companies'
                    : type === 'sector'
                    ? 'View Industries'
                    : 'More data coming soon'
                  }
                </p>
                {type === 'company' && (item as Company).websiteUrl && item.id !== -1 && (
                  <div className="mt-2 text-xs opacity-75">External Link</div>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
