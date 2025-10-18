import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, AlertCircle, Loader2, Lock, Database, RefreshCw, MapPin } from 'lucide-react';

interface DatabaseStats {
  continents: number;
  regions: number;
  countries: number;
  sectors: number;
  industries: number;
  companies: number;
}

interface SyncResult {
  success: boolean;
  message: string;
  preSync?: DatabaseStats;
  postSync?: DatabaseStats;
  imported?: {
    continents: number;
    regions: number;
    countries: number;
    sectors: number;
    industries: number;
    companies: number;
  };
  duration?: string;
  error?: string;
  errors?: string[];
}

interface StatusResponse {
  success: boolean;
  stats: DatabaseStats;
  expectedStats: DatabaseStats;
  inSync: boolean;
}

interface GeocodingResult {
  success: boolean;
  message: string;
  results?: {
    totalCompanies: number;
    matchedCompanies: number;
    unmatchedCompanies: number;
    matchRate: string;
  };
  error?: string;
}

export default function AdminSyncPage() {
  const [adminSecret, setAdminSecret] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);

  const [geocodingResult, setGeocodingResult] = useState<GeocodingResult | null>(null);
  const [geocodingLoading, setGeocodingLoading] = useState(false);

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminSecret.trim()) {
      setAuthError('Please enter admin secret');
      return;
    }

    setStatusLoading(true);
    setAuthError('');

    try {
      // Validate the secret by checking status endpoint
      const response = await fetch(`/api/admin/sync-status?secret=${encodeURIComponent(adminSecret)}`);
      
      if (!response.ok) {
        const data = await response.json();
        setAuthError(data.message || 'Invalid admin secret');
        setStatusLoading(false);
        return;
      }

      // Secret is valid, proceed to authenticated state
      setAuthenticated(true);
      setStatusLoading(false);
    } catch (error: any) {
      setAuthError('Authentication failed: ' + (error.message || 'Unknown error'));
      setStatusLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setStatusLoading(true);
    try {
      const response = await fetch(`/api/admin/sync-status?secret=${encodeURIComponent(adminSecret)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to check status');
      }
      
      setStatus(data);
    } catch (error: any) {
      // Show actual error instead of fake data
      setStatus(null);
      alert(`Status check failed: ${error.message}\n\nPlease verify your admin secret is correct.`);
      console.error('Status check error:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSyncDatabase = async () => {
    if (!confirm('This will synchronize the production database with development data. Continue?')) {
      return;
    }

    setSyncLoading(true);
    setSyncResult(null);

    try {
      const response = await fetch('/api/admin/sync-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: adminSecret }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Sync failed');
      }

      setSyncResult(data);
      
      // Refresh status after successful sync
      if (data.success) {
        setTimeout(handleCheckStatus, 1000);
      }
    } catch (error: any) {
      setSyncResult({
        success: false,
        message: 'Sync failed',
        error: error.message,
      });
    } finally {
      setSyncLoading(false);
    }
  };

  const handleFixGeocoding = async () => {
    setGeocodingLoading(true);
    setGeocodingResult(null);

    try {
      const response = await fetch(`/api/admin/fix-geocoding?secret=${encodeURIComponent(adminSecret)}`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Geocoding fix failed');
      }

      setGeocodingResult(data);
    } catch (error: any) {
      setGeocodingResult({
        success: false,
        message: 'Geocoding fix failed',
        error: error.message,
      });
    } finally {
      setGeocodingLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <Lock className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Admin Access Required</CardTitle>
            <CardDescription className="text-center">
              Enter your admin secret to access the database synchronization panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuthenticate} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Admin Secret"
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  className="text-center"
                  data-testid="input-admin-secret"
                />
              </div>
              
              {authError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={statusLoading} data-testid="button-authenticate">
                {statusLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Authenticate
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Database Synchronization Panel
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage production database synchronization and geocoding
          </p>
        </div>

        {/* Database Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Status
                </CardTitle>
                <CardDescription>Current production database statistics</CardDescription>
              </div>
              <Button 
                onClick={handleCheckStatus} 
                disabled={statusLoading}
                variant="outline"
                data-testid="button-check-status"
              >
                {statusLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Check Status
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {status ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {status.inSync ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      In Sync
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="mr-1 h-3 w-3" />
                      Out of Sync
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(status.stats).map(([key, value]) => {
                    const expected = status.expectedStats[key as keyof DatabaseStats];
                    const isCorrect = value === expected;
                    
                    return (
                      <div key={key} className="space-y-1 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                          {key}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {value}
                          </span>
                          {isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          Expected: {expected}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Click "Check Status" to see current database statistics
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Sync Database Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Synchronize Database
            </CardTitle>
            <CardDescription>
              Replace production database with clean development data (7,487 companies, 200 countries)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This operation will replace ALL production data with clean development data. 
                The process is transaction-safe and will rollback automatically if any error occurs.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleSyncDatabase} 
              disabled={syncLoading}
              size="lg"
              className="w-full"
              data-testid="button-sync-database"
            >
              {syncLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Synchronizing... (This may take 3-4 minutes)
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Sync Production Database
                </>
              )}
            </Button>

            {syncLoading && (
              <div className="space-y-2">
                <Progress value={undefined} className="w-full" />
                <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                  Processing database synchronization...
                </p>
              </div>
            )}

            {syncResult && (
              <Alert variant={syncResult.success ? "default" : "destructive"}>
                {syncResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-semibold">{syncResult.message}</div>
                    
                    {syncResult.success && syncResult.preSync && syncResult.postSync && (
                      <div className="space-y-2 mt-3">
                        <Separator />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium mb-2">Before Sync:</div>
                            <div className="space-y-1">
                              <div>Companies: {syncResult.preSync.companies}</div>
                              <div>Countries: {syncResult.preSync.countries}</div>
                              <div>Industries: {syncResult.preSync.industries}</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium mb-2">After Sync:</div>
                            <div className="space-y-1">
                              <div>Companies: {syncResult.postSync.companies}</div>
                              <div>Countries: {syncResult.postSync.countries}</div>
                              <div>Industries: {syncResult.postSync.industries}</div>
                            </div>
                          </div>
                        </div>
                        {syncResult.duration && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Duration: {syncResult.duration}
                          </div>
                        )}
                      </div>
                    )}

                    {(syncResult.error || syncResult.errors) && (
                      <div className="mt-2 space-y-1">
                        {syncResult.error && (
                          <div className="text-sm text-red-600 dark:text-red-400 font-mono">
                            Error: {syncResult.error}
                          </div>
                        )}
                        {syncResult.errors && syncResult.errors.length > 0 && (
                          <div className="text-sm text-red-600 dark:text-red-400 font-mono space-y-1">
                            {syncResult.errors.map((err, idx) => (
                              <div key={idx}>• {err}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Fix Geocoding Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Fix Geocoding
            </CardTitle>
            <CardDescription>
              Match all companies to their geographic locations (run after sync)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Run this after database synchronization to ensure all companies are properly geocoded to countries.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleFixGeocoding} 
              disabled={geocodingLoading}
              size="lg"
              className="w-full"
              variant="secondary"
              data-testid="button-fix-geocoding"
            >
              {geocodingLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fixing Geocoding...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Fix Geocoding
                </>
              )}
            </Button>

            {geocodingLoading && (
              <div className="space-y-2">
                <Progress value={undefined} className="w-full" />
                <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                  Matching companies to countries...
                </p>
              </div>
            )}

            {geocodingResult && (
              <Alert variant={geocodingResult.success ? "default" : "destructive"}>
                {geocodingResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-semibold">{geocodingResult.message}</div>
                    
                    {geocodingResult.success && geocodingResult.results && (
                      <div className="space-y-2 mt-3">
                        <Separator />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium">Match Rate:</div>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {geocodingResult.results.matchRate}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">Results:</div>
                            <div className="space-y-1">
                              <div>Matched: {geocodingResult.results.matchedCompanies}</div>
                              <div>Unmatched: {geocodingResult.results.unmatchedCompanies}</div>
                              <div>Total: {geocodingResult.results.totalCompanies}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {geocodingResult.error && (
                      <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                        Error: {geocodingResult.error}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex gap-2">
              <span className="font-semibold text-gray-900 dark:text-white">Step 1:</span>
              <span>Click "Check Status" to see current production database state</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-gray-900 dark:text-white">Step 2:</span>
              <span>If out of sync, click "Sync Production Database" (takes 3-4 minutes)</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-gray-900 dark:text-white">Step 3:</span>
              <span>After successful sync, click "Fix Geocoding" to ensure 100% match rate</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-gray-900 dark:text-white">Step 4:</span>
              <span>Click "Check Status" again to verify everything is in sync</span>
            </div>
            <Separator className="my-2" />
            <div className="text-xs text-gray-500 dark:text-gray-500">
              All operations are transaction-safe and will automatically rollback on errors.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
