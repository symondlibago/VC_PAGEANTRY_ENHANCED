import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { candidatesAPI, scoresAPI } from '../lib/api';
import { 
  Crown,
  MicVocal,
  CheckCircle, 
  Clock, 
  LogOut,
  Volleyball,
  User,
  Loader2,
  BarChart3,
  Target,
  Waves
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import CategoryVotingPage from './CategoryVotingPage';
import '../App.css';

const JudgeDashboard = () => {
  const { user, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProgress, setCategoryProgress] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const categories = [
    { 
      id: 'sports_attire', 
      name: 'Sports Attire', 
      weight: '20%', 
      icon: Volleyball, 
      color: 'from-blue-600 to-blue-800',
      bgColor: 'bg-blue-600',
      description: 'Athletic wear and fitness presentation'
    },
    { 
      id: 'swimsuit', 
      name: 'Swimsuit', 
      weight: '20%', 
      icon: Waves, 
      color: 'from-red-600 to-red-800',
      bgColor: 'bg-red-600',
      description: 'Swimwear presentation and confidence'
    },
    { 
      id: 'talent', 
      name: 'Talent', 
      weight: '10%', 
      icon: MicVocal, 
      color: 'from-yellow-600 to-yellow-800',
      bgColor: 'bg-yellow-600',
      description: 'Talent and performance presentation'
    },
    { 
      id: 'gown', 
      name: 'Gown', 
      weight: '20%', 
      icon: Crown, 
      color: 'from-purple-600 to-purple-800',
      bgColor: 'bg-purple-600',
      description: 'Evening gown elegance and poise'
    },
    { 
      id: 'qa', 
      name: 'Q&A', 
      weight: '30%', 
      icon: User, 
      color: 'from-green-600 to-green-800',
      bgColor: 'bg-green-600',
      description: 'Question and answer intelligence'
    },
  ];

  // Load progress data on component mount
  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      
      if (user?.role === 'judge') {
        const response = await scoresAPI.getProgress();
        const data = response.data.data;
        
        setCategoryProgress(data.categories_progress || {});
        
        // Calculate overall progress
        const totalCategories = categories.length;
        const completedCategories = Object.values(data.categories_progress || {})
          .reduce((sum, cat) => sum + (cat.percentage === 100 ? 1 : 0), 0);
        setOverallProgress((completedCategories / totalCategories) * 100);
      } else {
        // For judges, initialize empty progress data
        setCategoryProgress({});
        setOverallProgress(0);
      }
      
    } catch (error) {
      console.error('Error loading progress data:', error);
      // Don't show error for judges as they don't have access to this endpoint
      if (user?.role === 'admin') {
        setError('Failed to load progress data');
      }
    } finally {
      setLoading(false);
    }
  };

  const getCategoryProgress = (categoryId) => {
    return categoryProgress[categoryId]?.percentage || 0;
  };

  const getCategoryStatus = (categoryId) => {
    const progress = getCategoryProgress(categoryId);
    if (progress === 100) return 'completed';
    if (progress > 0) return 'in-progress';
    return 'not-started';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in-progress': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in-progress': return Clock;
      default: return Target;
    }
  };

  const scrollToCategory = (categoryId) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (selectedCategory) {
    return (
      <CategoryVotingPage
        category={selectedCategory}
        onBack={() => {
          setSelectedCategory(null);
          loadProgressData(); // Refresh progress when returning
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-blue-100">Loading judge dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-red-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Judge Panel</h1>
                <p className="text-sm text-white/80">Welcome, {user?.name}</p>
              </div>
            </div>
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
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Overall Progress Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-primary/20 shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-foreground">Overall Voting Progress</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your progress across all categories
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Total Progress</span>
              <span className="text-foreground font-medium">{Math.round(overallProgress)}% Complete</span>
            </div>
            <Progress value={overallProgress} className="h-4" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              {categories.map((category) => {
                const progress = getCategoryProgress(category.id);
                const status = getCategoryStatus(category.id);
                const StatusIcon = getStatusIcon(status);
                
                return (
                  <div key={category.id} className="text-center cursor-pointer" onClick={() => scrollToCategory(category.id)}>
                    <div className={`w-12 h-12 ${category.bgColor} rounded-full flex items-center justify-center mx-auto mb-2`}>
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm text-foreground font-medium">{category.name}</p>
                    <div className="flex items-center justify-center space-x-1 mt-1">
                      <StatusIcon className={`h-3 w-3 ${getStatusColor(status)}`} />
                      <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category Selection */}
        <div id="category-selection-section">
          <h2 className="text-3xl font-bold mb-6 text-foreground text-center">Select Voting Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const progress = getCategoryProgress(category.id);
              const status = getCategoryStatus(category.id);
              const StatusIcon = getStatusIcon(status);
              
              return (
                <Card 
                  key={category.id}
                  id={`category-${category.id}`}
                  className="bg-white/80 backdrop-blur-sm border-primary/20 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`h-5 w-5 ${getStatusColor(status)}`} />
                        <Badge 
                          variant="outline" 
                          className="border-primary/20 text-primary"
                        >
                          {category.weight}
                        </Badge>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-muted-foreground mb-6 text-sm">
                      {category.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-foreground font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-3" />
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {status === 'completed' ? 'Completed' : 
                           status === 'in-progress' ? 'In Progress' : 'Not Started'}
                        </span>
                        <span>
                          {categoryProgress[category.id]?.completed || 0}/
                          {categoryProgress[category.id]?.total || 0} votes
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <Card className="bg-white/80 backdrop-blur-sm border-primary/20 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Voting Instructions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="space-y-2">
                <p>• Select a category above to begin voting</p>
                <p>• Score each candidate from 0 to 100</p>
                <p>• You can only vote once per candidate per category</p>
              </div>
              <div className="space-y-2">
                <p>• Navigate between candidates using the arrow buttons</p>
                <p>• Your progress is automatically saved</p>
                <p>• Complete all categories to finish judging</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JudgeDashboard;

