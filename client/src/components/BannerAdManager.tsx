import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Trash2, 
  Plus, 
  Save, 
  Eye, 
  EyeOff, 
  Upload, 
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Loader2 
} from "lucide-react";

interface BannerAdManagerProps {
  className?: string;
}

interface BannerAd {
  id: number;
  position: string;
  images: string[];
  imageUrls: string[]; // Individual URLs for each image
  clickUrl?: string; // Fallback URL
  rotationInterval: number; // Rotation timing in milliseconds
  isActive: boolean;
}

export function BannerAdManager({ className = "" }: BannerAdManagerProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newImageUrl, setNewImageUrl] = useState("");
  const [activeTab, setActiveTab] = useState<'left' | 'right'>('left');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [rotationInterval, setRotationInterval] = useState(7000); // Default 7 seconds
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch banner ads from database
  const { data: bannerAds, isLoading, error } = useQuery({
    queryKey: ['/api/admin/banner-ads'],
    retry: 2,
  });

  // Find current banner ad config
  const currentBanner = Array.isArray(bannerAds) ? 
    bannerAds.find((banner: BannerAd) => banner.position === activeTab) : 
    undefined;
  
  // Create mutation for updating banner ads
  const updateBannerMutation = useMutation({
    mutationFn: async (bannerData: Partial<BannerAd>) => {
      if (currentBanner?.id) {
        return await apiRequest('PUT', `/api/admin/banner-ads/${currentBanner.id}`, bannerData);
      } else {
        return await apiRequest('POST', '/api/admin/banner-ads', bannerData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/banner-ads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/banner-ads'] }); // Also invalidate public API
      toast({
        title: "Success",
        description: "Banner configuration updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update banner configuration. Please try again.",
        variant: "destructive",
      });
      console.error('Banner update error:', error);
    }
  });

  // File upload function
  const uploadFile = useCallback(async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      // Create form data for multipart upload
      const formData = new FormData();
      formData.append('image', file);
      
      // Upload the file directly to server
      const response = await fetch('/api/objects/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      if (!result.success || !result.imageUrl) {
        throw new Error('Upload failed - no image URL returned');
      }

      toast({
        title: "Upload successful",
        description: `${file.name} uploaded successfully!`,
      });

      return result.imageUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed", 
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [toast]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please drop image files only.",
        variant: "destructive",
      });
      return;
    }

    if ((currentBanner?.images?.length || 0) + imageFiles.length > 10) {
      toast({
        title: "Too many images",
        description: "Banner can have maximum 10 images.",
        variant: "destructive",
      });
      return;
    }

    try {
      const uploadedUrls = [];
      for (const file of imageFiles) {
        const url = await uploadFile(file);
        uploadedUrls.push(url);
      }

      // Add all uploaded images to the banner
      const updatedImages = [...(currentBanner?.images || []), ...uploadedUrls];
      updateBannerMutation.mutate({
        position: activeTab,
        images: updatedImages,
        imageUrls: currentBanner?.imageUrls || [],
        clickUrl: currentBanner?.clickUrl,
        rotationInterval: currentBanner?.rotationInterval || 7000,
        isActive: currentBanner?.isActive ?? true
      });

    } catch (error) {
      console.error('File upload error:', error);
    }
  }, [currentBanner, activeTab, uploadFile, updateBannerMutation, toast]);

  // Handle file input
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) return;

    if ((currentBanner?.images?.length || 0) + imageFiles.length > 10) {
      toast({
        title: "Too many images",
        description: "Banner can have maximum 10 images.",
        variant: "destructive",
      });
      return;
    }

    try {
      const uploadedUrls = [];
      for (const file of imageFiles) {
        const url = await uploadFile(file);
        uploadedUrls.push(url);
      }

      // Add all uploaded images to the banner
      const updatedImages = [...(currentBanner?.images || []), ...uploadedUrls];
      updateBannerMutation.mutate({
        position: activeTab,
        images: updatedImages,
        imageUrls: currentBanner?.imageUrls || [],
        clickUrl: currentBanner?.clickUrl,
        rotationInterval: currentBanner?.rotationInterval || 7000,
        isActive: currentBanner?.isActive ?? true
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('File upload error:', error);
    }
  }, [currentBanner, activeTab, uploadFile, updateBannerMutation, toast]);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading banner ads...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Failed to load banner ads. Please try again.</p>
      </div>
    );
  }

  const addImage = () => {
    if (newImageUrl.trim() && (currentBanner?.images?.length || 0) < 10) {
      const updatedImages = [...(currentBanner?.images || []), newImageUrl.trim()];
      updateBannerMutation.mutate({
        position: activeTab,
        images: updatedImages,
        imageUrls: currentBanner?.imageUrls || [],
        clickUrl: currentBanner?.clickUrl,
        rotationInterval: currentBanner?.rotationInterval || 7000,
        isActive: currentBanner?.isActive ?? true
      });
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = (currentBanner?.images || []).filter((_: string, i: number) => i !== index);
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
      imageUrls: currentBanner?.imageUrls || [],
      clickUrl: url,
      rotationInterval: currentBanner?.rotationInterval || 7000,
      isActive: currentBanner?.isActive ?? true
    });
  };

  const updateImageUrl = (imageIndex: number, url: string) => {
    const updatedUrls = [...(currentBanner?.imageUrls || [])];
    // Ensure array is long enough
    while (updatedUrls.length <= imageIndex) {
      updatedUrls.push('');
    }
    updatedUrls[imageIndex] = url;
    
    updateBannerMutation.mutate({
      position: activeTab,
      images: currentBanner?.images || [],
      imageUrls: updatedUrls,
      clickUrl: currentBanner?.clickUrl,
      rotationInterval: currentBanner?.rotationInterval || 7000,
      isActive: currentBanner?.isActive ?? true
    });
  };

  const updateRotationInterval = (interval: number) => {
    updateBannerMutation.mutate({
      position: activeTab,
      images: currentBanner?.images || [],
      imageUrls: currentBanner?.imageUrls || [],
      clickUrl: currentBanner?.clickUrl,
      rotationInterval: interval,
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
    toast({
      title: "Configuration Saved",
      description: `${activeTab === 'left' ? 'Left' : 'Right'} banner configuration updated successfully! Changes are immediately visible on the website.`,
    });
  };

  const currentImageCount = currentBanner?.images?.length || 0;

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ImageIcon className="h-5 w-5" />
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
              disabled={updateBannerMutation.isPending}
            />
          </div>

          {/* Click URL Configuration */}
          <div className="space-y-2">
            <Label htmlFor="clickUrl">Fallback Click Destination URL</Label>
            <Input
              id="clickUrl"
              type="url"
              placeholder="https://www.example.com"
              value={currentBanner?.clickUrl || ''}
              onChange={(e) => updateClickUrl(e.target.value)}
              disabled={updateBannerMutation.isPending}
            />
            <p className="text-sm text-gray-500">
              Used when individual image URLs are not set
            </p>
          </div>

          {/* Rotation Timing Configuration */}
          <div className="space-y-2">
            <Label htmlFor="rotationInterval">Image Rotation Timing</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="rotationInterval"
                type="number"
                min="1"
                max="60"
                placeholder="7"
                value={Math.round((currentBanner?.rotationInterval || 7000) / 1000)}
                onChange={(e) => {
                  const seconds = parseInt(e.target.value) || 7;
                  updateRotationInterval(seconds * 1000);
                }}
                disabled={updateBannerMutation.isPending}
                className="w-20"
              />
              <span className="text-sm text-gray-600">seconds</span>
              <Button
                onClick={() => updateRotationInterval(0)}
                variant="outline"
                size="sm"
                disabled={updateBannerMutation.isPending}
                className="text-blue-600 hover:text-blue-700"
              >
                Static (No Rotation)
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              {currentBanner?.rotationInterval === 0 ? 
                '🔒 Images will not rotate automatically' : 
                `🔄 Images rotate every ${Math.round((currentBanner?.rotationInterval || 7000) / 1000)} seconds`
              }
            </p>
          </div>

          {/* Image Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Banner Images ({currentImageCount}/10)</Label>
              <span className="text-sm text-gray-500">
                {currentBanner?.rotationInterval === 0 ? 
                  '🔒 Static (No rotation)' : 
                  `🔄 Rotates every ${Math.round((currentBanner?.rotationInterval || 7000) / 1000)} seconds`
                }
              </span>
            </div>

            {/* Drag and Drop Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              } ${currentImageCount >= 10 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => currentImageCount < 10 && fileInputRef.current?.click()}
            >
              {isUploading ? (
                <div className="space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  <p className="text-sm text-gray-600">Uploading images...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">
                      Drop images here or click to upload
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB each • {10 - currentImageCount} slots available
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              disabled={currentImageCount >= 10 || isUploading}
            />

            {/* Add Image by URL */}
            <div className="flex space-x-2">
              <Input
                placeholder="Or enter image URL"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addImage()}
                disabled={currentImageCount >= 10 || updateBannerMutation.isPending}
              />
              <Button
                onClick={addImage}
                disabled={!newImageUrl.trim() || currentImageCount >= 10 || updateBannerMutation.isPending}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Image List with Individual URLs */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {(currentBanner?.images || []).map((image: string, index: number) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start space-x-3">
                    {/* Image Thumbnail */}
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded overflow-hidden border">
                      <img 
                        src={image} 
                        alt={`Banner ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAxMkMxNC44OTU0IDEyIDEyIDEyIDEyIDEyQzEyIDEyIDEyIDEzLjEwNDYgMTIgMTRDMTIgMTQuODk1NCAxMi44OTU0IDE2IDE0IDE2QzE1LjEwNDYgMTYgMTYgMTUuMTA0NiAxNiAxNEMxNiAxMy4xMDQ2IDE2IDEyIDE2IDEyWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTIgMjBIMjBMMTggMTZMMTYgMThMMTQgMTZMMTIgMjBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                        }}
                      />
                    </div>
                    
                    {/* Image Details and URL Input */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Image #{index + 1}
                        </span>
                        <Button
                          onClick={() => removeImage(index)}
                          variant="outline"
                          size="sm"
                          disabled={updateBannerMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Image URL (truncated display) */}
                      <div className="text-xs text-gray-500 font-mono truncate bg-white px-2 py-1 rounded border">
                        {image}
                      </div>
                      
                      {/* Individual Destination URL Input */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-600">
                          Click Destination URL for this image:
                        </Label>
                        <Input
                          type="url"
                          placeholder="https://www.example.com (optional)"
                          value={currentBanner?.imageUrls?.[index] || ''}
                          onChange={(e) => updateImageUrl(index, e.target.value)}
                          disabled={updateBannerMutation.isPending}
                          className="text-sm"
                        />
                        {currentBanner?.imageUrls?.[index] && (
                          <p className="text-xs text-green-600">
                            ✓ Individual URL set
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {currentImageCount === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No images configured. Banner will show "Available for Rent" placeholder.
                </p>
              )}
            </div>
          </div>

          {/* Save Button */}
          <Button 
            onClick={saveConfiguration} 
            className="w-full"
            disabled={updateBannerMutation.isPending}
          >
            {updateBannerMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Configuration
          </Button>

          {/* Configuration Status */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
              <div className="text-green-800 font-medium">Database Configuration</div>
            </div>
            <div className="text-sm text-green-600 space-y-1">
              <div>Position: {activeTab}</div>
              <div>Status: {currentBanner?.isActive ? 'Active' : 'Inactive'}</div>
              <div>Images: {currentImageCount}/10</div>
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