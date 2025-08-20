import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { candidatesAPI, judgesAPI, scoresAPI, exportAPI, downloadFile } from '../lib/api';
import { 
  Users, 
  UserCheck, 
  Trophy, 
  Download, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  LogOut,
  Settings,
  BarChart3,
  Crown
} from 'lucide-react';
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
import '../App.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [judges, setJudges] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [progress, setProgress] = useState(null);
  const [filter, setFilter] = useState('overall');
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [showAddJudgeModal, setShowAddJudgeModal] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [candidatesRes, judgesRes, analyticsRes, progressRes] = await Promise.all([
        candidatesAPI.getAll(),
        judgesAPI.getAll(),
        scoresAPI.getAnalytics(),
        scoresAPI.getProgress(),
      ]);

      setCandidates(candidatesRes.data.data);
      setJudges(judgesRes.data.data);
      setAnalytics(analyticsRes.data.data);
      setProgress(progressRes.data.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (newFilter) => {
    setFilter(newFilter);
    try {
      const response = await scoresAPI.getAnalytics(newFilter === 'overall' ? null : newFilter);
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error loading filtered data:', error);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = format === 'excel' 
        ? await exportAPI.exportExcel(filter)
        : await exportAPI.exportPdf(filter);
      
      const filename = `pageant-results-${filter}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      downloadFile(response.data, filename);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatScore = (score) => {
    return typeof score === 'number' ? score.toFixed(2) : '0.00';
  };

  // Modal handlers
  const handleCandidateSuccess = () => {
    loadDashboardData(); // Reload data after successful candidate creation
  };

  const handleJudgeSuccess = () => {
    loadDashboardData(); // Reload data after successful judge creation
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-primary to-secondary backdrop-blur-sm sticky top-0 z-50">
        <div className="mobile-container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-white/80">Welcome, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent text-white border-white hover:bg-white hover:text-black"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="bg-transparent text-white border-white hover:bg-white hover:text-black"
            >
              <LogOut className="h-4 w-4 mr-2" />
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
                    .reduce((sum, cat) => sum + cat.percentage, 0) / 4
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
                  <Button onClick={() => setShowAddCandidateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Candidate
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Sports Attire (20%)</TableHead>
                      <TableHead>Swimsuit (20%)</TableHead>
                      <TableHead>Gown (30%)</TableHead>
                      <TableHead>Q&A (30%)</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidates.map((candidate, index) => (
                      <TableRow key={candidate.id}>
                        <TableCell>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={candidate.image_url} />
                            <AvatarFallback>
                              {candidate.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">#{index + 1}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{candidate.name}</TableCell>
                        <TableCell className={getScoreColor(candidate.scores?.sports_attire)}>
                          {formatScore(candidate.scores?.sports_attire)}
                        </TableCell>
                        <TableCell className={getScoreColor(candidate.scores?.swimsuit)}>
                          {formatScore(candidate.scores?.swimsuit)}
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
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
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
                  <Button onClick={() => setShowAddJudgeModal(true)}>
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
                      <TableHead>Gown</TableHead>
                      <TableHead>Q&A</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
  {judges
    .slice() // optional: avoid mutating original array
    .sort((a, b) => a.id - b.id)
    .map((judge) => (
      <TableRow key={judge.id}>
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
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
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

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Competition Results</CardTitle>
                    <CardDescription>
                      View rankings and export results
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={filter} onValueChange={handleFilterChange}>
                      <SelectTrigger className="w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overall">Overall</SelectItem>
                        <SelectItem value="sports_attire">Top Sports Attire</SelectItem>
                        <SelectItem value="swimsuit">Top Swimsuit</SelectItem>
                        <SelectItem value="gown">Top Gown</SelectItem>
                        <SelectItem value="qa">Top Q&A</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => handleExport('excel')}>
                      <Download className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('pdf')}>
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
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
                      {filter === 'overall' ? (
                        <>
                          <TableHead>Sports Attire</TableHead>
                          <TableHead>Swimsuit</TableHead>
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
                          <Badge variant={index < 3 ? "default" : "outline"}>
                            #{index + 1}
                          </Badge>
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
                        {filter === 'overall' ? (
                          <>
                            <TableCell>{formatScore(item.scores_breakdown?.sports_attire)}</TableCell>
                            <TableCell>{formatScore(item.scores_breakdown?.swimsuit)}</TableCell>
                            <TableCell>{formatScore(item.scores_breakdown?.gown)}</TableCell>
                            <TableCell>{formatScore(item.scores_breakdown?.qa)}</TableCell>
                            <TableCell className="font-bold">
                              {formatScore(item.total_score)}
                            </TableCell>
                          </>
                        ) : (
                          <TableCell className="font-bold">
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
      <AddCandidateModal
        isOpen={showAddCandidateModal}
        onClose={() => setShowAddCandidateModal(false)}
        onSuccess={handleCandidateSuccess}
      />
      
      <AddJudgeModal
        isOpen={showAddJudgeModal}
        onClose={() => setShowAddJudgeModal(false)}
        onSuccess={handleJudgeSuccess}
      />
    </div>
  );
};

export default AdminDashboard;

