import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Target, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Calendar,
  CheckCircle2,
  Clock,
  Pause,
  Circle,
  Download,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';


const triggerGoalConfetti = () => {
  const colors = ['#8B5CF6', '#D946EF', '#10B981', '#F59E0B', '#3B82F6'];
  
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.7 },
    colors,
  });
  
  confetti({
    particleCount: 50,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.7 },
    colors,
  });
  
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });
  }, 150);
};

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', color: 'bg-muted text-muted-foreground', icon: Circle },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-700 dark:text-blue-300', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-500/20 text-green-700 dark:text-green-300', icon: CheckCircle2 },
  on_hold: { label: 'On Hold', color: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300', icon: Pause },
};

type GoalStatus = keyof typeof STATUS_CONFIG;

interface Goal {
  id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  progress: number;
  status: GoalStatus;
  category: string | null;
  created_at: string;
  blueprint_id: string;
  blueprint_date: string;
}

interface Blueprint {
  id: string;
  created_at: string;
}

const GoalsDashboard = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [blueprintFilter, setBlueprintFilter] = useState<string>('all');
  
  // Sorting
  const [sortBy, setSortBy] = useState<'created_at' | 'progress' | 'target_date' | 'title'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    await fetchData();
  };

  const fetchData = async () => {
    setIsLoading(true);
    
    // Fetch blueprints
    const { data: blueprintsData, error: bpError } = await supabase
      .from('blueprints')
      .select('id, created_at')
      .order('created_at', { ascending: false });

    if (bpError) {
      console.error('Error fetching blueprints:', bpError);
    } else {
      setBlueprints(blueprintsData || []);
    }

    const blueprintDates = Object.fromEntries(
      (blueprintsData || []).map((bp) => [bp.id, bp.created_at])
    );

    const { data: goalsData, error: goalsError } = await supabase
      .from('blueprint_goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (goalsError) {
      console.error('Error fetching goals:', goalsError);
    } else {
      const formattedGoals = (goalsData || []).map((g: Record<string, unknown>) => ({
        ...g,
        status: g.status as GoalStatus,
        blueprint_date: blueprintDates[String(g.blueprint_id)] || null,
      }));
      setGoals(formattedGoals);
    }

    setIsLoading(false);
  };

  const checkMilestone = (oldProgress: number, newProgress: number): string | null => {
    const milestones = [25, 50, 75, 100];
    for (const milestone of milestones) {
      if (oldProgress < milestone && newProgress >= milestone) {
        return milestone === 100 ? null : `${milestone}%`;
      }
    }
    return null;
  };

  const updateGoalProgress = async (goalId: string, newProgress: number) => {
    const currentGoal = goals.find(g => g.id === goalId);
    const oldProgress = currentGoal?.progress || 0;
    const newStatus: GoalStatus = newProgress === 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'not_started';
    
    const { error } = await supabase
      .from('blueprint_goals')
      .update({ progress: newProgress, status: newStatus })
      .eq('id', goalId);

    if (error) {
      toast.error('Failed to update progress');
    } else {
      setGoals(goals.map(g => g.id === goalId ? { ...g, progress: newProgress, status: newStatus } : g));
      
      if (newProgress === 100) {
        triggerGoalConfetti();
        toast.success('🎉 Goal completed! Amazing work!', {
          description: 'You did it! Time to celebrate this achievement.',
          duration: 5000,
        });
      } else {
        const milestone = checkMilestone(oldProgress, newProgress);
        if (milestone) {
          const messages: Record<string, { title: string; description: string }> = {
            '25%': { title: '🚀 25% milestone reached!', description: 'Great start! Keep the momentum going.' },
            '50%': { title: '⭐ Halfway there!', description: "You're 50% done. The finish line is in sight!" },
            '75%': { title: '🔥 75% complete!', description: "Almost there! Just a little more to go." },
          };
          const msg = messages[milestone];
          if (msg) {
            toast.success(msg.title, { description: msg.description, duration: 4000 });
          }
        }
      }
    }
  };

  // Get unique categories from goals
  const categories = Array.from(new Set(goals.filter(g => g.category).map(g => g.category!)));

  // Filter and sort goals
  const filteredGoals = goals
    .filter(goal => {
      if (searchQuery && !goal.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (statusFilter !== 'all' && goal.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && goal.category !== categoryFilter) return false;
      if (blueprintFilter !== 'all' && goal.blueprint_id !== blueprintFilter) return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'progress':
          comparison = a.progress - b.progress;
          break;
        case 'target_date':
          if (!a.target_date) return 1;
          if (!b.target_date) return -1;
          comparison = new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'created_at':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Stats
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const inProgressGoals = goals.filter(g => g.status === 'in_progress').length;
  const overallProgress = totalGoals > 0 
    ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / totalGoals) 
    : 0;

  // Export to CSV
  const exportToCSV = () => {
    if (filteredGoals.length === 0) {
      toast.error('No goals to export');
      return;
    }

    const headers = ['Title', 'Description', 'Category', 'Status', 'Progress', 'Target Date', 'Created Date'];
    const rows = filteredGoals.map(goal => [
      `"${goal.title.replace(/"/g, '""')}"`,
      `"${(goal.description || '').replace(/"/g, '""')}"`,
      goal.category || '',
      STATUS_CONFIG[goal.status].label,
      `${goal.progress}%`,
      goal.target_date ? new Date(goal.target_date).toLocaleDateString() : '',
      new Date(goal.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `goals-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Goals exported to CSV');
  };

  // Export to PDF (print-friendly view) - using safe DOM-based approach
  const exportToPDF = () => {
    if (filteredGoals.length === 0) {
      toast.error('No goals to export');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to export PDF');
      return;
    }

    const doc = printWindow.document;
    
    // Create document structure using DOM API (safer than document.write)
    doc.open();
    
    // Create HTML element
    const html = doc.createElement('html');
    
    // Create head
    const head = doc.createElement('head');
    const title = doc.createElement('title');
    title.textContent = `Goals Export - ${new Date().toLocaleDateString()}`;
    head.appendChild(title);
    
    // Create style element
    const style = doc.createElement('style');
    style.textContent = `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        padding: 40px;
        color: #333;
      }
      h1 { 
        font-size: 28px; 
        margin-bottom: 8px;
        color: #1a1a1a;
      }
      .subtitle {
        color: #666;
        margin-bottom: 24px;
        font-size: 14px;
      }
      .stats {
        display: flex;
        gap: 24px;
        margin-bottom: 32px;
        padding: 16px;
        background: #f5f5f5;
        border-radius: 8px;
      }
      .stat {
        text-align: center;
      }
      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #1a1a1a;
      }
      .stat-label {
        font-size: 12px;
        color: #666;
      }
      .goal {
        border: 1px solid #e5e5e5;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
        page-break-inside: avoid;
      }
      .goal-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
      }
      .goal-title {
        font-size: 16px;
        font-weight: 600;
      }
      .goal-title.completed {
        text-decoration: line-through;
        color: #999;
      }
      .badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
      }
      .badge-completed { background: #dcfce7; color: #166534; }
      .badge-in_progress { background: #dbeafe; color: #1e40af; }
      .badge-not_started { background: #f3f4f6; color: #6b7280; }
      .badge-on_hold { background: #fef3c7; color: #92400e; }
      .badge-category { background: #f3f4f6; color: #374151; margin-left: 4px; }
      .goal-description {
        font-size: 13px;
        color: #666;
        margin: 8px 0;
      }
      .progress-bar {
        height: 8px;
        background: #e5e5e5;
        border-radius: 4px;
        overflow: hidden;
        margin: 12px 0 8px;
      }
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #8b5cf6, #d946ef);
        border-radius: 4px;
      }
      .goal-meta {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: #999;
      }
      @media print {
        body { padding: 20px; }
        .goal { break-inside: avoid; }
      }
    `;
    head.appendChild(style);
    html.appendChild(head);
    
    // Create body
    const body = doc.createElement('body');
    
    // Add title
    const h1 = doc.createElement('h1');
    h1.textContent = 'Goals Dashboard';
    body.appendChild(h1);
    
    // Add subtitle
    const subtitle = doc.createElement('p');
    subtitle.className = 'subtitle';
    subtitle.textContent = `Exported on ${new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`;
    body.appendChild(subtitle);
    
    // Add stats section
    const statsDiv = doc.createElement('div');
    statsDiv.className = 'stats';
    
    const statsData = [
      { value: totalGoals, label: 'Total Goals' },
      { value: completedGoals, label: 'Completed' },
      { value: inProgressGoals, label: 'In Progress' },
      { value: `${overallProgress}%`, label: 'Overall Progress' }
    ];
    
    statsData.forEach(stat => {
      const statDiv = doc.createElement('div');
      statDiv.className = 'stat';
      
      const valueDiv = doc.createElement('div');
      valueDiv.className = 'stat-value';
      valueDiv.textContent = String(stat.value);
      statDiv.appendChild(valueDiv);
      
      const labelDiv = doc.createElement('div');
      labelDiv.className = 'stat-label';
      labelDiv.textContent = stat.label;
      statDiv.appendChild(labelDiv);
      
      statsDiv.appendChild(statDiv);
    });
    body.appendChild(statsDiv);
    
    // Add goals - using textContent for all user data (automatically escapes HTML)
    filteredGoals.forEach(goal => {
      const goalDiv = doc.createElement('div');
      goalDiv.className = 'goal';
      
      // Goal header
      const headerDiv = doc.createElement('div');
      headerDiv.className = 'goal-header';
      
      const titleSpan = doc.createElement('span');
      titleSpan.className = `goal-title ${goal.status === 'completed' ? 'completed' : ''}`;
      titleSpan.textContent = goal.title; // textContent auto-escapes
      headerDiv.appendChild(titleSpan);
      
      const badgesDiv = doc.createElement('div');
      
      const statusBadge = doc.createElement('span');
      statusBadge.className = `badge badge-${goal.status}`;
      statusBadge.textContent = STATUS_CONFIG[goal.status as GoalStatus]?.label || goal.status;
      badgesDiv.appendChild(statusBadge);
      
      if (goal.category) {
        const categoryBadge = doc.createElement('span');
        categoryBadge.className = 'badge badge-category';
        categoryBadge.textContent = goal.category; // textContent auto-escapes
        badgesDiv.appendChild(categoryBadge);
      }
      
      headerDiv.appendChild(badgesDiv);
      goalDiv.appendChild(headerDiv);
      
      // Description
      if (goal.description) {
        const descP = doc.createElement('p');
        descP.className = 'goal-description';
        descP.textContent = goal.description; // textContent auto-escapes
        goalDiv.appendChild(descP);
      }
      
      // Progress bar
      const progressBar = doc.createElement('div');
      progressBar.className = 'progress-bar';
      
      const progressFill = doc.createElement('div');
      progressFill.className = 'progress-fill';
      const safeProgress = Math.min(100, Math.max(0, goal.progress));
      progressFill.style.width = `${safeProgress}%`;
      progressBar.appendChild(progressFill);
      goalDiv.appendChild(progressBar);
      
      // Meta info
      const metaDiv = doc.createElement('div');
      metaDiv.className = 'goal-meta';
      
      const progressSpan = doc.createElement('span');
      progressSpan.textContent = `Progress: ${safeProgress}%`;
      metaDiv.appendChild(progressSpan);
      
      if (goal.target_date) {
        const dueSpan = doc.createElement('span');
        dueSpan.textContent = `Due: ${new Date(goal.target_date).toLocaleDateString()}`;
        metaDiv.appendChild(dueSpan);
      }
      
      goalDiv.appendChild(metaDiv);
      body.appendChild(goalDiv);
    });
    
    html.appendChild(body);
    
    // Write complete document
    doc.appendChild(html);
    doc.close();
    
    // Trigger print after content loads
    printWindow.onload = () => {
      printWindow.print();
    };
    
    toast.success('PDF export ready - use Print dialog to save as PDF');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="font-bold text-lg">Goals Dashboard</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={filteredGoals.length === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToPDF}
              disabled={filteredGoals.length === 0}
            >
              <FileText className="h-4 w-4 mr-1" />
              PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Target className="h-4 w-4" />
                <span className="text-sm">Total Goals</span>
              </div>
              <p className="text-3xl font-bold">{totalGoals}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Completed</span>
              </div>
              <p className="text-3xl font-bold">{completedGoals}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">In Progress</span>
              </div>
              <p className="text-3xl font-bold">{inProgressGoals}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="text-sm text-muted-foreground mb-2">Overall Progress</div>
              <div className="flex items-center gap-3">
                <Progress value={overallProgress} className="flex-1 h-2" />
                <span className="text-lg font-bold">{overallProgress}%</span>
              </div>
            </div>
          </motion.div>

          {/* Filters & Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-4 mb-6"
          >
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Search goals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {categories.length > 0 && (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {blueprints.length > 1 && (
                <Select value={blueprintFilter} onValueChange={setBlueprintFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Blueprint" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Blueprints</SelectItem>
                    {blueprints.map(bp => (
                      <SelectItem key={bp.id} value={bp.id}>
                        {new Date(bp.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="target_date">Due Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>
            </div>
          </motion.div>

          {/* Goals List */}
          {filteredGoals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-muted/30 rounded-xl border border-dashed border-border"
            >
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No goals found</h3>
              <p className="text-muted-foreground mb-4">
                {goals.length === 0 
                  ? "Add goals from your Blueprint to start tracking progress."
                  : "Try adjusting your filters to see more goals."}
              </p>
              {goals.length === 0 && (
                <Button onClick={() => navigate('/blueprint')}>
                  Go to Blueprint
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredGoals.map((goal, index) => {
                const StatusIcon = STATUS_CONFIG[goal.status].icon;
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className={`font-semibold ${goal.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                            {goal.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={STATUS_CONFIG[goal.status].color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {STATUS_CONFIG[goal.status].label}
                          </Badge>
                          {goal.category && (
                            <Badge variant="secondary" className="text-xs">
                              {goal.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <div>Blueprint</div>
                        <div className="font-medium">
                          {new Date(goal.blueprint_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>

                    {goal.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {goal.description}
                      </p>
                    )}

                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-sm font-medium">{goal.progress}%</span>
                      </div>
                      <Slider
                        value={[goal.progress]}
                        onValueChange={(v) => updateGoalProgress(goal.id, v[0])}
                        max={100}
                        step={5}
                        className="cursor-pointer"
                      />
                    </div>

                    {goal.target_date && (
                      <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Due {new Date(goal.target_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GoalsDashboard;
