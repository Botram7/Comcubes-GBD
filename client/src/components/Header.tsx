import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/SearchBar';
import { AuthButton } from '@/components/AuthButton';
import { Building2 } from 'lucide-react';
import comcubesIcon from '@assets/2de77b64-4c39-4ddb-aa7a-0afd37edfe34_1752720571406.png';
import type { SearchResults } from '@/lib/types';

interface HeaderProps {
  onSearchResults?: (results: SearchResults | null) => void;
  showAdvancedSearch?: boolean;
  showBackButton?: boolean;
  backButtonLabel?: string;
  customActions?: React.ReactNode;
}

export function Header({ 
  onSearchResults,
  showAdvancedSearch = true,
  showBackButton = false,
  backButtonLabel = 'Home',
  customActions
}: HeaderProps) {
  const [, setLocation] = useLocation();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => setLocation('/')}
          >
            <div className="w-8 h-8 mr-3 flex items-center justify-center">
              <img src={comcubesIcon} alt="COMCUBES" className="w-8 h-8" />
            </div>
            <h1 
              className="text-2xl font-bold text-blue-600 dark:text-blue-400" 
              style={{ fontFamily: 'IBM Plex Serif', fontWeight: 500 }}
            >
              COMCUBES
            </h1>
          </div>
          
          {/* Search Section */}
          {onSearchResults && (
            <div className="flex items-center space-x-3 flex-1 justify-center max-w-2xl">
              <SearchBar onSearchResults={onSearchResults} />
              {showAdvancedSearch && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/search')}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Building2 className="h-4 w-4" />
                  Advanced Search
                </Button>
              )}
            </div>
          )}
          
          {/* Actions Section */}
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
                className="flex items-center gap-2"
              >
                ← {backButtonLabel}
              </Button>
            )}
            
            {customActions}
            
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}