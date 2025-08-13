import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';

interface ActivityData {
  entityType: string;
  entityId: number;
  entityName: string;
}

export function useActivityTracker(activityData: ActivityData | null, actionType: string = 'page_view') {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!activityData) return;

    const trackActivity = async () => {
      try {
        // Track recently viewed (works for both authenticated and anonymous users)
        await apiRequest('POST', '/api/user/recently-viewed', activityData);

        // Track detailed activity if authenticated
        if (isAuthenticated) {
          await apiRequest('POST', '/api/user/activity', {
            actionType,
            ...activityData,
          });
        }
      } catch (error) {
        // Silently fail - activity tracking shouldn't break user experience
        console.debug('Activity tracking failed:', error);
      }
    };

    // Small delay to avoid tracking rapid page changes
    const timer = setTimeout(trackActivity, 1000);
    
    return () => clearTimeout(timer);
  }, [activityData, actionType, isAuthenticated]);
}