import { Card } from "@/components/ui/card";

interface BannerAdProps {
  position: 'left' | 'right';
  className?: string;
}

export function BannerAd({ position, className = "" }: BannerAdProps) {
  const gradientClass = position === 'left' 
    ? 'bg-gradient-to-b from-blue-500 to-purple-600' 
    : 'bg-gradient-to-b from-green-500 to-teal-600';

  return (
    <div className={`w-full h-full ${className}`}>
      {/* Main tall banner that matches grid height */}
      <Card className={`${gradientClass} text-white h-full flex flex-col justify-between p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg border-0`}>
        {/* Top section */}
        <div className="text-center">
          <h3 className="font-bold text-lg mb-2 leading-tight">
            {position === 'left' ? 'Premium Advertisement' : 'Featured Services'}
          </h3>
          <p className="text-sm opacity-90 mb-4 leading-relaxed">
            {position === 'left' 
              ? 'Reach 10,000+ daily business professionals' 
              : 'Connect with industry leaders worldwide'}
          </p>
        </div>

        {/* Middle section */}
        <div className="text-center flex-1 flex items-center justify-center">
          <div className="bg-white bg-opacity-20 rounded-lg p-4 w-full">
            <div className="text-sm font-medium mb-2">Advertisement Space</div>
            <div className="text-sm opacity-90 mb-3">Available for Rent</div>
            <div className="bg-white bg-opacity-30 rounded px-4 py-2 text-sm font-bold">
              Contact Us
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="text-center">
          <div className="bg-white bg-opacity-20 rounded px-4 py-2 text-sm font-medium">
            {position === 'left' ? 'Boost Your Business' : 'Get Started Today'}
          </div>
        </div>
      </Card>
    </div>
  );
}