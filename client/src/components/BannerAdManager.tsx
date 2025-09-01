import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Save, Eye, EyeOff } from "lucide-react";
import { LEFT_BANNER_ADS, RIGHT_BANNER_ADS, type BannerAdConfig } from "@/config/bannerAds";

interface BannerAdManagerProps {
  className?: string;
}

export function BannerAdManager({ className = "" }: BannerAdManagerProps) {
  const queryClient = useQueryClient();
  const [newImageUrl, setNewImageUrl] = useState("");
  const [activeTab, setActiveTab] = useState<'left' | 'right'>('left');
  
  // Fetch banner ads from database
  const { data: bannerAds, isLoading } = useQuery({
    queryKey: ['/api/admin/banner-ads'],
    retry: 2,
  });

  // Find current banner ad config
  const currentBanner = bannerAds?.find((banner: any) => banner.position === activeTab);
  
  // Create mutation for updating banner ads
  const updateBannerMutation = useMutation({
    mutationFn: async (bannerData: any) => {
      if (currentBanner?.id) {
        return await apiRequest('PUT', `/api/admin/banner-ads/${currentBanner.id}`, bannerData);
      } else {
        return await apiRequest('POST', '/api/admin/banner-ads', bannerData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/banner-ads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/banner-ads'] }); // Also invalidate public API
    }
  });

  // Delete mutation
  const deleteBannerMutation = useMutation({
    mutationFn: async (bannerId: number) => {
      return await apiRequest('DELETE', `/api/admin/banner-ads/${bannerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/banner-ads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/banner-ads'] }); // Also invalidate public API
    }
  });

  if (isLoading) {
    return <div className="p-4">Loading banner ads...</div>;
  }

  const addImage = () => {
    if (newImageUrl.trim() && (currentBanner?.images?.length || 0) < 10) {
      const updatedImages = [...(currentBanner?.images || []), newImageUrl.trim()];
      updateBannerMutation.mutate({
        position: activeTab,
        images: updatedImages,
        clickUrl: currentBanner?.clickUrl,
        isActive: currentBanner?.isActive ?? true
      });
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = (currentBanner?.images || []).filter((_, i) => i !== index);
    updateBannerMutation.mutate({
      position: activeTab,
      images: updatedImages,
      clickUrl: currentBanner?.clickUrl,
      isActive: currentBanner?.isActive ?? true
    });
  };

  const updateClickUrl = (url: string) => {
    updateBannerMutation.mutate({
      position: activeTab,
      images: currentBanner?.images || [],
      clickUrl: url,
      isActive: currentBanner?.isActive ?? true
    });
  };

  const toggleActive = (isActive: boolean) => {
    updateBannerMutation.mutate({
      position: activeTab,
      images: currentBanner?.images || [],
      clickUrl: currentBanner?.clickUrl,
      isActive
    });
  };

  const saveConfiguration = () => {
    // Changes are automatically saved with each action
    alert(`${activeTab === 'left' ? 'Left' : 'Right'} banner configuration updated!\n\nChanges are immediately visible on the website.`);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Banner Ad Manager</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tab Selection */}
          <div className="flex space-x-2">
            <Button
              variant={activeTab === 'left' ? 'default' : 'outline'}
              onClick={() => setActiveTab('left')}
              className="flex-1"
            >
              Left Banner
            </Button>
            <Button
              variant={activeTab === 'right' ? 'default' : 'outline'}
              onClick={() => setActiveTab('right')}
              className="flex-1"
            >
              Right Banner
            </Button>
          </div>

          {/* Banner Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              {currentBanner?.isActive ? (
                <Eye className="h-5 w-5 text-green-600" />
              ) : (
                <EyeOff className="h-5 w-5 text-gray-400" />
              )}
              <span className="font-medium">
                {currentBanner?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <Switch
              checked={currentBanner?.isActive ?? true}
              onCheckedChange={toggleActive}
            />
          </div>

          {/* Click URL Configuration */}
          <div className="space-y-2">
            <Label htmlFor="clickUrl">Click Destination URL</Label>
            <Input
              id="clickUrl"
              type="url"
              placeholder="https://www.example.com"
              value={currentBanner?.clickUrl || ''}
              onChange={(e) => updateClickUrl(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Where users go when they click the banner
            </p>
          </div>

          {/* Image Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Banner Images ({(currentBanner?.images?.length || 0)}/10)</Label>
              <span className="text-sm text-gray-500">
                Rotates every 7 seconds
              </span>
            </div>

            {/* Add New Image */}
            <div className="flex space-x-2">
              <Input
                placeholder="Enter image URL or /uploads/filename.jpg"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addImage()}
                disabled={(currentBanner?.images?.length || 0) >= 10}
              />
              <Button
                onClick={addImage}
                disabled={!newImageUrl.trim() || (currentBanner?.images?.length || 0) >= 10}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Image List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(currentBanner?.images || []).map((image, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <span className="text-sm font-mono flex-1 truncate">
                    {index + 1}. {image}
                  </span>
                  <Button
                    onClick={() => removeImage(index)}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {(currentBanner?.images?.length || 0) === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No images configured. Banner will show "Available for Rent" placeholder.
                </p>
              )}
            </div>
          </div>

          {/* Save Button */}
          <Button onClick={saveConfiguration} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>

          {/* Configuration Status */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-green-800 font-medium mb-2">Database Configuration</div>
            <div className="text-sm text-green-600">
              <div>Position: {activeTab}</div>
              <div>Status: {currentBanner?.isActive ? 'Active' : 'Inactive'}</div>
              <div>Images: {currentBanner?.images?.length || 0}/10</div>
              <div>Click URL: {currentBanner?.clickUrl || 'Not set'}</div>
              <div className="mt-2 text-green-700 font-medium">
                ✅ Changes are automatically saved to database and immediately visible on the website
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}