import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { SEOHead } from '@/components/SEOHead';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { 
  User, 
  Heart, 
  Search, 
  Clock, 
  Star, 
  Trash2, 
  ExternalLink, 
  Building2, 
  Briefcase, 
  Users,
  TrendingUp
} from 'lucide-react';
import type { UserFavorite, UserSavedSearch, UserRecentlyViewed } from '@shared/schema';

export default function UserDashboardPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites = [] } = useQuery<UserFavorite[]>({
    queryKey: ['/api/user/favorites'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user/favorites', undefined, {
        Authorization: `Bearer ${localStorage.getItem('comcubes_auth_token')}`,
      });
      return response.json();
    },
  });

  const { data: savedSearches = [] } = useQuery<UserSavedSearch[]>({
    queryKey: ['/api/user/saved-searches'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user/saved-searches', undefined, {
        Authorization: `Bearer ${localStorage.getItem('comcubes_auth_token')}`,
      });
      return response.json();
    },
  });

  const { data: recentlyViewed = [] } = useQuery<UserRecentlyViewed[]>({
    queryKey: ['/api/user/recently-viewed'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user/recently-viewed', undefined, {
        Authorization: `Bearer ${localStorage.getItem('comcubes_auth_token')}`,
      });
      return response.json();
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async ({ entityType, entityId }: { entityType: string; entityId: number }) => {
      const response = await apiRequest('DELETE', `/api/user/favorites/${entityType}/${entityId}`, undefined, {
        Authorization: `Bearer ${localStorage.getItem('comcubes_auth_token')}`,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Favorite Removed",
        description: "The item has been removed from your favorites.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/favorites'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove favorite. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeSavedSearchMutation = useMutation({
    mutationFn: async (searchId: number) => {
      const response = await apiRequest('DELETE', `/api/user/saved-searches/${searchId}`, undefined, {
        Authorization: `Bearer ${localStorage.getItem('comcubes_auth_token')}`,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Search Removed",
        description: "The saved search has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/saved-searches'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove saved search. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'company':
        return <Building2 className="h-4 w-4" />;
      case 'industry':
        return <Briefcase className="h-4 w-4" />;
      case 'sector':
        return <Users className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getEntityUrl = (entityType: string, entityId: number, entityName: string) => {
    switch (entityType) {
      case 'company':
        return `/companies/${entityId}`;
      case 'industry':
        return `/industries/${encodeURIComponent(entityName)}`;
      case 'sector':
        return `/sectors/${encodeURIComponent(entityName)}`;
      default:
        return '/';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <SEOHead
        title="My Dashboard - COMCUBES Business Directory"
        description="Manage your favorites, saved searches, and recently viewed companies in your personal COMCUBES dashboard."
        canonical="/dashboard"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Welcome back, {user.firstName}!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link href="/">
                    <Button variant="outline" className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Browse Directory
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={logout}>
                    Sign Out
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Favorites</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{user.favoritesCount || 0}</p>
                    </div>
                    <Heart className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 dark:text-green-400 text-sm font-medium">Saved Searches</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">{user.savedSearchesCount || 0}</p>
                    </div>
                    <Search className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Total Activity</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{user.activityCount || 0}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Member Since</p>
                      <p className="text-sm font-bold text-orange-900 dark:text-orange-100">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <Tabs defaultValue="favorites" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
              <TabsTrigger value="favorites" className="gap-2">
                <Heart className="h-4 w-4" />
                Favorites
              </TabsTrigger>
              <TabsTrigger value="searches" className="gap-2">
                <Search className="h-4 w-4" />
                Saved Searches
              </TabsTrigger>
              <TabsTrigger value="recent" className="gap-2">
                <Clock className="h-4 w-4" />
                Recently Viewed
              </TabsTrigger>
            </TabsList>

            {/* Favorites Tab */}
            <TabsContent value="favorites">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    My Favorites ({favorites.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {favorites.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No favorites yet. Start exploring companies and add them to your favorites!</p>
                      <Link href="/">
                        <Button className="mt-4">Browse Companies</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {favorites.map((favorite) => (
                        <div
                          key={favorite.id}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {getEntityIcon(favorite.entityType)}
                            <div>
                              <Link href={getEntityUrl(favorite.entityType, favorite.entityId, favorite.entityName)}>
                                <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                                  {favorite.entityName}
                                </h3>
                              </Link>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="capitalize">
                                  {favorite.entityType}
                                </Badge>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  Added {new Date(favorite.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              removeFavoriteMutation.mutate({
                                entityType: favorite.entityType,
                                entityId: favorite.entityId,
                              })
                            }
                            disabled={removeFavoriteMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Saved Searches Tab */}
            <TabsContent value="searches">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-blue-500" />
                    Saved Searches ({savedSearches.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {savedSearches.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No saved searches yet. Search for companies and save your queries!</p>
                      <Link href="/search">
                        <Button className="mt-4">Start Searching</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {savedSearches.map((search) => (
                        <div
                          key={search.id}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Search className="h-4 w-4 text-gray-500" />
                              <Link href={`/search?q=${encodeURIComponent(search.searchQuery)}`}>
                                <span className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                                  "{search.searchQuery}"
                                </span>
                              </Link>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>Type: {search.searchType}</span>
                              <span>Results: {search.resultCount}</span>
                              <span>Saved: {new Date(search.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeSavedSearchMutation.mutate(search.id)}
                            disabled={removeSavedSearchMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recently Viewed Tab */}
            <TabsContent value="recent">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    Recently Viewed ({recentlyViewed.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentlyViewed.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No recent activity. Start exploring the business directory!</p>
                      <Link href="/">
                        <Button className="mt-4">Browse Directory</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {recentlyViewed.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          {getEntityIcon(item.entityType)}
                          <div className="flex-1">
                            <Link href={getEntityUrl(item.entityType, item.entityId, item.entityName)}>
                              <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                                {item.entityName}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="capitalize">
                                {item.entityType}
                              </Badge>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Viewed {new Date(item.viewedAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}