import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogoFetching } from '@/hooks/useLogoFetching';
import { 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star, 
  AlertTriangle,
  Shield,
  Loader
} from 'lucide-react';

export function LogoFetchingPanel() {
  const {
    stats,
    isLoadingStats,
    startFetching,
    isFetching,
    startImageFetching,
    isImageFetching,
    startAudit,
    isAuditing,
    takedownLogo,
    isTakingDown
  } = useLogoFetching();

  const [batchSize, setBatchSize] = useState(10);
  const [takedownCompanyId, setTakedownCompanyId] = useState('');

  if (isLoadingStats) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader className="h-6 w-6 animate-spin mr-2" />
            <span>Loading logo statistics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = stats ? Math.round((stats.fetched / stats.total) * 100) : 0;

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Statistics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-blue-600" />
            <span>Logo Fetching Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Companies</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.fetched}</div>
                  <div className="text-sm text-gray-600 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Fetched
                  </div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-sm text-gray-600 flex items-center justify-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Pending
                  </div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                  <div className="text-sm text-gray-600 flex items-center justify-center">
                    <XCircle className="h-4 w-4 mr-1" />
                    Failed
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progressPercentage}% completed</span>
                </div>
                <Progress value={progressPercentage} className="w-full" />
              </div>

              {/* Quality Distribution */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Logo Quality Distribution</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <Star className="h-3 w-3 mr-1" />
                      High: {stats.highQuality}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <Badge variant="secondary">
                      Medium: {stats.mediumQuality}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline">
                      Low: {stats.lowQuality}
                    </Badge>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <span>Logo Management Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Batch Fetching */}
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <Label htmlFor="batchSize">Batch Size</Label>
              <Input
                id="batchSize"
                type="number"
                min="1"
                max="50"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value) || 10)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of companies to process per batch (1-50)
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => startFetching(batchSize)}
                disabled={isFetching}
                className="px-6"
              >
                {isFetching ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Fetching Logos...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Fetch Logos
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => startImageFetching(batchSize)}
                disabled={isImageFetching}
                variant="outline"
                className="px-6"
              >
                {isImageFetching ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Getting Images...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Fetch Website Images
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quality Audit */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Quality Audit</h4>
                <p className="text-sm text-gray-600">
                  Check all fetched logos for broken links and quality issues
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => startAudit()}
                disabled={isAuditing}
              >
                {isAuditing ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Auditing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Start Audit
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Takedown Mechanism */}
          <div className="border-t pt-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                  Logo Takedown
                </h4>
                <p className="text-sm text-gray-600">
                  Remove a company logo in response to trademark owner requests
                </p>
              </div>
              <div className="flex items-end space-x-4">
                <div className="flex-1">
                  <Label htmlFor="takedownId">Company ID</Label>
                  <Input
                    id="takedownId"
                    type="number"
                    placeholder="Enter company ID"
                    value={takedownCompanyId}
                    onChange={(e) => setTakedownCompanyId(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (takedownCompanyId) {
                      takedownLogo(parseInt(takedownCompanyId), 'trademark_request');
                      setTakedownCompanyId('');
                    }
                  }}
                  disabled={isTakingDown || !takedownCompanyId}
                >
                  {isTakingDown ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Remove Logo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {(isFetching || isImageFetching || isAuditing) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Loader className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-blue-800">
                  {isFetching && "Logo fetching is in progress..."}
                  {isImageFetching && "Website image fetching is in progress..."}
                  {isAuditing && "Quality audit is running..."}
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                This process runs in the background. Statistics will update automatically.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}