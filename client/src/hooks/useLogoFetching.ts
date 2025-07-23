import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface LogoStats {
  total: number;
  fetched: number;
  pending: number;
  failed: number;
  highQuality: number;
  mediumQuality: number;
  lowQuality: number;
}

interface LogoFetchingHook {
  stats: LogoStats | undefined;
  isLoadingStats: boolean;
  startFetching: (batchSize?: number) => void;
  isFetching: boolean;
  startAudit: () => void;
  isAuditing: boolean;
  takedownLogo: (companyId: number, reason?: string) => void;
  isTakingDown: boolean;
}

export function useLogoFetching(): LogoFetchingHook {
  const queryClient = useQueryClient();
  const [isFetching, setIsFetching] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isTakingDown, setIsTakingDown] = useState(false);

  // Fetch logo statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/logo/stats'],
    refetchInterval: 5000, // Refresh every 5 seconds when fetching
  });

  // Start logo fetching mutation
  const startFetchingMutation = useMutation({
    mutationFn: async (batchSize: number = 10) => {
      const response = await fetch('/api/logo/fetch-logos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchSize }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to start logo fetching');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsFetching(true);
      // Stop fetching indicator after 30 seconds (assuming batch completion)
      setTimeout(() => setIsFetching(false), 30000);
      // Invalidate stats to refresh
      queryClient.invalidateQueries({ queryKey: ['/api/logo/stats'] });
    },
  });

  // Start audit mutation
  const startAuditMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/logo/audit', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to start logo audit');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsAuditing(true);
      // Stop audit indicator after 60 seconds
      setTimeout(() => setIsAuditing(false), 60000);
      queryClient.invalidateQueries({ queryKey: ['/api/logo/stats'] });
    },
  });

  // Takedown logo mutation
  const takedownMutation = useMutation({
    mutationFn: async ({ companyId, reason }: { companyId: number; reason?: string }) => {
      const response = await fetch(`/api/logo/takedown/${companyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove logo');
      }
      
      return response.json();
    },
    onMutate: () => setIsTakingDown(true),
    onSettled: () => setIsTakingDown(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/logo/stats'] });
    },
  });

  return {
    stats,
    isLoadingStats,
    startFetching: (batchSize = 10) => startFetchingMutation.mutate(batchSize),
    isFetching: isFetching || startFetchingMutation.isPending,
    startAudit: () => startAuditMutation.mutate(),
    isAuditing: isAuditing || startAuditMutation.isPending,
    takedownLogo: (companyId: number, reason?: string) => 
      takedownMutation.mutate({ companyId, reason }),
    isTakingDown: isTakingDown || takedownMutation.isPending,
  };
}