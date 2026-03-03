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
  ClipboardList,
  Download,
  ThumbsUp,
  ThumbsDown,
  XCircle,
  ChevronDown,
  ChevronUp,
  Undo2,
  Pencil,
  Save,
  X,
  RefreshCw,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
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
  const [activeSection, setActiveSection] = useState<'overview' | 'ai-generator' | 'descriptions' | 'wikidata' | 'cache' | 'staged'>('overview');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [geoTarget, setGeoTarget] = useState<string>('');
  const [generatingIndustry, setGeneratingIndustry] = useState<string>('');
  const [generatingSector, setGeneratingSector] = useState<string>('');
  const [generatedResults, setGeneratedResults] = useState<any[]>([]);
  const [generationErrors, setGenerationErrors] = useState<string[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isValidatingUrls, setIsValidatingUrls] = useState(false);
  const [selectedForImport, setSelectedForImport] = useState<Set<number>>(new Set());
  const [selectedGapIndustries, setSelectedGapIndustries] = useState<Set<string>>(new Set());
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [wikidataQuery, setWikidataQuery] = useState({ industryName: '', countryCode: '', continentName: '' });
  const [wikidataSelected, setWikidataSelected] = useState<Set<number>>(new Set());
  const [wikidataValidated, setWikidataValidated] = useState<any[]>([]);
  const [isValidatingWikidata, setIsValidatingWikidata] = useState(false);
  const [stagedFilter, setStagedFilter] = useState<{ status: string; source: string }>({ status: '', source: '' });
  const [selectedStagedIds, setSelectedStagedIds] = useState<Set<number>>(new Set());

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

  const stagedQueryParams = new URLSearchParams();
  if (stagedFilter.status) stagedQueryParams.set('status', stagedFilter.status);
  if (stagedFilter.source) stagedQueryParams.set('source', stagedFilter.source);
  const stagedQueryString = stagedQueryParams.toString();

  const { data: stagedCompanies, refetch: refetchStaged } = useQuery<any[]>({
    queryKey: ['/api/admin/staged-companies', stagedQueryString],
    queryFn: async () => {
      const url = stagedQueryString ? `/api/admin/staged-companies?${stagedQueryString}` : '/api/admin/staged-companies';
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch staged companies');
      return res.json();
    },
  });

  const { data: stagedStats } = useQuery<{ total: number; pending: number; approved: number; rejected: number }>({
    queryKey: ['/api/admin/staged-companies/stats'],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('POST', `/api/admin/staged-companies/${id}/approve`);
      return response.json();
    },
    onSuccess: (data) => {
      refetchStaged();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/staged-companies/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-generator/gaps'] });
      toast({ title: data.success ? 'Approved' : 'Issue', description: data.message });
    },
    onError: (error: Error) => {
      toast({ title: 'Approval failed', description: error.message, variant: 'destructive' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('POST', `/api/admin/staged-companies/${id}/reject`);
      return response.json();
    },
    onSuccess: (data) => {
      refetchStaged();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/staged-companies/stats'] });
      toast({ title: 'Rejected', description: data.message });
    },
    onError: (error: Error) => {
      toast({ title: 'Rejection failed', description: error.message, variant: 'destructive' });
    },
  });

  const bulkApproveMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await apiRequest('POST', '/api/admin/staged-companies/approve-bulk', { ids });
      return response.json();
    },
    onSuccess: (data) => {
      setSelectedStagedIds(new Set());
      refetchStaged();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/staged-companies/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-generator/gaps'] });
      toast({ title: 'Bulk approve complete', description: data.message });
    },
    onError: (error: Error) => {
      toast({ title: 'Bulk approve failed', description: error.message, variant: 'destructive' });
    },
  });

  const bulkRejectMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await apiRequest('POST', '/api/admin/staged-companies/reject-bulk', { ids });
      return response.json();
    },
    onSuccess: (data) => {
      setSelectedStagedIds(new Set());
      refetchStaged();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/staged-companies/stats'] });
      toast({ title: 'Bulk reject complete', description: data.message });
    },
    onError: (error: Error) => {
      toast({ title: 'Bulk reject failed', description: error.message, variant: 'destructive' });
    },
  });

  const recategorizeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/staged-companies/recategorize');
      return response.json();
    },
    onSuccess: (data) => {
      refetchStaged();
      toast({ title: 'Re-categorization complete', description: data.message });
    },
    onError: (error: Error) => {
      toast({ title: 'Re-categorization failed', description: error.message, variant: 'destructive' });
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (params: { industryName: string; sectorName: string; geographicFocus?: string; count?: number }) => {
      const response = await apiRequest('POST', '/api/admin/ai-generator/generate', params);
      return response.json();
    },
    onSuccess: async (data) => {
      const generated = data.generated || [];
      setGeneratedResults(generated);
      setGenerationErrors(data.errors || []);
      const count = generated.length;
      toast({
        title: count > 0 ? 'Generation complete' : 'No companies generated',
        description: count > 0
          ? `Generated ${count} company suggestions for "${data.industryName}". Validating URLs...`
          : `${data.errors?.join('; ') || 'No results returned'}`,
        variant: count > 0 ? 'default' : 'destructive',
      });
      if (count > 0) {
        setIsValidatingUrls(true);
        try {
          const valResponse = await apiRequest('POST', '/api/admin/ai-generator/validate-urls', { companies: generated });
          const valData = await valResponse.json();
          const validated = valData.companies || generated;
          setGeneratedResults(validated);
          const reachableCount = validated.filter((c: any) => c.urlReachable).length;
          const deadCount = validated.filter((c: any) => c.urlReachable === false).length;
          const selected = new Set<number>();
          validated.forEach((c: any, i: number) => {
            if (c.urlReachable !== false && !c.isDuplicate) selected.add(i);
          });
          setSelectedForImport(selected);
          toast({
            title: 'URL validation complete',
            description: `${reachableCount} reachable, ${deadCount} dead links${deadCount > 0 ? ' (excluded from import)' : ''}`,
          });
        } catch (err) {
          const allSelected = new Set<number>();
          generated.forEach((_: any, i: number) => allSelected.add(i));
          setSelectedForImport(allSelected);
          toast({ title: 'URL validation skipped', description: 'Could not validate URLs. All companies selected for import.', variant: 'destructive' });
        } finally {
          setIsValidatingUrls(false);
        }
      }
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
    onSuccess: async (data) => {
      const rawResults: any[] = Array.isArray(data) ? data : (data.companies || []);
      const count = rawResults.length;
      setWikidataSelected(new Set());
      setWikidataValidated(rawResults);

      if (count === 0) {
        toast({
          title: 'No results found',
          description: 'No companies matched the search criteria. Try different keywords or a broader geographic scope.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Wikidata search complete',
        description: `Found ${count} companies. Validating URLs...`,
      });

      // Auto-validate URLs, just like AI Generator does
      setIsValidatingWikidata(true);
      try {
        const valResponse = await apiRequest('POST', '/api/admin/ai-generator/validate-urls', { companies: rawResults });
        const valData = await valResponse.json();
        const validated: any[] = valData.companies || rawResults;
        setWikidataValidated(validated);

        // Auto-select: companies that have a website AND it's reachable (or unknown)
        // Auto-deselect: no website OR dead link
        const autoSelected = new Set<number>();
        validated.forEach((c: any, i: number) => {
          const hasWebsite = !!(c.websiteUrl || c.website);
          const isDead = c.urlReachable === false;
          if (hasWebsite && !isDead) autoSelected.add(i);
        });
        setWikidataSelected(autoSelected);

        const reachable = validated.filter((c: any) => c.urlReachable === true).length;
        const dead = validated.filter((c: any) => c.urlReachable === false).length;
        const noSite = validated.filter((c: any) => !(c.websiteUrl || c.website)).length;

        toast({
          title: 'URL validation complete',
          description: `${autoSelected.size} auto-selected · ${reachable} live · ${dead} dead · ${noSite} no website`,
        });
      } catch {
        // Validation failed — auto-select everything that has a website
        const autoSelected = new Set<number>();
        rawResults.forEach((c: any, i: number) => {
          if (c.websiteUrl || c.website) autoSelected.add(i);
        });
        setWikidataSelected(autoSelected);
        toast({ title: 'URL validation skipped', description: `${autoSelected.size} companies with websites auto-selected.`, variant: 'destructive' });
      } finally {
        setIsValidatingWikidata(false);
      }
    },
    onError: (error: Error) => {
      toast({ title: 'Wikidata search failed', description: error.message, variant: 'destructive' });
    },
  });

  const wikidataImportMutation = useMutation({
    mutationFn: async (params: { companies: any[]; searchTerm?: string }) => {
      const response = await apiRequest('POST', '/api/admin/wikidata/import', {
        searchTerm: params.searchTerm,
        selectedCompanies: params.companies,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/staged-companies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/staged-companies/stats'] });
      setWikidataSelected(new Set());
      toast({
        title: 'Staged for review',
        description: `${data.staged || 0} companies added to Staged Imports for review.`,
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Import failed', description: error.message, variant: 'destructive' });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (params: { companies: any[]; industryName: string; sectorName: string }) => {
      const importPayload = params.companies.map(c => ({
        name: c.name,
        websiteUrl: c.websiteUrl || c.website,
        description: c.description || '',
        industryName: c.industryName || params.industryName,
        sectorName: c.sectorName || params.sectorName,
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection('staged')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5 text-amber-500" />
              Staged Imports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Review, approve, reject, or export staged company imports before they go live.
            </p>
            <Badge variant="outline">{stagedStats?.pending || 0} pending review</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Download className="h-5 w-5 text-green-600" />
            Export All Companies Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Download a complete CSV file of all companies in the directory, including their Business Sector, Industry, Country, Website, Employees, and Founded Year. Useful for auditing data quality or offline analysis.
          </p>
          <a href="/api/admin/companies/export-csv" target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export All Companies (CSV)
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  );

  const handleBatchGenerate = async () => {
    if (selectedGapIndustries.size === 0) return;
    const filteredGaps = (gaps || []).filter(g => selectedGapIndustries.has(g.industryName));
    const total = filteredGaps.length;
    let allGenerated: any[] = [];
    let allErrors: string[] = [];
    setBatchProgress({ current: 0, total });
    setGeneratedResults([]);
    setGenerationErrors([]);

    for (let i = 0; i < filteredGaps.length; i++) {
      const gap = filteredGaps[i];
      setBatchProgress({ current: i + 1, total });
      try {
        const response = await apiRequest('POST', '/api/admin/ai-generator/generate', {
          industryName: gap.industryName,
          sectorName: gap.sectorName,
          geographicFocus: geoTarget || undefined,
          count: 10,
        });
        const data = await response.json();
        const generated = (data.generated || []).map((c: any) => ({
          ...c,
          industryName: gap.industryName,
          sectorName: gap.sectorName,
        }));
        allGenerated = [...allGenerated, ...generated];
        if (data.errors?.length) allErrors = [...allErrors, ...data.errors];
      } catch (err: any) {
        allErrors.push(`${gap.industryName}: ${err.message}`);
      }
    }

    setBatchProgress(null);
    setGeneratedResults(allGenerated);
    setGenerationErrors(allErrors);

    const count = allGenerated.length;
    toast({
      title: count > 0 ? `Batch complete — ${count} companies generated` : 'No companies generated',
      description: count > 0 ? `Validating URLs...` : allErrors.join('; ') || 'No results',
      variant: count > 0 ? 'default' : 'destructive',
    });

    if (count > 0) {
      setIsValidatingUrls(true);
      try {
        const valResponse = await apiRequest('POST', '/api/admin/ai-generator/validate-urls', { companies: allGenerated });
        const valData = await valResponse.json();
        const validated = valData.companies || allGenerated;
        setGeneratedResults(validated);
        const reachableCount = validated.filter((c: any) => c.urlReachable).length;
        const deadCount = validated.filter((c: any) => c.urlReachable === false).length;
        const selected = new Set<number>();
        validated.forEach((c: any, i: number) => {
          if (c.urlReachable !== false && !c.isDuplicate) selected.add(i);
        });
        setSelectedForImport(selected);
        toast({ title: 'URL validation complete', description: `${reachableCount} reachable, ${deadCount} dead links` });
      } catch {
        const allSelected = new Set<number>();
        allGenerated.forEach((_: any, i: number) => allSelected.add(i));
        setSelectedForImport(allSelected);
      } finally {
        setIsValidatingUrls(false);
      }
    }
  };

  const renderAIGenerator = () => {
    const filteredGaps = (gaps || []).filter(g => !selectedSector || selectedSector === 'all' || g.sectorName === selectedSector).slice(0, 50);
    const allFilteredSelected = filteredGaps.length > 0 && filteredGaps.every(g => selectedGapIndustries.has(g.industryName));
    const isBatchRunning = batchProgress !== null;

    return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Company Generator</h3>
        <Button variant="outline" size="sm" onClick={() => setActiveSection('overview')}>
          Back to Overview
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generate Companies for Selected Industries</CardTitle>
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
              onClick={handleBatchGenerate}
              disabled={selectedGapIndustries.size === 0 || isBatchRunning || generateMutation.isPending}
            >
              {isBatchRunning ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating {batchProgress?.current}/{batchProgress?.total}...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Generate for {selectedGapIndustries.size} Selected</>
              )}
            </Button>
          </div>
          {selectedGapIndustries.size > 0 && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">{selectedGapIndustries.size}</span> {selectedGapIndustries.size === 1 ? 'industry' : 'industries'} selected for generation
            </p>
          )}
        </CardContent>
      </Card>

      {generationErrors.length > 0 && <WarningBanner messages={generationErrors} />}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Industries with Open Slots ({industriesWithGaps})</span>
            {selectedGapIndustries.size > 0 && (
              <Badge variant="secondary">{selectedGapIndustries.size} selected</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={(e) => {
                        const next = new Set(selectedGapIndustries);
                        if (e.target.checked) {
                          filteredGaps.forEach(g => next.add(g.industryName));
                        } else {
                          filteredGaps.forEach(g => next.delete(g.industryName));
                        }
                        setSelectedGapIndustries(next);
                      }}
                    />
                  </TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Gap</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGaps.map((gap) => (
                  <TableRow
                    key={gap.industryName}
                    className={`cursor-pointer ${selectedGapIndustries.has(gap.industryName) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    onClick={() => {
                      const next = new Set(selectedGapIndustries);
                      if (next.has(gap.industryName)) next.delete(gap.industryName);
                      else next.add(gap.industryName);
                      setSelectedGapIndustries(next);
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedGapIndustries.has(gap.industryName)}
                        onChange={(e) => {
                          const next = new Set(selectedGapIndustries);
                          if (e.target.checked) next.add(gap.industryName);
                          else next.delete(gap.industryName);
                          setSelectedGapIndustries(next);
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-sm">{gap.industryName}</TableCell>
                    <TableCell className="text-sm text-gray-500">{gap.sectorName}</TableCell>
                    <TableCell><Badge variant="outline">{gap.currentCount}/{gap.maxSlots}</Badge></TableCell>
                    <TableCell><Badge variant="secondary">{gap.gap} open</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {isValidatingUrls && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Validating URLs for {generatedResults.length} companies... This may take a moment.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {generatedResults.length > 0 && !isValidatingUrls && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Generated Companies ({generatedResults.length})</span>
              <div className="flex gap-2 items-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    setIsValidatingUrls(true);
                    try {
                      const valResponse = await apiRequest('POST', '/api/admin/ai-generator/validate-urls', { companies: generatedResults });
                      const valData = await valResponse.json();
                      const validated = valData.companies || generatedResults;
                      setGeneratedResults(validated);
                      const reachableCount = validated.filter((c: any) => c.urlReachable).length;
                      const deadCount = validated.filter((c: any) => c.urlReachable === false).length;
                      const selected = new Set<number>();
                      validated.forEach((c: any, i: number) => {
                        if (c.urlReachable !== false && !c.isDuplicate) selected.add(i);
                      });
                      setSelectedForImport(selected);
                      toast({ title: 'URL validation complete', description: `${reachableCount} reachable, ${deadCount} dead links` });
                    } catch {
                      toast({ title: 'Validation failed', variant: 'destructive' });
                    } finally {
                      setIsValidatingUrls(false);
                    }
                  }}
                >
                  Re-validate URLs
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const selectedCompanies = generatedResults.filter((_: any, i: number) => selectedForImport.has(i));
                    if (selectedCompanies.length === 0) {
                      toast({ title: 'No companies selected', description: 'Select at least one company to import.', variant: 'destructive' });
                      return;
                    }
                    importMutation.mutate({
                      companies: selectedCompanies,
                      industryName: generatingIndustry,
                      sectorName: generatingSector,
                    });
                  }}
                  disabled={importMutation.isPending || selectedForImport.size === 0}
                >
                  {importMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing...</>
                  ) : (
                    <><CheckCircle className="h-4 w-4 mr-2" /> Import Selected ({selectedForImport.size})</>
                  )}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {importErrors.length > 0 && <WarningBanner messages={importErrors} />}

            {generatedResults.some((c: any) => c.urlReachable === false) && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                Companies with dead links are automatically excluded from import. You can manually select them if needed.
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      checked={selectedForImport.size === generatedResults.length && generatedResults.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedForImport(new Set(generatedResults.map((_: any, i: number) => i)));
                        } else {
                          setSelectedForImport(new Set());
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Founded</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generatedResults.map((company: any, i: number) => (
                  <TableRow key={i} className={`${company.isDuplicate ? 'opacity-50' : ''} ${company.urlReachable === false ? 'bg-red-50/50' : ''}`}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedForImport.has(i)}
                        onChange={(e) => {
                          const next = new Set(selectedForImport);
                          if (e.target.checked) next.add(i);
                          else next.delete(i);
                          setSelectedForImport(next);
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell className="text-sm text-blue-600 max-w-40 truncate">
                      <a href={company.websiteUrl || company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {company.websiteUrl || company.website}
                      </a>
                    </TableCell>
                    <TableCell>
                      {company.urlReachable === true ? (
                        <Badge variant="outline" className="text-xs text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Live</Badge>
                      ) : company.urlReachable === false ? (
                        <Badge variant="destructive" className="text-xs"><XCircle className="h-3 w-3 mr-1" />Dead</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-gray-500">Unknown</Badge>
                      )}
                    </TableCell>
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
  };

  const EnrichmentResultsTable = ({ results }: { results: any[] }) => {
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    const [revertedIds, setRevertedIds] = useState<Set<number>>(new Set());
    const [savedEdits, setSavedEdits] = useState<Record<number, string>>({});

    const successCount = results.filter((r: any) => r.success).length;
    const failCount = results.filter((r: any) => !r.success).length;

    const toggleExpand = (id: number) => {
      setExpandedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };

    const startEdit = (r: any) => {
      setEditingId(r.companyId);
      setEditText(savedEdits[r.companyId] ?? r.description);
    };

    const cancelEdit = () => {
      setEditingId(null);
      setEditText('');
    };

    const revertMutation = useMutation({
      mutationFn: async ({ companyId, previousDescription }: { companyId: number; previousDescription: string }) => {
        const response = await apiRequest('POST', `/api/admin/descriptions/revert/${companyId}`, { previousDescription });
        return response.json();
      },
      onSuccess: (_data, variables) => {
        setRevertedIds(prev => new Set(prev).add(variables.companyId));
        toast({ title: 'Reverted', description: `Description restored for company ${variables.companyId}` });
        refetchDescStats();
      },
      onError: (error: any) => {
        toast({ title: 'Revert failed', description: error.message, variant: 'destructive' });
      },
    });

    const updateMutation = useMutation({
      mutationFn: async ({ companyId, description }: { companyId: number; description: string }) => {
        const response = await apiRequest('PATCH', `/api/admin/descriptions/update/${companyId}`, { description });
        return response.json();
      },
      onSuccess: (_data, variables) => {
        setSavedEdits(prev => ({ ...prev, [variables.companyId]: variables.description }));
        setEditingId(null);
        setEditText('');
        toast({ title: 'Saved', description: `Description updated for company ${variables.companyId}` });
      },
      onError: (error: any) => {
        toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      },
    });

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Last Batch Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Badge variant="outline" className="text-green-700">{successCount} succeeded</Badge>
            {failCount > 0 && <Badge variant="destructive">{failCount} failed</Badge>}
          </div>

          <div className="space-y-2">
            {results.map((r: any) => {
              const isExpanded = expandedIds.has(r.companyId);
              const isEditing = editingId === r.companyId;
              const wasReverted = revertedIds.has(r.companyId);
              const currentDescription = savedEdits[r.companyId] ?? r.description;

              return (
                <div key={r.companyId} className={`border rounded-lg ${r.success ? 'border-green-200' : 'border-red-200'}`}>
                  <div
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 ${r.success ? 'bg-green-50/50' : 'bg-red-50/50'}`}
                    onClick={() => toggleExpand(r.companyId)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {r.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                        )}
                        <span className="font-medium text-sm truncate">{r.companyName}</span>
                        {r.industryName && (
                          <span className="text-xs text-gray-500 hidden sm:inline">({r.industryName})</span>
                        )}
                        {wasReverted && <Badge variant="outline" className="text-xs text-yellow-700">Reverted</Badge>}
                      </div>
                      {!isExpanded && r.success && (
                        <p className="text-xs text-gray-500 mt-1 truncate pl-6">{currentDescription}</p>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 flex-shrink-0" />}
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs text-gray-600">
                        <div><span className="font-medium">Industry:</span> {r.industryName || 'N/A'}</div>
                        <div><span className="font-medium">Sector:</span> {r.sectorName || 'N/A'}</div>
                        <div><span className="font-medium">Website:</span> {r.websiteUrl ? <a href={r.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{r.websiteUrl}</a> : 'N/A'}</div>
                        <div><span className="font-medium">ID:</span> {r.companyId}</div>
                      </div>

                      {r.success ? (
                        <>
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Previous Description:</p>
                            <div className="bg-gray-50 rounded p-2 text-sm text-gray-600 italic">
                              {r.previousDescription || <span className="text-gray-400">None (empty)</span>}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">New AI Description:</p>
                            {isEditing ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  rows={4}
                                  className="text-sm"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => updateMutation.mutate({ companyId: r.companyId, description: editText })}
                                    disabled={updateMutation.isPending}
                                  >
                                    {updateMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                                    <X className="h-3 w-3 mr-1" /> Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-green-50 rounded p-2 text-sm text-gray-800">
                                {currentDescription}
                              </div>
                            )}
                          </div>

                          {!isEditing && (
                            <div className="flex gap-2 pt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => { e.stopPropagation(); startEdit(r); }}
                              >
                                <Pencil className="h-3 w-3 mr-1" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-orange-700 border-orange-300 hover:bg-orange-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  revertMutation.mutate({ companyId: r.companyId, previousDescription: r.previousDescription });
                                }}
                                disabled={revertMutation.isPending || wasReverted}
                              >
                                <Undo2 className="h-3 w-3 mr-1" /> {wasReverted ? 'Reverted' : 'Revert'}
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="pt-2">
                          <p className="text-sm text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{r.error}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDescriptions = () => {

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
          <EnrichmentResultsTable results={enrichMutation.data.results || []} />
        )}
      </div>
    );
  };

  const wikidataResults = wikidataValidated;


  const renderWikidata = () => {
    const allWikidataSelected = wikidataResults.length > 0 && wikidataSelected.size === wikidataResults.length;

    return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Wikidata Free Data Import</h3>
        <Button variant="outline" size="sm" onClick={() => setActiveSection('overview')}>
          Back to Overview
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step 1 — Search Wikidata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search term (e.g. bank, airline)"
              value={wikidataQuery.industryName}
              onChange={(e) => setWikidataQuery(prev => ({ ...prev, industryName: e.target.value }))}
            />
            <Input
              placeholder="Country code (e.g. NG, ZA, US)"
              value={wikidataQuery.countryCode}
              onChange={(e) => setWikidataQuery(prev => ({ ...prev, countryCode: e.target.value }))}
            />
            <Select onValueChange={(val) => setWikidataQuery(prev => ({ ...prev, continentName: val }))}>
              <SelectTrigger>
                <SelectValue placeholder="Continent (optional)" />
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
                <><Globe className="h-4 w-4 mr-2" /> Search Wikidata</>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            <MapPin className="h-3 w-3 inline mr-1" />
            Free open data from Wikidata. Best results with common terms: "bank", "airline", "hospital", "university", "insurance", "telecom".
            For continent-wide searches, add a 2-letter country code (e.g. NG, ZA, KE, EG) for faster results.
          </p>
        </CardContent>
      </Card>

      {wikidataMutation.isError && (
        <ErrorBanner message={wikidataMutation.error?.message || 'Wikidata search failed'} />
      )}

      {wikidataMutation.isSuccess && !isValidatingWikidata && wikidataResults.length === 0 && (
        <InfoBanner message="No companies found. Try a broader search term (e.g. 'bank' instead of 'Commercial Banking'), remove the country code, or try a different continent." />
      )}

      {isValidatingWikidata && (
        <Card>
          <CardContent className="py-8 flex items-center justify-center gap-3 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Validating website URLs for {wikidataResults.length} companies — this may take a moment...</span>
          </CardContent>
        </Card>
      )}

      {wikidataResults.length > 0 && !isValidatingWikidata && (
        <>
          <Card className="border-blue-200 bg-blue-50/40">
            <CardContent className="py-4 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Smart Auto-Categorization</p>
                <p className="text-sm text-blue-700 mt-0.5">
                  Each company will be automatically assigned to its best-fit Business Sector and Industry using keyword analysis of its name and description — the same smart matching engine used by the AI Generator. No manual selection required.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between flex-wrap gap-2">
                <span>Step 2 — Select &amp; Stage ({wikidataSelected.size} of {wikidataResults.length} selected)</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (allWikidataSelected) {
                        setWikidataSelected(new Set());
                      } else {
                        setWikidataSelected(new Set(wikidataResults.map((_: any, i: number) => i)));
                      }
                    }}
                  >
                    {allWikidataSelected ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (wikidataSelected.size === 0) {
                        toast({ title: 'Nothing selected', description: 'Check at least one company to stage.', variant: 'destructive' });
                        return;
                      }
                      const chosen = wikidataResults.filter((_: any, i: number) => wikidataSelected.has(i));
                      wikidataImportMutation.mutate({
                        companies: chosen,
                        searchTerm: wikidataQuery.industryName,
                      });
                    }}
                    disabled={wikidataImportMutation.isPending || wikidataSelected.size === 0}
                  >
                    {wikidataImportMutation.isPending ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Staging...</>
                    ) : (
                      <><CheckCircle className="h-4 w-4 mr-2" /> Stage Selected ({wikidataSelected.size})</>
                    )}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[480px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <input
                          type="checkbox"
                          checked={allWikidataSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setWikidataSelected(new Set(wikidataResults.map((_: any, i: number) => i)));
                            } else {
                              setWikidataSelected(new Set());
                            }
                          }}
                          className="h-4 w-4"
                        />
                      </TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Founded</TableHead>
                      <TableHead>Employees</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wikidataResults.map((company: any, i: number) => {
                      const hasWebsite = !!(company.websiteUrl || company.website);
                      const isLive = company.urlReachable === true;
                      const isDead = company.urlReachable === false;
                      let rowClass = 'cursor-pointer ';
                      if (wikidataSelected.has(i)) {
                        rowClass += 'bg-blue-50';
                      } else if (isDead) {
                        rowClass += 'bg-red-50/60';
                      } else if (!hasWebsite) {
                        rowClass += 'opacity-60 hover:bg-gray-50';
                      } else {
                        rowClass += 'hover:bg-gray-50';
                      }
                      return (
                      <TableRow
                        key={i}
                        className={rowClass}
                        onClick={() => {
                          setWikidataSelected(prev => {
                            const next = new Set(prev);
                            if (next.has(i)) next.delete(i); else next.add(i);
                            return next;
                          });
                        }}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={wikidataSelected.has(i)}
                            onChange={(e) => {
                              setWikidataSelected(prev => {
                                const next = new Set(prev);
                                if (e.target.checked) next.add(i); else next.delete(i);
                                return next;
                              });
                            }}
                            className="h-4 w-4"
                          />
                        </TableCell>
                        <TableCell className="font-medium text-sm">{company.name || company.companyName}</TableCell>
                        <TableCell className="text-sm max-w-44">
                          {hasWebsite ? (
                            <a
                              href={company.websiteUrl || company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate block"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {(company.websiteUrl || company.website).replace(/^https?:\/\//, '').replace(/\/$/, '')}
                            </a>
                          ) : (
                            <span className="text-gray-400 text-xs italic">No website</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isLive ? (
                            <Badge className="text-xs bg-green-100 text-green-800 border-green-200">Live</Badge>
                          ) : isDead ? (
                            <Badge variant="destructive" className="text-xs"><XCircle className="h-3 w-3 mr-1" />Dead</Badge>
                          ) : !hasWebsite ? (
                            <Badge variant="outline" className="text-xs text-gray-400">No URL</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-gray-500">Unknown</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{company.country || '-'}</TableCell>
                        <TableCell className="text-sm">{company.foundedYear || '-'}</TableCell>
                        <TableCell className="text-sm">{company.employeeCount || '-'}</TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
    );
  };

  const toggleStagedId = (id: number) => {
    setSelectedStagedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllStaged = () => {
    if (!stagedCompanies) return;
    const pendingIds = stagedCompanies.filter((s: any) => s.status === 'pending').map((s: any) => s.id);
    if (selectedStagedIds.size === pendingIds.length && pendingIds.length > 0) {
      setSelectedStagedIds(new Set());
    } else {
      setSelectedStagedIds(new Set(pendingIds));
    }
  };

  const renderStaged = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Staged Imports</h3>
        <Button variant="outline" size="sm" onClick={() => setActiveSection('overview')}>
          Back to Overview
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{stagedStats?.total || 0}</p>
            <p className="text-sm text-gray-500">Total Staged</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-amber-600">{stagedStats?.pending || 0}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600">{stagedStats?.approved || 0}</p>
            <p className="text-sm text-gray-500">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-red-600">{stagedStats?.rejected || 0}</p>
            <p className="text-sm text-gray-500">Rejected</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between flex-wrap gap-2">
            <span>Filters & Actions</span>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={() => bulkApproveMutation.mutate(Array.from(selectedStagedIds))}
                disabled={bulkApproveMutation.isPending || selectedStagedIds.size === 0}
              >
                {bulkApproveMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <ThumbsUp className="h-4 w-4 mr-1" />}
                Approve {selectedStagedIds.size}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => bulkRejectMutation.mutate(Array.from(selectedStagedIds))}
                disabled={bulkRejectMutation.isPending || selectedStagedIds.size === 0}
              >
                {bulkRejectMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <ThumbsDown className="h-4 w-4 mr-1" />}
                Reject {selectedStagedIds.size}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => recategorizeMutation.mutate()}
                disabled={recategorizeMutation.isPending}
                title="Re-run the category matching engine on all pending staged companies to fix any incorrect sector/industry assignments"
              >
                {recategorizeMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
                Re-categorize All Pending
              </Button>
              <a href="/api/admin/staged-companies/export-csv" target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" /> Export CSV
                </Button>
              </a>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap items-center">
            <Select onValueChange={(val) => setStagedFilter(prev => ({ ...prev, status: val === 'all' ? '' : val }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(val) => setStagedFilter(prev => ({ ...prev, source: val === 'all' ? '' : val }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="ai">AI Generated</SelectItem>
                <SelectItem value="wikidata">Wikidata</SelectItem>
                <SelectItem value="csv">CSV Import</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={toggleAllStaged}
            >
              {stagedCompanies && stagedCompanies.filter((s: any) => s.status === 'pending').length > 0 && selectedStagedIds.size === stagedCompanies.filter((s: any) => s.status === 'pending').length
                ? 'Deselect All'
                : 'Select All Pending'
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Staged Companies ({stagedCompanies?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      checked={stagedCompanies && stagedCompanies.filter((s: any) => s.status === 'pending').length > 0 && selectedStagedIds.size === stagedCompanies.filter((s: any) => s.status === 'pending').length}
                      onChange={toggleAllStaged}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(stagedCompanies || []).map((sc: any) => (
                  <TableRow key={sc.id} className={sc.status === 'rejected' ? 'opacity-50' : ''}>
                    <TableCell>
                      {sc.status === 'pending' && (
                        <input
                          type="checkbox"
                          checked={selectedStagedIds.has(sc.id)}
                          onChange={() => toggleStagedId(sc.id)}
                          className="rounded"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{sc.name}</p>
                        {sc.websiteUrl && <p className="text-xs text-blue-600 truncate max-w-40">{sc.websiteUrl}</p>}
                        {sc.country && <p className="text-xs text-gray-400">{sc.country}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{sc.matchedIndustry || sc.industryName}</TableCell>
                    <TableCell className="text-sm">{sc.matchedSector || sc.sectorName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {sc.source === 'ai' ? 'AI' : sc.source === 'wikidata' ? 'Wikidata' : sc.source}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          sc.matchConfidence === 'high' ? 'text-green-700 border-green-300' :
                          sc.matchConfidence === 'medium' ? 'text-amber-700 border-amber-300' :
                          'text-red-700 border-red-300'
                        }`}
                      >
                        {sc.matchConfidence || 'unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={sc.status === 'approved' ? 'default' : sc.status === 'rejected' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {sc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sc.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => approveMutation.mutate(sc.id)}
                            disabled={approveMutation.isPending}
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => rejectMutation.mutate(sc.id)}
                            disabled={rejectMutation.isPending}
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!stagedCompanies || stagedCompanies.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                      No staged companies found. Import companies via AI Generator or Wikidata to see them here.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
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
      {activeSection === 'staged' && renderStaged()}
      {activeSection === 'cache' && renderCache()}
    </div>
  );
}
