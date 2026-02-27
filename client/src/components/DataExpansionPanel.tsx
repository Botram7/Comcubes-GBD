import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Database,
  Sparkles,
  Globe,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MapPin,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface GapInfo {
  industryName: string;
  sectorName: string;
  currentCount: number;
  maxSlots: number;
  gap: number;
}

interface DescriptionStats {
  totalCompanies: number;
  withDescription: number;
  withoutDescription: number;
  percentComplete: number;
}

interface CacheStats {
  totalEntries: number;
  totalHits: number;
  activeEntries: number;
  expiredEntries: number;
  hitRate: string;
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-red-800">Error</p>
        <p className="text-sm text-red-700">{message}</p>
      </div>
    </div>
  );
}

function WarningBanner({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-yellow-800">Warnings ({messages.length})</p>
        <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
          {messages.slice(0, 10).map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
          {messages.length > 10 && <li>...and {messages.length - 10} more</li>}
        </ul>
      </div>
    </div>
  );
}

function InfoBanner({ message }: { message: string }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
      <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
      <p className="text-sm text-blue-700">{message}</p>
    </div>
  );
}

export function DataExpansionPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<'overview' | 'ai-generator' | 'descriptions' | 'wikidata' | 'cache'>('overview');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [geoTarget, setGeoTarget] = useState<string>('');
  const [generatingIndustry, setGeneratingIndustry] = useState<string>('');
  const [generatingSector, setGeneratingSector] = useState<string>('');
  const [generatedResults, setGeneratedResults] = useState<any[]>([]);
  const [generationErrors, setGenerationErrors] = useState<string[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [wikidataQuery, setWikidataQuery] = useState({ industryName: '', countryCode: '', continentName: '' });

  const { data: gapsData } = useQuery<{ totalIndustries: number; industriesWithGaps: number; gaps: GapInfo[] }>({
    queryKey: ['/api/admin/ai-generator/gaps'],
  });
  const gaps = gapsData?.gaps;

  const { data: descStats, refetch: refetchDescStats } = useQuery<DescriptionStats>({
    queryKey: ['/api/admin/descriptions/stats'],
  });

  const { data: cacheStats } = useQuery<CacheStats>({
    queryKey: ['/api/admin/search-cache/stats'],
  });

  const { data: sectors } = useQuery<any[]>({
    queryKey: ['/api/sectors'],
  });

  const generateMutation = useMutation({
    mutationFn: async (params: { industryName: string; sectorName: string; geographicFocus?: string; count?: number }) => {
      const response = await apiRequest('POST', '/api/admin/ai-generator/generate', params);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedResults(data.generated || []);
      setGenerationErrors(data.errors || []);
      const count = data.generated?.length || 0;
      toast({
        title: count > 0 ? 'Generation complete' : 'No companies generated',
        description: count > 0
          ? `Generated ${count} company suggestions for "${data.industryName}"`
          : `${data.errors?.join('; ') || 'No results returned'}`,
        variant: count > 0 ? 'default' : 'destructive',
      });
    },
    onError: (error: Error) => {
      setGenerationErrors([error.message]);
      toast({ title: 'Generation failed', description: error.message, variant: 'destructive' });
    },
  });

  const enrichMutation = useMutation({
    mutationFn: async (batchSize: number) => {
      const response = await apiRequest('POST', '/api/admin/descriptions/enrich-batch', { batchSize });
      return response.json();
    },
    onSuccess: (data) => {
      const successCount = data.results?.filter((r: any) => r.success).length || 0;
      const failCount = data.results?.filter((r: any) => !r.success).length || 0;
      refetchDescStats();
      toast({
        title: 'Enrichment complete',
        description: `Enriched ${successCount} descriptions${failCount > 0 ? `, ${failCount} failed` : ''}, ${data.remaining} remaining`,
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Enrichment failed', description: error.message, variant: 'destructive' });
    },
  });

  const wikidataMutation = useMutation({
    mutationFn: async (params: { industryName: string; countryCode?: string; continentName?: string }) => {
      const queryParams = new URLSearchParams();
      queryParams.set('industryName', params.industryName);
      if (params.countryCode) queryParams.set('countryCode', params.countryCode);
      if (params.continentName) queryParams.set('continentName', params.continentName);
      const response = await apiRequest('GET', `/api/admin/wikidata/search?${queryParams}`);
      return response.json();
    },
    onSuccess: (data) => {
      const count = Array.isArray(data) ? data.length : (data.companies?.length || 0);
      toast({
        title: count > 0 ? 'Wikidata search complete' : 'No results found',
        description: count > 0
          ? `Found ${count} companies from Wikidata`
          : 'No companies matched the search criteria. Try different keywords or a broader geographic scope.',
        variant: count > 0 ? 'default' : 'destructive',
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Wikidata search failed', description: error.message, variant: 'destructive' });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (params: { companies: any[]; industryName: string; sectorName: string }) => {
      const importPayload = params.companies.map(c => ({
        name: c.name,
        websiteUrl: c.websiteUrl || c.website,
        description: c.description || '',
        industryName: params.industryName,
        sectorName: params.sectorName,
        employeeCount: c.employeeCount || '',
        foundedYear: c.foundedYear || null,
        country: c.country || '',
      }));
      const response = await apiRequest('POST', '/api/admin/ai-generator/import', importPayload);
      return response.json();
    },
    onSuccess: (data) => {
      setImportErrors(data.errors || []);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-generator/gaps'] });
      toast({
        title: 'Import complete',
        description: `Imported ${data.imported || 0} companies, ${data.skipped || 0} skipped${data.errors?.length ? `, ${data.errors.length} warnings` : ''}`,
      });
      if ((data.imported || 0) > 0) {
        setGeneratedResults([]);
      }
    },
    onError: (error: Error) => {
      toast({ title: 'Import failed', description: error.message, variant: 'destructive' });
    },
  });

  const totalGaps = gaps?.reduce((sum, g) => sum + g.gap, 0) || 0;
  const industriesWithGaps = gaps?.length || 0;

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Industries with Gaps</p>
                <p className="text-2xl font-bold">{industriesWithGaps}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Total Open Slots</p>
                <p className="text-2xl font-bold">{totalGaps}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Descriptions Done</p>
                <p className="text-2xl font-bold">{descStats?.percentComplete || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-500">Search Cache Hits</p>
                <p className="text-2xl font-bold">{cacheStats?.totalHits || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection('ai-generator')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              AI Company Generator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Generate real company listings using AI for industries with open slots. Supports geographic targeting.
            </p>
            <Badge variant="outline">{totalGaps} slots available</Badge>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection('descriptions')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-purple-500" />
              Description Enrichment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Generate unique AI descriptions for companies. Replaces template descriptions with professional copy.
            </p>
            <Badge variant="outline">{descStats?.withoutDescription || 0} remaining</Badge>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection('wikidata')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-blue-500" />
              Wikidata Import
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Import real company data from Wikidata's free open database. No API key needed.
            </p>
            <Badge variant="outline">Free data source</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAIGenerator = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Company Generator</h3>
        <Button variant="outline" size="sm" onClick={() => setActiveSection('overview')}>
          Back to Overview
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generate Companies for Industry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Select onValueChange={setSelectedSector}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {sectors?.map((s: any) => (
                  <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Geographic focus (e.g., Nigeria, Africa)"
              value={geoTarget}
              onChange={(e) => setGeoTarget(e.target.value)}
            />
            <Button
              onClick={() => {
                if (generatingIndustry) {
                  generateMutation.mutate({
                    industryName: generatingIndustry,
                    sectorName: generatingSector,
                    geographicFocus: geoTarget || undefined,
                    count: 10,
                  });
                }
              }}
              disabled={!generatingIndustry || generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Generate</>
              )}
            </Button>
          </div>
          {generatingIndustry && (
            <p className="text-sm text-gray-600">
              Selected: <span className="font-medium">{generatingIndustry}</span> ({generatingSector})
            </p>
          )}
        </CardContent>
      </Card>

      {generateMutation.isError && (
        <ErrorBanner message={generateMutation.error?.message || 'Generation failed'} />
      )}
      {generationErrors.length > 0 && <WarningBanner messages={generationErrors} />}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Industries with Open Slots ({industriesWithGaps})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Industry</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Gap</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(gaps || [])
                  .filter(g => !selectedSector || selectedSector === 'all' || g.sectorName === selectedSector)
                  .slice(0, 50)
                  .map((gap) => (
                    <TableRow key={gap.industryName} className={generatingIndustry === gap.industryName ? 'bg-blue-50' : ''}>
                      <TableCell className="font-medium text-sm">{gap.industryName}</TableCell>
                      <TableCell className="text-sm text-gray-500">{gap.sectorName}</TableCell>
                      <TableCell><Badge variant="outline">{gap.currentCount}/{gap.maxSlots}</Badge></TableCell>
                      <TableCell><Badge variant="secondary">{gap.gap} open</Badge></TableCell>
                      <TableCell>
                        <Button
                          variant={generatingIndustry === gap.industryName ? "default" : "ghost"}
                          size="sm"
                          onClick={() => {
                            setGeneratingIndustry(gap.industryName);
                            setGeneratingSector(gap.sectorName);
                          }}
                        >
                          {generatingIndustry === gap.industryName ? 'Selected' : 'Select'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {generatedResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Generated Companies ({generatedResults.length})</span>
              <Button
                size="sm"
                onClick={() => {
                  importMutation.mutate({
                    companies: generatedResults,
                    industryName: generatingIndustry,
                    sectorName: generatingSector,
                  });
                }}
                disabled={importMutation.isPending}
              >
                {importMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing...</>
                ) : (
                  <><CheckCircle className="h-4 w-4 mr-2" /> Import All</>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {importErrors.length > 0 && <WarningBanner messages={importErrors} />}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Founded</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generatedResults.map((company: any, i: number) => (
                  <TableRow key={i} className={company.isDuplicate ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell className="text-sm text-blue-600 max-w-48 truncate">{company.websiteUrl || company.website}</TableCell>
                    <TableCell className="text-sm">{company.country || '-'}</TableCell>
                    <TableCell className="text-sm">{company.foundedYear || '-'}</TableCell>
                    <TableCell>
                      {company.isDuplicate ? (
                        <Badge variant="destructive" className="text-xs">Duplicate</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-green-700">New</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderDescriptions = () => {
    const failedResults = enrichMutation.data?.results?.filter((r: any) => !r.success) || [];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">AI Description Enrichment</h3>
          <Button variant="outline" size="sm" onClick={() => setActiveSection('overview')}>
            Back to Overview
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600">{descStats?.totalCompanies || 0}</p>
              <p className="text-sm text-gray-500">Total Companies</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">{descStats?.withDescription || 0}</p>
              <p className="text-sm text-gray-500">With AI Descriptions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-orange-600">{descStats?.withoutDescription || 0}</p>
              <p className="text-sm text-gray-500">Remaining</p>
            </CardContent>
          </Card>
        </div>

        {enrichMutation.isError && (
          <ErrorBanner message={enrichMutation.error?.message || 'Enrichment failed'} />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${descStats?.percentComplete || 0}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mb-4">{descStats?.percentComplete || 0}% complete</p>
            <div className="flex gap-4">
              <Button
                onClick={() => enrichMutation.mutate(10)}
                disabled={enrichMutation.isPending || (descStats?.withoutDescription || 0) === 0}
              >
                {enrichMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enriching...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" /> Enrich 10 Companies</>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => enrichMutation.mutate(25)}
                disabled={enrichMutation.isPending || (descStats?.withoutDescription || 0) === 0}
              >
                Enrich 25 Companies
              </Button>
            </div>
          </CardContent>
        </Card>

        {enrichMutation.data && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Last Batch Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Badge variant="outline" className="text-green-700">
                  {enrichMutation.data.results?.filter((r: any) => r.success).length || 0} succeeded
                </Badge>
                {failedResults.length > 0 && (
                  <Badge variant="destructive">
                    {failedResults.length} failed
                  </Badge>
                )}
              </div>
              {failedResults.length > 0 && (
                <WarningBanner messages={failedResults.map((r: any) => `${r.companyName}: ${r.error}`)} />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const wikidataResults = wikidataMutation.data
    ? (Array.isArray(wikidataMutation.data) ? wikidataMutation.data : (wikidataMutation.data as any).companies || [])
    : [];

  const renderWikidata = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Wikidata Free Data Import</h3>
        <Button variant="outline" size="sm" onClick={() => setActiveSection('overview')}>
          Back to Overview
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search Wikidata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Input
              placeholder="Industry name"
              value={wikidataQuery.industryName}
              onChange={(e) => setWikidataQuery(prev => ({ ...prev, industryName: e.target.value }))}
            />
            <Input
              placeholder="Country code (e.g., NG, ZA)"
              value={wikidataQuery.countryCode}
              onChange={(e) => setWikidataQuery(prev => ({ ...prev, countryCode: e.target.value }))}
            />
            <Select onValueChange={(val) => setWikidataQuery(prev => ({ ...prev, continentName: val }))}>
              <SelectTrigger>
                <SelectValue placeholder="Continent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Continents</SelectItem>
                <SelectItem value="Africa">Africa</SelectItem>
                <SelectItem value="Asia">Asia</SelectItem>
                <SelectItem value="Europe">Europe</SelectItem>
                <SelectItem value="North America">North America</SelectItem>
                <SelectItem value="South America">South America</SelectItem>
                <SelectItem value="Oceania">Oceania</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => wikidataMutation.mutate({
                industryName: wikidataQuery.industryName,
                countryCode: wikidataQuery.countryCode || undefined,
                continentName: wikidataQuery.continentName === 'all' ? undefined : wikidataQuery.continentName || undefined,
              })}
              disabled={!wikidataQuery.industryName || wikidataMutation.isPending}
            >
              {wikidataMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Searching...</>
              ) : (
                <><Globe className="h-4 w-4 mr-2" /> Search</>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            <MapPin className="h-3 w-3 inline mr-1" />
            Wikidata is completely free. Queries their open SPARQL endpoint — no API key needed. Supports multilingual results.
          </p>
        </CardContent>
      </Card>

      {wikidataMutation.isError && (
        <ErrorBanner message={wikidataMutation.error?.message || 'Wikidata search failed'} />
      )}

      {wikidataMutation.isSuccess && wikidataResults.length === 0 && (
        <InfoBanner message="No companies found matching the search criteria. Try different keywords, a broader industry term, or change the geographic scope." />
      )}

      {wikidataResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Wikidata Results ({wikidataResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Founded</TableHead>
                    <TableHead>Employees</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wikidataResults.map((company: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{company.name || company.companyName}</TableCell>
                      <TableCell className="text-sm text-blue-600 max-w-48 truncate">{company.websiteUrl || company.website || '-'}</TableCell>
                      <TableCell className="text-sm">{company.country || '-'}</TableCell>
                      <TableCell className="text-sm">{company.foundedYear || '-'}</TableCell>
                      <TableCell className="text-sm">{company.employeeCount || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCache = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Google Search Cache</h3>
        <Button variant="outline" size="sm" onClick={() => setActiveSection('overview')}>
          Back to Overview
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{cacheStats?.totalEntries || 0}</p>
            <p className="text-sm text-gray-500">Total Entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{cacheStats?.totalHits || 0}</p>
            <p className="text-sm text-gray-500">Total Hits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{cacheStats?.activeEntries || 0}</p>
            <p className="text-sm text-gray-500">Active Entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{cacheStats?.hitRate || '0%'}</p>
            <p className="text-sm text-gray-500">Hit Rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {activeSection === 'overview' && renderOverview()}
      {activeSection === 'ai-generator' && renderAIGenerator()}
      {activeSection === 'descriptions' && renderDescriptions()}
      {activeSection === 'wikidata' && renderWikidata()}
      {activeSection === 'cache' && renderCache()}
    </div>
  );
}
