import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Eye, MousePointer, BarChart3, Calendar, Image, Activity } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface AdPerformanceStats {
  totalImpressions: number;
  totalViews: number;
  totalClicks: number;
  clickThroughRate: number;
  topPerformingImages: { imageUrl: string; clicks: number; impressions: number }[];
  dailyStats: { date: string; clicks: number; views: number; impressions: number }[];
}

interface BannerAd {
  id: number;
  position: string;
  images: string[];
  clickUrl: string;
  isActive: boolean;
  updatedAt: string;
}

export function AdPerformanceDashboard() {
  const [selectedBannerId, setSelectedBannerId] = useState<number | undefined>();
  const [dateRange, setDateRange] = useState('30');

  // Fetch banner ads for selection
  const { data: bannerAds, isLoading: bannersLoading } = useQuery({
    queryKey: ['/api/admin/banner-ads'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch performance statistics
  const { data: performanceStats, isLoading: statsLoading } = useQuery<AdPerformanceStats>({
    queryKey: ['/api/admin/ad-performance', selectedBannerId],
    refetchInterval: 10000, // Refresh every 10 seconds for real-time data
  });

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return num.toFixed(2) + '%';
  };

  // Prepare chart data
  const chartData = performanceStats?.dailyStats?.map(stat => ({
    ...stat,
    date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })) || [];

  // Color scheme for charts
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (bannersLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 animate-spin" />
          <span>Loading ad performance data...</span>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-32 bg-gray-100 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold">Ad Performance Dashboard</h2>
          <p className="text-gray-600 mt-2">Monitor your banner ad performance and engagement metrics</p>
        </div>
        <div className="flex space-x-4">
          <Select value={selectedBannerId?.toString() || 'all'} onValueChange={(value) => setSelectedBannerId(value === 'all' ? undefined : parseInt(value))}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select banner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Banners</SelectItem>
              {bannerAds?.map((banner: BannerAd) => (
                <SelectItem key={banner.id} value={banner.id.toString()}>
                  {banner.position} Banner #{banner.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(performanceStats?.totalImpressions || 0)}</div>
            <p className="text-xs text-gray-600 mt-1">
              Times ads were displayed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(performanceStats?.totalViews || 0)}</div>
            <p className="text-xs text-gray-600 mt-1">
              Unique ad views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(performanceStats?.totalClicks || 0)}</div>
            <p className="text-xs text-gray-600 mt-1">
              Ad clicks generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
            {(performanceStats?.clickThroughRate || 0) >= 2.0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(performanceStats?.clickThroughRate || 0)}</div>
            <p className="text-xs text-gray-600 mt-1">
              {(performanceStats?.clickThroughRate || 0) >= 2.0 ? 'Above average' : 'Below average'} performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Performance Over Time</TabsTrigger>
          <TabsTrigger value="images">Top Images</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends (Last 30 Days)</CardTitle>
              <CardDescription>Track impressions, views, and clicks over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(label) => `Date: ${label}`}
                      formatter={(value, name) => [formatNumber(value as number), name]}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="impressions" stroke="#3B82F6" strokeWidth={2} name="Impressions" />
                    <Line type="monotone" dataKey="views" stroke="#10B981" strokeWidth={2} name="Views" />
                    <Line type="monotone" dataKey="clicks" stroke="#F59E0B" strokeWidth={2} name="Clicks" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Performance Comparison</CardTitle>
              <CardDescription>Bar chart showing daily performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [formatNumber(value as number), name]}
                    />
                    <Legend />
                    <Bar dataKey="impressions" fill="#3B82F6" name="Impressions" />
                    <Bar dataKey="views" fill="#10B981" name="Views" />
                    <Bar dataKey="clicks" fill="#F59E0B" name="Clicks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Images</CardTitle>
              <CardDescription>Images ranked by click performance</CardDescription>
            </CardHeader>
            <CardContent>
              {performanceStats?.topPerformingImages.length ? (
                <div className="space-y-4">
                  {performanceStats.topPerformingImages.map((image, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <Badge variant="outline" className="text-sm font-semibold">
                        #{index + 1}
                      </Badge>
                      <div className="flex-shrink-0">
                        <img 
                          src={image.imageUrl} 
                          alt={`Banner ${index + 1}`}
                          className="w-20 h-12 object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{formatNumber(image.clicks)} clicks</p>
                            <p className="text-xs text-gray-600">{formatNumber(image.impressions)} impressions</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">
                              {image.impressions > 0 ? formatPercentage((image.clicks / image.impressions) * 100) : '0%'} CTR
                            </Badge>
                          </div>
                        </div>
                        <Progress 
                          value={(image.clicks / Math.max(...performanceStats.topPerformingImages.map(i => i.clicks))) * 100} 
                          className="mt-2 h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Image className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="text-gray-600 mt-2">No performance data available yet</p>
                  <p className="text-sm text-gray-500">Data will appear once users interact with your banner ads</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>Breakdown of user interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Impression Rate</span>
                    <span className="font-medium">100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">View Rate</span>
                    <span className="font-medium">
                      {performanceStats?.totalImpressions ? 
                        formatPercentage((performanceStats.totalViews / performanceStats.totalImpressions) * 100) : 
                        '0%'
                      }
                    </span>
                  </div>
                  <Progress 
                    value={performanceStats?.totalImpressions ? (performanceStats.totalViews / performanceStats.totalImpressions) * 100 : 0} 
                    className="h-2" 
                  />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Click Rate</span>
                    <span className="font-medium">{formatPercentage(performanceStats?.clickThroughRate || 0)}</span>
                  </div>
                  <Progress 
                    value={performanceStats?.clickThroughRate || 0} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>AI-powered recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(performanceStats?.clickThroughRate || 0) < 1.0 && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800">
                        💡 Your CTR is below average. Consider updating your banner images or adjusting placement.
                      </p>
                    </div>
                  )}
                  
                  {(performanceStats?.clickThroughRate || 0) >= 2.0 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✅ Excellent performance! Your ads are engaging users effectively.
                      </p>
                    </div>
                  )}
                  
                  {(performanceStats?.totalImpressions || 0) < 100 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        📈 Low impression count. Your ads are just getting started!
                      </p>
                    </div>
                  )}

                  {performanceStats?.topPerformingImages.length === 0 && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-700">
                        🎯 Upload multiple banner images to compare performance and optimize your campaigns.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}