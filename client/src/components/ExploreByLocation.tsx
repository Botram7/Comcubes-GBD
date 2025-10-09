import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, MapPin } from "lucide-react";

interface TopCountry {
  id: number;
  name: string;
  slug: string;
  iso2: string;
  iso3: string;
  phoneCode: string | null;
  capital: string | null;
  currency: string | null;
  regionId: number;
  continentId: number;
  companyCount: number;
}

export function ExploreByLocation() {
  const [, setLocation] = useLocation();

  const { data: topCountries, isLoading } = useQuery<TopCountry[]>({
    queryKey: ["/api/geography/top-countries"],
    staleTime: Infinity,
  });

  const handleCountryClick = (country: TopCountry) => {
    setLocation(`/geography/country/${encodeURIComponent(country.slug)}`);
  };

  const handleViewAllLocations = () => {
    setLocation('/geography');
  };

  // Helper to get flag URL from iso2 code
  const getFlagUrl = (iso2: string) => {
    return `https://flagcdn.com/w320/${iso2.toLowerCase()}.png`;
  };

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading top countries...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Explore by Location
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            Discover businesses by geographic location. Browse our database of 7,400+ companies
            across continents, regions, and countries worldwide.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
          {Array.isArray(topCountries) && topCountries.length > 0 ? topCountries.map((country: TopCountry) => (
            <Card 
              key={country.id} 
              className="group cursor-pointer hover:shadow-lg transition-all duration-200 bg-white overflow-hidden"
              onClick={() => handleCountryClick(country)}
              data-testid={`card-country-${country.id}`}
            >
              <div className="aspect-square relative">
                <img 
                  src={getFlagUrl(country.iso2)}
                  alt={`${country.name} flag`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to a gradient background if flag fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.style.background = 
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-center">
                  <div className="text-white font-medium text-sm leading-tight mb-1">
                    {country.name}
                  </div>
                  <div className="text-white/90 text-xs flex items-center justify-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {country.companyCount.toLocaleString()} companies
                  </div>
                </div>
              </div>
            </Card>
          )) : (
            <div className="col-span-full text-center text-gray-500 py-8">
              No country data available
            </div>
          )}
        </div>

        <div className="text-center">
          <Button 
            onClick={handleViewAllLocations}
            variant="outline" 
            className="px-8 py-3"
            data-testid="button-view-all-locations"
          >
            View All Continents, Regions & Countries
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
