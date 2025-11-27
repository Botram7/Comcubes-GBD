import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReadMoreProps {
  children: React.ReactNode;
  collapsedHeight?: number;
  className?: string;
}

export function ReadMore({ children, collapsedHeight = 120, className = '' }: ReadMoreProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [needsReadMore, setNeedsReadMore] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const measureContent = useCallback(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(height);
      setNeedsReadMore(height > collapsedHeight);
    }
  }, [collapsedHeight]);

  useEffect(() => {
    measureContent();

    const resizeObserver = new ResizeObserver(() => {
      measureContent();
    });

    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    window.addEventListener('orientationchange', measureContent);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('orientationchange', measureContent);
    };
  }, [measureContent, children]);

  const currentMaxHeight = isExpanded 
    ? `${contentHeight}px`
    : `${collapsedHeight}px`;

  return (
    <div className={className}>
      <div className="relative">
        <div 
          ref={contentRef}
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: needsReadMore ? currentMaxHeight : 'none',
          }}
        >
          {children}
        </div>
        
        {!isExpanded && needsReadMore && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,1) 100%)',
            }}
          />
        )}
      </div>
      
      {needsReadMore && (
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
      )}
    </div>
  );
}
