import { useState } from "react";
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
  const [leftConfig, setLeftConfig] = useState<BannerAdConfig>(LEFT_BANNER_ADS);
  const [rightConfig, setRightConfig] = useState<BannerAdConfig>(RIGHT_BANNER_ADS);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [activeTab, setActiveTab] = useState<'left' | 'right'>('left');

  const currentConfig = activeTab === 'left' ? leftConfig : rightConfig;
  const setCurrentConfig = activeTab === 'left' ? setLeftConfig : setRightConfig;

  const addImage = () => {
    if (newImageUrl.trim() && currentConfig.images.length < 10) {
      setCurrentConfig({
        ...currentConfig,
        images: [...currentConfig.images, newImageUrl.trim()]
      });
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setCurrentConfig({
      ...currentConfig,
      images: currentConfig.images.filter((_, i) => i !== index)
    });
  };

  const updateClickUrl = (url: string) => {
    setCurrentConfig({
      ...currentConfig,
      clickUrl: url
    });
  };

  const toggleActive = (isActive: boolean) => {
    setCurrentConfig({
      ...currentConfig,
      isActive
    });
  };

  const saveConfiguration = () => {
    // In a real application, you would save this to your backend
    alert(`${activeTab === 'left' ? 'Left' : 'Right'} banner configuration saved!\n\nTo apply changes:\n1. Update the bannerAds.ts config file\n2. Redeploy your application`);
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
              {currentConfig.isActive ? (
                <Eye className="h-5 w-5 text-green-600" />
              ) : (
                <EyeOff className="h-5 w-5 text-gray-400" />
              )}
              <span className="font-medium">
                {currentConfig.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <Switch
              checked={currentConfig.isActive}
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
              value={currentConfig.clickUrl || ''}
              onChange={(e) => updateClickUrl(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Where users go when they click the banner
            </p>
          </div>

          {/* Image Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Banner Images ({currentConfig.images.length}/10)</Label>
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
                disabled={currentConfig.images.length >= 10}
              />
              <Button
                onClick={addImage}
                disabled={!newImageUrl.trim() || currentConfig.images.length >= 10}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Image List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {currentConfig.images.map((image, index) => (
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
              
              {currentConfig.images.length === 0 && (
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

          {/* Configuration Code Preview */}
          <div className="mt-6 p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm overflow-x-auto">
            <div className="text-gray-400 mb-2">// Configuration to copy to bannerAds.ts:</div>
            <pre>{`export const ${activeTab.toUpperCase()}_BANNER_ADS = {
  id: '${currentConfig.id}',
  name: '${currentConfig.name}',
  images: [
${currentConfig.images.map(img => `    '${img}'`).join(',\n')}
  ],
  clickUrl: '${currentConfig.clickUrl || ''}',
  isActive: ${currentConfig.isActive}
};`}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}