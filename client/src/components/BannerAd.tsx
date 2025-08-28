import { Card } from "@/components/ui/card";
import { useLocation } from 'wouter';

interface BannerAdProps {
  className?: string;
}

export function BannerAd({ className = "" }: BannerAdProps) {
  const [, setLocation] = useLocation();

  return (
    <div className={`${className}`}>
      {/* Advertisement Space - 160x600 dimensions */}
      <Card 
        className="bg-gray-100 border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer hover:bg-gray-200 transition-colors"
        style={{ width: '160px', height: '600px' }}
        onClick={() => setLocation('/advertise')}
      >
        <div className="text-gray-500 h-full flex flex-col justify-center">
          <div className="text-sm font-medium mb-2">Advertisement Space</div>
          <div className="text-sm opacity-75 mb-4">Available for Rent</div>
          <div className="bg-gray-200 rounded px-4 py-2 text-sm font-medium">
            Contact Us
          </div>
        </div>
      </Card>
    </div>
  );
}