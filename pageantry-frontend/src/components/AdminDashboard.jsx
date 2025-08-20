import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { candidatesAPI, judgesAPI, scoresAPI, exportAPI, downloadFile } from '../lib/api';
import { Users, UserCheck, Trophy, Download, Filter, Plus, Edit, Trash2, LogOut, BarChart3, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import AddCandidateModal from './AddCandidateModal';
import AddJudgeModal from './AddJudgeModal';
import ConfirmationModal from './ConfirmationModal';
import { useToast, ToastContainer } from './Toast';
import '../App.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [judges, setJudges] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [progress, setProgress] = useState(null);
  const [filter, setFilter] = useState('overall');
  const [genderFilter, setGenderFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Modal states
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [showAddJudgeModal, setShowAddJudgeModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  // Edit states
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [editingJudge, setEditingJudge] = useState(null);
  
  // Delete states
  const [deletingItem, setDeletingItem] = useState(null);
  
  // Toast notifications
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const analyticsParams = genderFilter !== 'all' ? { gender: genderFilter } : {};
      const [candidatesRes, judgesRes, analyticsRes, progressRes] = await Promise.all([
        candidatesAPI.getAll(),
        judgesAPI.getAll(),
        scoresAPI.getAnalytics(null, analyticsParams),
        scoresAPI.getProgress(),
      ]);

      setCandidates(candidatesRes.data.data);
      setJudges(judgesRes.data.data);
      setAnalytics(analyticsRes.data.data);
      setProgress(progressRes.data.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert frontend filter to backend filter
  const getBackendFilter = (frontendFilter) => {
    const filterMapping = {
      'overall': 'overall',
      'sports_attire': 'top_sports_attire',
      'swimsuit': 'top_swimsuit',
      'talent': 'top_talent',
      'gown': 'top_gown',
      'qa': 'top_qa'
    };
    return filterMapping[frontendFilter] || 'overall';
  };

  // Helper function to get filter display name
  const getFilterDisplayName = (filter) => {
    const displayNames = {
      'overall': 'Overall Results',
      'sports_attire': 'Sports Attire Results',
      'swimsuit': 'Swimsuit Results',
      'talent': 'Talent Results',
      'gown': 'Gown Results',
      'qa': 'Q&A Results'
    };
    return displayNames[filter] || 'Overall Results';
  };

  const handleFilterChange = async (newFilter) => {
    setFilter(newFilter);
    try {
      // Also reload candidates with current gender filter when changing category filter
      const candidatesParams = genderFilter !== 'all' ? { gender: genderFilter } : {};
      const analyticsParams = genderFilter !== 'all' ? { gender: genderFilter } : {};
      const [candidatesRes, analyticsRes] = await Promise.all([
        candidatesAPI.getAll(candidatesParams),
        scoresAPI.getAnalytics(newFilter === 'overall' ? null : newFilter, analyticsParams),
      ]);
      setCandidates(candidatesRes.data.data);
      setAnalytics(analyticsRes.data.data);
    } catch (error) {
      console.error('Error loading filtered data:', error);
      showError('Failed to load filtered data');
    }
  };

  const handleGenderFilterChange = async (newGenderFilter) => {
    setGenderFilter(newGenderFilter);
    
    try {
      // Reload candidates and analytics without showing loading screen
      const candidatesParams = newGenderFilter !== 'all' ? { gender: newGenderFilter } : {};
      const analyticsParams = newGenderFilter !== 'all' ? { gender: newGenderFilter } : {};
      const [candidatesRes, analyticsRes] = await Promise.all([
        candidatesAPI.getAll(candidatesParams),
        scoresAPI.getAnalytics(filter === 'overall' ? null : filter, analyticsParams),
      ]);
      setCandidates(candidatesRes.data.data);
      setAnalytics(analyticsRes.data.data);
    } catch (error) {
      console.error('Error loading filtered data:', error);
      showError('Failed to load filtered data');
    }
  };

  // Enhanced export function that can handle specific categories and gender filtering
  const handleExportSpecific = async (format, category = null) => {
    try {
      setExportLoading(true);
      const exportFilter = category ? getBackendFilter(category) : getBackendFilter(filter);
      const displayName = category ? getFilterDisplayName(category) : getFilterDisplayName(filter);
      
      // Create export parameters including gender filter
      const exportParams = {
        filter: exportFilter,
        gender: genderFilter
      };
      
      const response = format === 'excel' 
        ? await exportAPI.exportExcel(exportParams)
        : await exportAPI.exportPdf(exportParams);
      
      const categoryName = category || filter;
      const genderSuffix = genderFilter !== 'all' ? `-${genderFilter}` : '';
      const filename = `pageant-results-${categoryName}${genderSuffix}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      downloadFile(response.data, filename);
      
      const genderText = genderFilter !== 'all' ? ` (${genderFilter.charAt(0).toUpperCase() + genderFilter.slice(1)} only)` : '';
      showSuccess(`${displayName}${genderText} exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      showError(`Failed to export ${category ? getFilterDisplayName(category) : getFilterDisplayName(filter)}`);
    } finally {
      setExportLoading(false);
    }
  };

  // Original export function for backward compatibility
  const handleExport = async (format) => {
    await handleExportSpecific(format);
  };

  // Export all categories function
  const handleExportAll = async (format) => {
    const categories = ['overall', 'sports_attire', 'swimsuit', 'talent', 'gown', 'qa'];
    setExportLoading(true);
    
    try {
      for (const category of categories) {
        await handleExportSpecific(format, category);
        // Add a small delay between exports to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      const genderText = genderFilter !== 'all' ? ` (${genderFilter.charAt(0).toUpperCase() + genderFilter.slice(1)} only)` : '';
      showSuccess(`All categories${genderText} exported as ${format.toUpperCase()}`);
    } catch (error) {
      showError('Failed to export all categories');
    } finally {
      setExportLoading(false);
    }
  };

  // Separate export functions for male and female
  const handleExportMale = async (format) => {
    const originalGenderFilter = genderFilter;
    setGenderFilter('male');
    
    try {
      setExportLoading(true);
      const exportFilter = getBackendFilter(filter);
      const displayName = getFilterDisplayName(filter);
      
      const exportParams = {
        filter: exportFilter,
        gender: 'male'
      };
      
      const response = format === 'excel' 
        ? await exportAPI.exportExcel(exportParams)
        : await exportAPI.exportPdf(exportParams);
      
      const filename = `pageant-results-${filter}-male.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      downloadFile(response.data, filename);
      showSuccess(`${displayName} (Male only) exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      showError(`Failed to export ${getFilterDisplayName(filter)} for male candidates`);
    } finally {
      setExportLoading(false);
      setGenderFilter(originalGenderFilter);
    }
  };

  const handleExportFemale = async (format) => {
    const originalGenderFilter = genderFilter;
    setGenderFilter('female');
    
    try {
      setExportLoading(true);
      const exportFilter = getBackendFilter(filter);
      const displayName = getFilterDisplayName(filter);
      
      const exportParams = {
        filter: exportFilter,
        gender: 'female'
      };
      
      const response = format === 'excel' 
        ? await exportAPI.exportExcel(exportParams)
        : await exportAPI.exportPdf(exportParams);
      
      const filename = `pageant-results-${filter}-female.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      downloadFile(response.data, filename);
      showSuccess(`${displayName} (Female only) exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      showError(`Failed to export ${getFilterDisplayName(filter)} for female candidates`);
    } finally {
      setExportLoading(false);
      setGenderFilter(originalGenderFilter);
    }
  };

  // Candidate handlers
  const handleCandidateSuccess = async () => {
    try {
      // Reload only the necessary data without showing loading screen
      const candidatesParams = genderFilter !== 'all' ? { gender: genderFilter } : {};
      const analyticsParams = genderFilter !== 'all' ? { gender: genderFilter } : {};
      const [candidatesRes, analyticsRes] = await Promise.all([
        candidatesAPI.getAll(candidatesParams),
        scoresAPI.getAnalytics(filter === 'overall' ? null : filter, analyticsParams),
      ]);
      setCandidates(candidatesRes.data.data);
      setAnalytics(analyticsRes.data.data);
    } catch (error) {
      console.error('Error reloading data:', error);
    }
    setEditingCandidate(null);
  };

  const handleEditCandidate = (candidate) => {
    setEditingCandidate(candidate);
    setShowAddCandidateModal(true);
  };

  const handleDeleteCandidate = (candidate) => {
    setDeletingItem({
      type: 'candidate',
      id: candidate.id,
      name: candidate.name,
      apiCall: () => candidatesAPI.delete(candidate.id)
    });
    setShowDeleteConfirmation(true);
  };

  // Judge handlers
  const handleJudgeSuccess = async () => {
    try {
      // Reload only the necessary data without showing loading screen
      const [judgesRes, progressRes] = await Promise.all([
        judgesAPI.getAll(),
        scoresAPI.getProgress(),
      ]);
      setJudges(judgesRes.data.data);
      setProgress(progressRes.data.data);
    } catch (error) {
      console.error('Error reloading data:', error);
    }
    setEditingJudge(null);
  };

  const handleEditJudge = (judge) => {
    setEditingJudge(judge);
    setShowAddJudgeModal(true);
  };

  const handleDeleteJudge = (judge) => {
    setDeletingItem({
      type: 'judge',
      id: judge.id,
      name: judge.name,
      apiCall: () => judgesAPI.delete(judge.id)
    });
    setShowDeleteConfirmation(true);
  };

  // Delete confirmation handler
  const handleConfirmDelete = async () => {
    try {
      await deletingItem.apiCall();
      showSuccess(`${deletingItem.type === 'candidate' ? 'Candidate' : 'Judge'} deleted successfully!`);
      
      // Reload data without showing loading screen
      if (deletingItem.type === 'candidate') {
        const candidatesParams = genderFilter !== 'all' ? { gender: genderFilter } : {};
        const analyticsParams = genderFilter !== 'all' ? { gender: genderFilter } : {};
        const [candidatesRes, analyticsRes] = await Promise.all([
          candidatesAPI.getAll(candidatesParams),
          scoresAPI.getAnalytics(filter === 'overall' ? null : filter, analyticsParams),
        ]);
        setCandidates(candidatesRes.data.data);
        setAnalytics(analyticsRes.data.data);
      } else {
        const [judgesRes, progressRes] = await Promise.all([
          judgesAPI.getAll(),
          scoresAPI.getProgress(),
        ]);
        setJudges(judgesRes.data.data);
        setProgress(progressRes.data.data);
      }
    } catch (error) {
      console.error('Delete error:', error);
      showError(`Failed to delete ${deletingItem.type}`);
    } finally {
      setDeletingItem(null);
      setShowDeleteConfirmation(false);
    }
  };

  // Modal close handlers
  const handleCloseCandidateModal = () => {
    setShowAddCandidateModal(false);
    setEditingCandidate(null);
  };

  const handleCloseJudgeModal = () => {
    setShowAddJudgeModal(false);
    setEditingJudge(null);
  };

  const handleCloseDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
    setDeletingItem(null);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRankColor = (index) => {
    if (index === 0) return "text-yellow-500";
    if (index === 1) return "text-gray-400";
    if (index === 2) return "text-amber-600";
    return "";
  };

  const formatScore = (score) => {
    return typeof score === 'number' ? score.toFixed(2) : '0.00';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Crown className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <header className="border-b bg-gradient-to-br from-primary/10 via-background to-accent/10 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
        <div className="mobile-container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center">
                <Crown className="h-5 w-5 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-black">Admin Dashboard</h1>
                <p className="text-sm text-black/80">Welcome, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="bg-gradient-to-br from-primary/10 via-background to-accent/10 backdrop-blur-sm hover:bg-white hover:text-black"
              >
                <LogOut className="h-4 w-4 mr-2 cursor-pointer" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mobile-container py-6">
        {/* Stats Cards */}
        <div className="mobile-grid mb-8">
          <Card className="animate-fade-in-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{candidates.length}</div>
              <p className="text-xs text-muted-foreground">
                Active participants
              </p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Judges</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{judges.length}</div>
              <p className="text-xs text-muted-foreground">
                Registered judges
              </p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voting Progress</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progress ? Math.round(
                  Object.values(progress.categories_progress)
                    .reduce((sum, cat) => sum + cat.percentage, 0) / 5
                ) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Overall completion
              </p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leading Candidate</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                #{analytics?.rankings?.[0]?.candidate?.candidate_number || 'TBD'}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics?.rankings?.[0]?.candidate?.name || 'To be determined'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="candidates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="judges">Judges</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          {/* Candidates Tab */}
          <TabsContent value="candidates" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Candidates Management</CardTitle>
                    <CardDescription>
                      Manage pageant candidates and view their scores
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={genderFilter} onValueChange={handleGenderFilterChange}>
                      <SelectTrigger className="w-[140px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Genders</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => setShowAddCandidateModal(true)}
                      className="cursor-pointer"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Candidate
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Sports Attire (20%)</TableHead>
                      <TableHead>Swimsuit (20%)</TableHead>
                      <TableHead>Talent (10%)</TableHead>
                      <TableHead>Gown (20%)</TableHead>
                      <TableHead>Q&A (30%)</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidates.map((candidate, index) => (
                      <TableRow key={candidate.id} className="table-row-hover">
                        <TableCell>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={candidate.image_url} />
                            <AvatarFallback>
                              {candidate.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">#{candidate.candidate_number}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{candidate.name}</TableCell>
                        <TableCell>
                          <Badge variant={candidate.gender === 'male' ? 'default' : 'secondary'}>
                            {candidate.gender === 'male' ? 'Male' : 'Female'}
                          </Badge>
                        </TableCell>
                        <TableCell className={getScoreColor(candidate.scores?.sports_attire)}>
                          {formatScore(candidate.scores?.sports_attire)}
                        </TableCell>
                        <TableCell className={getScoreColor(candidate.scores?.swimsuit)}>
                          {formatScore(candidate.scores?.swimsuit)}
                        </TableCell>
                        <TableCell className={getScoreColor(candidate.scores?.talent)}>
                          {formatScore(candidate.scores?.talent)}
                        </TableCell>
                        <TableCell className={getScoreColor(candidate.scores?.gown)}>
                          {formatScore(candidate.scores?.gown)}
                        </TableCell>
                        <TableCell className={getScoreColor(candidate.scores?.qa)}>
                          {formatScore(candidate.scores?.qa)}
                        </TableCell>
                        <TableCell className="font-bold">
                          <span className={getScoreColor(candidate.scores?.total)}>
                            {formatScore(candidate.scores?.total)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditCandidate(candidate)}
                              className="btn-hover-scale cursor-pointer"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteCandidate(candidate)}
                              className="btn-hover-scale cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Judges Tab */}
          <TabsContent value="judges" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Judges Management</CardTitle>
                    <CardDescription>
                      Manage judges and monitor their voting progress
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowAddJudgeModal(true)}
                  className="cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Judge
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sports Attire</TableHead>
                      <TableHead>Swimsuit</TableHead>
                      <TableHead>Talent</TableHead>
                      <TableHead>Gown</TableHead>
                      <TableHead>Q&A</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {judges
                      .slice()
                      .sort((a, b) => a.id - b.id)
                      .map((judge) => (
                        <TableRow key={judge.id} className="table-row-hover">
                          <TableCell className="font-medium">{judge.name}</TableCell>
                          <TableCell>{judge.email}</TableCell>
                          <TableCell>
                            <Badge variant={judge.is_active ? "default" : "secondary"}>
                              {judge.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {judge.progress?.sports_attire?.percentage || 0}%
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {judge.progress?.swimsuit?.percentage || 0}%
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {judge.progress?.talent?.percentage || 0}%
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {judge.progress?.gown?.percentage || 0}%
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {judge.progress?.qa?.percentage || 0}%
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditJudge(judge)}
                                className="btn-hover-scale cursor-pointer"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteJudge(judge)}
                                className="btn-hover-scale text-red-600 hover:text-red-700 cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab - ENHANCED VERSION */}
          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Competition Results</CardTitle>
                    <CardDescription>
                      View rankings and export results for {getFilterDisplayName(filter)}
                      {genderFilter !== 'all' && ` (${genderFilter.charAt(0).toUpperCase() + genderFilter.slice(1)} only)`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={genderFilter} onValueChange={handleGenderFilterChange}>
                      <SelectTrigger className="w-[140px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Genders</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filter} onValueChange={handleFilterChange}>
                      <SelectTrigger className="w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overall">Overall</SelectItem>
                        <SelectItem value="sports_attire">Sports Attire</SelectItem>
                        <SelectItem value="swimsuit">Swimsuit</SelectItem>
                        <SelectItem value="talent">Talent</SelectItem>
                        <SelectItem value="gown">Gown</SelectItem>
                        <SelectItem value="qa">Q&A</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Current Filter Export Buttons */}
                    <Button 
                      variant="outline" 
                      onClick={() => handleExport('excel')}
                      disabled={exportLoading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                    
                    {/* Enhanced Export Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" disabled={exportLoading}>
                          <Download className="h-4 w-4 mr-2" />
                          Export Options
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Export Current Filter</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem onClick={() => handleExport('pdf')}>
                          <Download className="h-4 w-4 mr-2" />
                          Current Results (PDF)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('excel')}>
                          <Download className="h-4 w-4 mr-2" />
                          Current Results (Excel)
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Export by Gender</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem onClick={() => handleExportMale('pdf')}>
                          <Download className="h-4 w-4 mr-2" />
                          Male Only (PDF)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportMale('excel')}>
                          <Download className="h-4 w-4 mr-2" />
                          Male Only (Excel)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportFemale('pdf')}>
                          <Download className="h-4 w-4 mr-2" />
                          Female Only (PDF)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportFemale('excel')}>
                          <Download className="h-4 w-4 mr-2" />
                          Female Only (Excel)
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Export All Categories</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem onClick={() => handleExportAll('pdf')}>
                          <Download className="h-4 w-4 mr-2" />
                          All Categories (PDF)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportAll('excel')}>
                          <Download className="h-4 w-4 mr-2" />
                          All Categories (Excel)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Candidate No.</TableHead>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Gender</TableHead>
                      {filter === 'overall' ? (
                        <>
                          <TableHead>Sports Attire</TableHead>
                          <TableHead>Swimsuit</TableHead>
                          <TableHead>Talent</TableHead>
                          <TableHead>Gown</TableHead>
                          <TableHead>Q&A</TableHead>
                          <TableHead>Total</TableHead>
                        </>
                      ) : (
                        <TableHead>Score</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics?.rankings?.map((item, index) => (
                      <TableRow key={item.candidate.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Badge 
                              variant={index < 3 ? "default" : "outline"}
                              className={
                                index === 0 ? "bg-yellow-500" :
                                index === 1 ? "bg-gray-400" :
                                index === 2 ? "bg-amber-600" : ""
                              }
                            >
                              #{index + 1}
                            </Badge>
                            {index < 3 && (
                              <Trophy className={`h-4 w-4 ml-2 ${
                                index === 0 ? "text-yellow-500" :
                                index === 1 ? "text-gray-400" :
                                "text-amber-600"
                              }`} />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="font-medium">{item.candidate.candidate_number}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={item.candidate.image_url} />
                              <AvatarFallback>
                                {item.candidate.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{item.candidate.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.candidate.gender === 'male' ? 'default' : 'secondary'}>
                            {item.candidate.gender === 'male' ? 'Male' : 'Female'}
                          </Badge>
                        </TableCell>
                        {filter === 'overall' ? (
                          <>
                            <TableCell className={getScoreColor(item.scores_breakdown?.sports_attire)}>{formatScore(item.scores_breakdown?.sports_attire)}</TableCell>
                            <TableCell className={getScoreColor(item.scores_breakdown?.swimsuit)}>{formatScore(item.scores_breakdown?.swimsuit)}</TableCell>
                            <TableCell className={getScoreColor(item.scores_breakdown?.talent)}>{formatScore(item.scores_breakdown?.talent)}</TableCell>
                            <TableCell className={getScoreColor(item.scores_breakdown?.gown)}>{formatScore(item.scores_breakdown?.gown)}</TableCell>
                            <TableCell className={getScoreColor(item.scores_breakdown?.qa)}>{formatScore(item.scores_breakdown?.qa)}</TableCell>
                            <TableCell className={`font-bold ${getScoreColor(item.total_score)}`}>
                              {formatScore(item.total_score)}
                            </TableCell>
                          </>
                        ) : (
                          <TableCell className={`font-bold ${getScoreColor(item.average_score)}`}>
                            {formatScore(item.average_score)}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {showAddCandidateModal && (
        <AddCandidateModal
          isOpen={showAddCandidateModal}
          onClose={handleCloseCandidateModal}
          onSuccess={handleCandidateSuccess}
          editCandidate={editingCandidate}
          showSuccessAlert={showSuccess}
        />
      )}

      {showAddJudgeModal && (
        <AddJudgeModal
          isOpen={showAddJudgeModal}
          onClose={handleCloseJudgeModal}
          onSuccess={handleJudgeSuccess}
          judge={editingJudge}
        />
      )}

      {showDeleteConfirmation && (
        <ConfirmationModal
          isOpen={showDeleteConfirmation}
          onClose={handleCloseDeleteConfirmation}
          onConfirm={handleConfirmDelete}
          title={`Delete ${deletingItem?.type === 'candidate' ? 'Candidate' : 'Judge'}`}
          message={`Are you sure you want to delete ${deletingItem?.name}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />
      )}
    </div>
  );
};

export default AdminDashboard;

