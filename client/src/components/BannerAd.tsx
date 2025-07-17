import { Card } from "@/components/ui/card";

interface BannerAdProps {
  position: 'left' | 'right';
  className?: string;
}

export function BannerAd({ position, className = "" }: BannerAdProps) {
  const adContent = {
    left: [
      {
        title: "Boost Your Business",
        subtitle: "Reach 10,000+ daily visitors",
        bgColor: "bg-gradient-to-br from-blue-600 to-blue-800",
        cta: "Advertise Here"
      },
      {
        title: "Global Exposure",
        subtitle: "Connect with industry leaders",
        bgColor: "bg-gradient-to-br from-green-600 to-green-800",
        cta: "Get Started"
      },
      {
        title: "Premium Placement",
        subtitle: "Maximize your visibility",
        bgColor: "bg-gradient-to-br from-purple-600 to-purple-800",
        cta: "Learn More"
      }
    ],
    right: [
      {
        title: "Featured Services",
        subtitle: "Professional business solutions",
        bgColor: "bg-gradient-to-br from-orange-600 to-orange-800",
        cta: "Explore Now"
      },
      {
        title: "Industry Insights",
        subtitle: "Access market intelligence",
        bgColor: "bg-gradient-to-br from-teal-600 to-teal-800",
        cta: "Subscribe"
      },
      {
        title: "Partner Network",
        subtitle: "Join our business ecosystem",
        bgColor: "bg-gradient-to-br from-indigo-600 to-indigo-800",
        cta: "Join Today"
      }
    ]
  };

  const ads = adContent[position];

  return (
    <div className={`space-y-4 ${className}`}>
      {ads.map((ad, index) => (
        <Card
          key={`${position}-ad-${index}`}
          className={`${ad.bgColor} text-white p-4 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg border-0`}
        >
          <div className="text-center">
            <h3 className="font-bold text-sm mb-1 leading-tight">
              {ad.title}
            </h3>
            <p className="text-xs opacity-90 mb-3 leading-relaxed">
              {ad.subtitle}
            </p>
            <div className="bg-white bg-opacity-20 rounded px-3 py-1 text-xs font-medium">
              {ad.cta}
            </div>
          </div>
        </Card>
      ))}
      
      {/* Extended tall banner space that matches grid height */}
      <Card className="bg-gray-100 border-2 border-dashed border-gray-300 p-6 text-center h-96">
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