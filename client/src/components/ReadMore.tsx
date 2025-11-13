import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReadMoreProps {
  children: React.ReactNode;
  maxLines?: number;
  className?: string;
}

export function ReadMore({ children, maxLines = 4, className = '' }: ReadMoreProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={className}>
      <div 
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-none' : 'max-h-24'
        }`}
        style={{
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: isExpanded ? 'unset' : maxLines,
          lineClamp: isExpanded ? 'unset' : maxLines,
        }}
      >
        {children}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center gap-1"
        data-testid={isExpanded ? "button-read-less" : "button-read-more"}
      >
        {isExpanded ? (
          <>
            <span>Read Less</span>
            <ChevronUp className="h-4 w-4" />
          </>
        ) : (
          <>
            <span>Read More</span>
            <ChevronDown className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
