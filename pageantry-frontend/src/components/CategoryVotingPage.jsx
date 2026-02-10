import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { candidatesAPI, scoresAPI } from '../lib/api';
import { 
  Crown, 
  Star, 
  CheckCircle, 
  Clock, 
  LogOut,
  ArrowRight,
  ArrowLeft,
  Trophy,
  User,
  Loader2,
  Send,
  AlertCircle,
  Calculator,
  Award
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { Label } from './ui/label';

const CategoryVotingPage = ({ category, onBack }) => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState('');
  const [subCategoryScores, setSubCategoryScores] = useState({});
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isQAFinals, setIsQAFinals] = useState(false);

  const categories = {
    production: { name: 'Production', icon: Trophy, color: 'bg-blue-600' },
    formal_attire: { name: 'Casual Attire', icon: Trophy, color: 'bg-blue-600' },
    uniform_attire: { name: 'Uniform Attire', icon: Trophy, color: 'bg-blue-600' },
    qa_preliminary: { name: 'Preliminary Q&A', icon: Clock, color: 'bg-yellow-600' },
    swimwear: { name: 'Swimwear', icon: Trophy, color: 'bg-red-600' },
    gown: { name: 'Gown/Formal Attire Exposure', icon: Crown, color: 'bg-purple-600' },
    qa: { name: 'Q&A', icon: User, color: 'bg-green-600' },
  };

  // Sub-category definitions with weights
  const subCategories = {
    production: [
      { key: 'stage_presence_energy', name: 'Stage Presence & Energy', weight: 40, maxScore: 40 },
      { key: 'projection', name: 'Projection', weight: 25, maxScore: 25 },
      { key: 'creativity_concept', name: 'Creativity & Concept', weight: 20, maxScore: 20 },
      { key: 'confidence', name: 'Confidence', weight: 15, maxScore: 15 }
    ],
    formal_attire: [
      { key: 'fit', name: 'Fit & Sustainability', weight: 50, maxScore: 50 },
      { key: 'poise', name: 'Poise & Bearing', weight: 20, maxScore: 20 },
      { key: 'elegance', name: 'Elegance & Sophistication', weight: 20, maxScore: 20 },
      { key: 'confidence', name: 'Confidence', weight: 10, maxScore: 10 }
    ],
    uniform_attire: [
      { key: 'school_uniform', name: 'Appropriateness in Wearing School Uniform', weight: 50, maxScore: 50 },
      { key: 'poise_projection', name: 'Poise & Projection', weight: 40, maxScore: 40 },
      { key: 'confidence', name: 'Confidence', weight: 10, maxScore: 10 }
    ],
    qa_preliminary: [
      { key: 'wit_content', name: 'Wit and Content', weight: 40, maxScore: 40 },
      { key: 'confidece', name: 'Confidence and Delivery', weight: 30, maxScore: 30 },
      { key: 'stage_presence', name: 'Stage Presence', weight: 20, maxScore: 20 },
      { key: 'overall_impact', name: 'Overall Impact', weight: 10, maxScore: 10 }
    ],
    swimwear: [
      { key: 'physical_fitness', name: 'Physical Fitness', weight: 30, maxScore: 30 },
      { key: 'confidence_presence', name: 'Confidence & Presence', weight: 30, maxScore: 30 },
      { key: 'swimwear_fit', name: 'Swimwear Fit', weight: 25, maxScore: 25 },
      { key: 'stage_presence', name: 'Stage Presence', weight: 15, maxScore: 15 }
    ],
    gown: [
      { key: 'elegance_style', name: 'Elegance & Style', weight: 40, maxScore: 40 },
      { key: 'poise_bearing', name: 'Poise & Bearing ', weight: 20, maxScore: 20 },
      { key: 'style_design', name: 'Style & Design', weight: 20, maxScore: 20 },
      { key: 'confidence', name: 'Confidence', weight: 20, maxScore: 20 }
    ],
    qa: [
      { key: 'intelligence_articulateness', name: 'Intelligence & Articulateness', weight: 60, maxScore: 60 },
      { key: 'physical_attributes', name: 'Physical Attributes', weight: 20, maxScore: 20 },
      { key: 'personality_poise_carreage', name: 'Personality, Poise & Cerreage', weight: 20, maxScore: 20 }
    ]
  };

  const currentCategory = categories[category];
  const currentCandidate = candidates[currentIndex];
  const currentSubCategories = subCategories[category] || [];

  // Calculate total score from sub-category scores
  const calculateTotalScore = () => {
    let total = 0;
    currentSubCategories.forEach(subCat => {
      const subScore = parseFloat(subCategoryScores[subCat.key] || 0);
      total += subScore;
    });
    return Math.min(total, 100); // Ensure it doesn't exceed 100
  };

  // Update main score when sub-category scores change
  useEffect(() => {
    const totalScore = calculateTotalScore();
    setScore(totalScore.toString());
  }, [subCategoryScores]);

  // Load candidates for current category
  useEffect(() => {
    loadCandidatesForJudging();
  }, [category]);

  // Reset sub-category scores when candidate changes
  useEffect(() => {
    setSubCategoryScores({});
    setScore('');
  }, [currentIndex, category]);

  const loadCandidatesForJudging = async () => {
    try {
      setLoading(true);
      const response = await candidatesAPI.getForJudging(category);
      const data = response.data.data;
      
      // Create a shallow copy to avoid mutating state directly before setting it
      let sortedCandidates = [...(data.candidates || [])];

      // 1. Grouped: All Female first, then All Male
      // Applies to: production, qa
      if (['production'].includes(category)) {
        sortedCandidates.sort((a, b) => {
          // Sort by Gender first (Female < Male)
          if (a.gender !== b.gender) {
            return a.gender === 'female' ? -1 : 1;
          }
          // Then by Candidate Number
          return a.candidate_number - b.candidate_number;
        });
      }

     else if (['qa'].includes(category)) {
        sortedCandidates.sort((a, b) => {
          // Sort by Gender first (Male > Female)
          if (a.gender !== b.gender) {
            return a.gender === 'male' ? -1 : 1;
          }
          // Then by Candidate Number
          return a.candidate_number - b.candidate_number;
        });
      }
      
      // 2. Interleaved: Female first, then Male (F1, M1, F2, M2...)
      // Applies to: formal_attire, swimwear, qa_preliminary
      else if (['formal_attire', 'qa_preliminary', 'swimwear', 'gown'].includes(category)) {
        sortedCandidates.sort((a, b) => {
          // Sort by Candidate Number first
          if (a.candidate_number !== b.candidate_number) {
            return a.candidate_number - b.candidate_number;
          }
          // If numbers match, Female comes first
          return a.gender === 'female' ? -1 : 1;
        });
      }
      
      else if (['uniform_attire'].includes(category)) {
        sortedCandidates.sort((a, b) => {
          // Sort by Candidate Number first
          if (a.candidate_number !== b.candidate_number) {
            return a.candidate_number - b.candidate_number;
          }
          // If numbers match, Male comes first
          return a.gender === 'male' ? -1 : 1;
        });
      }
      
      setCandidates(sortedCandidates);
      setProgress(data.progress || {});
      setIsQAFinals(data.is_qa_finals || false);
      
      if (data.is_qa_finals && data.message) {
        setMessage(data.message);
      }
      
      if (sortedCandidates.length > 0) {
        // Find the first candidate that hasn't been voted on yet
        const unvotedIndex = sortedCandidates.findIndex(c => !c.has_voted);
        if (unvotedIndex !== -1) {
          setCurrentIndex(unvotedIndex);
        } else {
          setCurrentIndex(0);
        }
      } else {
        setCurrentIndex(0);
        setMessage('No candidates available for voting. Please contact the administrator.');
      }
      
      setScore('');
      setSubCategoryScores({});
    } catch (error) {
      console.error('Error loading candidates:', error);
      if (error.response?.status === 404) {
        setMessage('No candidates found. Please contact the administrator to add candidates.');
      } else {
        setMessage('Error loading candidates. Please try again.');
      }
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubCategoryScoreChange = (subCatKey, value) => {
    const numValue = parseFloat(value) || 0;
    const subCat = currentSubCategories.find(sc => sc.key === subCatKey);
    
    if (subCat && numValue >= 0 && numValue <= subCat.maxScore) {
      setSubCategoryScores(prev => ({
        ...prev,
        [subCatKey]: value
      }));
    }
  };

  const handleScoreSubmit = async () => {
    if (!score || !currentCandidate) return;

    const scoreValue = parseFloat(score);
    if (scoreValue < 0 || scoreValue > 100) {
      setMessage('Score must be between 0 and 100');
      return;
    }

    try {
      setSubmitting(true);
      await scoresAPI.submit({
        candidate_id: currentCandidate.id,
        category: category,
        score: scoreValue,
      });

      // Update candidate as voted
      const updatedCandidates = candidates.map(c => 
        c.id === currentCandidate.id ? { ...c, has_voted: true } : c
      );
      setCandidates(updatedCandidates);

      // Update progress
      setProgress(prev => ({
        ...prev,
        completed: prev.completed + 1,
        remaining: prev.remaining - 1,
        percentage: ((prev.completed + 1) / prev.total) * 100
      }));

      // Move to next unvoted candidate
      const nextUnvotedIndex = updatedCandidates.findIndex((c, index) => 
        index > currentIndex && !c.has_voted
      );

      if (nextUnvotedIndex !== -1) {
        setCurrentIndex(nextUnvotedIndex);
        setScore('');
        setSubCategoryScores({});
        setMessage(`Score submitted! Moving to next candidate.`);
      } else {
        const completionMessage = isQAFinals 
          ? `Score submitted! All Q&A finalists completed.`
          : `Score submitted! All candidates in ${currentCategory.name} category completed.`;
        setMessage(completionMessage);
      }

    } catch (error) {
      console.error('Error submitting score:', error);
      setMessage(error.response?.data?.message || 'Error submitting score. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const navigateCandidate = (direction) => {
    const newIndex = direction === 'next' 
      ? Math.min(currentIndex + 1, candidates.length - 1)
      : Math.max(currentIndex - 1, 0);
    
    setCurrentIndex(newIndex);
    setScore('');
    setSubCategoryScores({});
    setMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-blue-100">Loading voting interface...</p>
        </div>
      </div>
    );
  }

  // Show message if no candidates
  if (!candidates || candidates.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Candidates Available</h3>
            <p className="text-gray-600 mb-4">
              {message || 'No candidates found for this category. Please contact the administrator.'}
            </p>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
              <div>
                <h1 className="text-l font-bold text-white">
                  {currentCategory.name} {isQAFinals ? 'Finals' : 'Voting'}
                </h1>
                <p className="text-sm text-blue-200">Judge: {user?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Q&A Finals Notice */}
        {isQAFinals && (
          <Alert className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
            <Award className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-100">
              <strong>Q&A Finals Round:</strong> You are now voting for the top 3 male and top 3 female finalists who qualified based on their performance in all previous categories.
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Card */}
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {currentCategory.name} {isQAFinals ? 'Finals' : ''} Progress
              </h3>
              <Badge variant="outline" className="border-white/20 text-white">
                {currentIndex + 1} of {candidates.length} {isQAFinals ? 'finalists' : 'candidates'}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-blue-200">
                <span>Category Progress</span>
                <span>{progress.completed || 0}/{progress.total || 0} completed</span>
              </div>
              <Progress value={progress.percentage || 0} className="h-3 bg-white/10" />
            </div>
          </CardContent>
        </Card>

        {/* Candidate Voting Card */}
        {currentCandidate && (
          <Card className="bg-black/20 backdrop-blur-sm border-white/10 animate-fade-in-scale">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                {/* Candidate Photo */}
                <div className="flex justify-center">
                  <div className="relative">
                    <Avatar className="h-60 w-45 border-4 border-white/20">
                      <AvatarImage src={currentCandidate.image_url} />
                      <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {currentCandidate.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {currentCandidate.has_voted && (
                      <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                    )}
                    {isQAFinals && (
                      <div className="absolute -bottom-2 -right-2 bg-yellow-500 rounded-full p-2">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Candidate Info */}
                <div>
                  <Badge variant="outline" className="mb-3 border-white/20 text-white">
                    {isQAFinals ? 'Finalist' : 'Candidate'} #{currentCandidate.candidate_number}
                  </Badge>
                  <h2 className="text-2xl font-bold mb-2 text-white">{currentCandidate.name}</h2>
                  {isQAFinals && (
                    <p className="text-sm text-yellow-200 mt-2">
                      🏆 Qualified as Top 3 {currentCandidate.gender === 'male' ? 'Male' : 'Female'}
                    </p>
                  )}
                </div>

                {/* Voting Status */}
                {currentCandidate.has_voted ? (
                  <Alert className="max-w-md mx-auto bg-green-500/20 border-green-500/30">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-100">
                      You have already voted for this {isQAFinals ? 'finalist' : 'candidate'} in this category.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-6">
                    {/* Sub-Category Scoring */}
                    <div className="max-w-2xl mx-auto">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center">
                        <Calculator className="h-5 w-5 mr-2" />
                        Sub-Category Scoring
                      </h3>
                      <div className="space-y-3">
                        {currentSubCategories.map((subCat) => (
                          <div key={subCat.key} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              <Label className="text-sm font-medium text-white">
                                {subCat.name}
                              </Label>
                              <span className="text-sm text-blue-200">
                                {subCat.weight}%
                              </span>
                            </div>
                            <Input
                              type="number"
                              min="0"
                              max={subCat.maxScore}
                              step="0.01"
                              value={subCategoryScores[subCat.key] || ''}
                              onChange={(e) => handleSubCategoryScoreChange(subCat.key, e.target.value)}
                              className="w-20 border-white text-white text-center"
                              placeholder={`0-${subCat.maxScore}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total Score Display */}
                    <div className="max-w-md mx-auto">
                      <Label className="text-lg font-semibold text-white mb-2 block text-center">
                        Total Score
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={score}
                          readOnly
                          className="w-full text-center text-2xl font-bold bg-white/10 border-white/20 text-white h-16"
                          placeholder="0.00"
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60">
                          / 100
                        </span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={handleScoreSubmit}
                      disabled={!score || submitting || parseFloat(score) === 0}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Submit Score
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center max-w-md mx-auto">
                  <Button
                    variant="outline"
                    onClick={() => navigateCandidate('prev')}
                    disabled={currentIndex === 0}
                    className="border-white/20 text-white bg-white/10"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <span className="text-white/60 text-sm">
                    {currentIndex + 1} of {candidates.length}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={() => navigateCandidate('next')}
                    disabled={currentIndex === candidates.length - 1}
                    className="border-white/20 text-white bg-white/10"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {/* Message Display */}
                {message && (
                  <Alert className="max-w-md mx-auto bg-blue-500/20 border-blue-500/30">
                    <AlertCircle className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-blue-100">
                      {message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CategoryVotingPage;

