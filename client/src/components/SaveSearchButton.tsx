import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SaveSearchButtonProps {
  searchQuery: string;
  searchType: string;
  resultCount: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  className?: string;
}

export function SaveSearchButton({ 
  searchQuery, 
  searchType, 
  resultCount,
  size = 'sm',
  variant = 'ghost',
  className = '' 
}: SaveSearchButtonProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveSearchMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/user/saved-searches', {
        searchQuery,
        searchType,
        resultCount,
      });
    },
    onSuccess: () => {
      toast({
        title: "Search Saved",
        description: `Your search for "${searchQuery}" has been saved.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/saved-searches'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save search. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to save your searches.",
      });
      return;
    }

    saveSearchMutation.mutate();
  };

  if (!searchQuery.trim()) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={saveSearchMutation.isPending}
      className={className}
      title="Save this search"
    >
      <Bookmark 
        size={16} 
        className={`mr-2 ${saveSearchMutation.isPending ? 'opacity-50' : ''}`}
      />
      Save Search
    </Button>
  );
}