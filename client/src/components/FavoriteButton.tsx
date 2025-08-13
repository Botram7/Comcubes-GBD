import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface FavoriteButtonProps {
  entityType: string;
  entityId: number;
  entityName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FavoriteButton({ 
  entityType, 
  entityId, 
  entityName, 
  size = 'sm',
  className = '' 
}: FavoriteButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if item is favorited
  const { data: isFavorited } = useQuery({
    queryKey: [`/api/user/is-favorite`, entityType, entityId],
    enabled: isAuthenticated,
    staleTime: 30000,
  });

  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/user/favorites', {
        entityType,
        entityId,
        entityName,
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to Favorites",
        description: `${entityName} has been saved to your favorites.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/user/is-favorite`, entityType, entityId] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/favorites'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add to favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', '/api/user/favorites', {
        entityType,
        entityId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Removed from Favorites", 
        description: `${entityName} has been removed from your favorites.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/user/is-favorite`, entityType, entityId] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/favorites'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to save favorites.",
      });
      return;
    }

    if (isFavorited) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  };

  const isLoading = addFavoriteMutation.isPending || removeFavoriteMutation.isPending;
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10', 
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isLoading}
      className={`${sizeClasses[size]} p-0 hover:bg-red-50 dark:hover:bg-red-950/20 ${className}`}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        size={iconSizes[size]}
        className={`transition-colors ${
          isFavorited 
            ? 'fill-red-500 text-red-500' 
            : 'text-gray-400 hover:text-red-500'
        } ${isLoading ? 'opacity-50' : ''}`}
      />
    </Button>
  );
}