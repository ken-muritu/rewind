import { useState, useEffect } from 'react';
import { Target, Plus, Trash2, Edit2, Check, X, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  goalTitleSchema,
  goalDescriptionSchema,
  validateField,
} from '@/lib/validationSchemas';

const triggerGoalConfetti = () => {
  const colors = ['#8B5CF6', '#D946EF', '#10B981', '#F59E0B', '#3B82F6'];
  
  // Burst from left
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.7 },
    colors,
  });
  
  // Burst from right
  confetti({
    particleCount: 50,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.7 },
    colors,
  });
  
  // Center burst
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
  not_started: { label: 'Not Started', color: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-700 dark:text-blue-300' },
  completed: { label: 'Completed', color: 'bg-green-500/20 text-green-700 dark:text-green-300' },
  on_hold: { label: 'On Hold', color: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300' },
};

const CATEGORIES = ['Career', 'Health', 'Finance', 'Relationships', 'Personal Growth', 'Learning', 'Other'];

interface Goal {
  id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  category: string | null;
  created_at: string;
}

interface BlueprintGoalsProps {
  blueprintId: string | null;
}

export const BlueprintGoals = ({ blueprintId }: BlueprintGoalsProps) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<Goal['status']>('not_started');

  useEffect(() => {
    if (blueprintId) {
      fetchGoals();
    } else {
      setGoals([]);
    }
  }, [blueprintId]);

  const fetchGoals = async () => {
    if (!blueprintId) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('blueprint_goals')
      .select('*')
      .eq('blueprint_id', blueprintId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
    } else {
      setGoals((data || []).map(g => ({
        ...g,
        status: g.status as Goal['status']
      })));
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTargetDate('');
    setCategory('');
    setProgress(0);
    setStatus('not_started');
  };

  const addGoal = async () => {
    if (!blueprintId || !title.trim()) return;

    // Validate title
    const titleResult = validateField(goalTitleSchema, title);
    if (!titleResult.success) {
      toast.error('error' in titleResult ? titleResult.error : 'Invalid title');
      return;
    }

    // Validate description if provided
    if (description) {
      const descResult = validateField(goalDescriptionSchema, description);
      if (!descResult.success) {
        toast.error('error' in descResult ? descResult.error : 'Invalid description');
        return;
      }
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('blueprint_goals')
      .insert({
        blueprint_id: blueprintId,
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        target_date: targetDate || null,
        category: category || null,
        progress,
        status
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add goal');
    } else {
      setGoals([{ ...data, status: data.status as Goal['status'] }, ...goals]);
      resetForm();
      setIsAdding(false);
      toast.success('Goal added');
    }
  };

  const updateGoal = async (id: string) => {
    // Validate title
    const titleResult = validateField(goalTitleSchema, title);
    if (!titleResult.success) {
      toast.error('error' in titleResult ? titleResult.error : 'Invalid title');
      return;
    }

    // Validate description if provided
    if (description) {
      const descResult = validateField(goalDescriptionSchema, description);
      if (!descResult.success) {
        toast.error('error' in descResult ? descResult.error : 'Invalid description');
        return;
      }
    }

    const { error } = await supabase
      .from('blueprint_goals')
      .update({
        title: title.trim(),
        description: description.trim() || null,
        target_date: targetDate || null,
        category: category || null,
        progress,
        status
      })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update goal');
    } else {
      setGoals(goals.map(g => g.id === id ? {
        ...g,
        title: title.trim(),
        description: description.trim() || null,
        target_date: targetDate || null,
        category: category || null,
        progress,
        status
      } : g));
      setEditingId(null);
      resetForm();
      toast.success('Goal updated');
    }
  };

  const checkMilestone = (oldProgress: number, newProgress: number): string | null => {
    const milestones = [25, 50, 75, 100];
    for (const milestone of milestones) {
      if (oldProgress < milestone && newProgress >= milestone) {
        return milestone === 100 ? null : `${milestone}%`; // 100% handled separately
      }
    }
    return null;
  };

  const updateProgress = async (id: string, newProgress: number) => {
    const currentGoal = goals.find(g => g.id === id);
    const oldProgress = currentGoal?.progress || 0;
    const newStatus = newProgress === 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'not_started';
    
    const { error } = await supabase
      .from('blueprint_goals')
      .update({ progress: newProgress, status: newStatus })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update progress');
    } else {
      setGoals(goals.map(g => g.id === id ? { ...g, progress: newProgress, status: newStatus } : g));
      
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

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('blueprint_goals')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete goal');
    } else {
      setGoals(goals.filter(g => g.id !== id));
      toast.success('Goal deleted');
    }
  };

  const startEditing = (goal: Goal) => {
    setEditingId(goal.id);
    setTitle(goal.title);
    setDescription(goal.description || '');
    setTargetDate(goal.target_date || '');
    setCategory(goal.category || '');
    setProgress(goal.progress);
    setStatus(goal.status);
  };

  const cancelEditing = () => {
    setEditingId(null);
    resetForm();
  };

  const completedCount = goals.filter(g => g.status === 'completed').length;
  const overallProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)
    : 0;

  if (!blueprintId) return null;

  const GoalForm = ({ isEdit = false, goalId = '' }: { isEdit?: boolean; goalId?: string }) => (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <Input
        placeholder="Goal title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
        autoFocus
      />
      <Textarea
        placeholder="Description (optional)..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="min-h-[80px]"
        maxLength={1000}
      />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Target Date</label>
          <Input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label className="text-sm text-muted-foreground mb-2 block">Progress: {progress}%</label>
        <Slider
          value={[progress]}
          onValueChange={(v) => setProgress(v[0])}
          max={100}
          step={5}
        />
      </div>
      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Status</label>
        <Select value={status} onValueChange={(v) => setStatus(v as Goal['status'])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (isEdit) cancelEditing();
            else { setIsAdding(false); resetForm(); }
          }}
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={() => isEdit ? updateGoal(goalId) : addGoal()}
          disabled={!title.trim()}
        >
          <Check className="h-4 w-4 mr-1" />
          {isEdit ? 'Save' : 'Add Goal'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="mt-8 print:hidden">
      <div 
        className="flex items-center justify-between mb-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Goals & Progress</h3>
          <span className="text-sm text-muted-foreground">
            ({completedCount}/{goals.length} completed)
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        {!isAdding && isExpanded && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => { e.stopPropagation(); setIsAdding(true); }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Goal
          </Button>
        )}
      </div>

      {goals.length > 0 && isExpanded && (
        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {isAdding && <div className="mb-4"><GoalForm /></div>}

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading goals...
              </div>
            ) : goals.length === 0 && !isAdding ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border"
              >
                <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No goals set yet</p>
                <p className="text-sm text-muted-foreground">Add goals to track your blueprint progress</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {goals.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card border border-border rounded-lg p-4 group"
                  >
                    {editingId === goal.id ? (
                      <GoalForm isEdit goalId={goal.id} />
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className={`font-medium ${goal.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                {goal.title}
                              </h4>
                              <Badge variant="outline" className={STATUS_CONFIG[goal.status].color}>
                                {STATUS_CONFIG[goal.status].label}
                              </Badge>
                              {goal.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {goal.category}
                                </Badge>
                              )}
                            </div>
                            {goal.description && (
                              <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                            )}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(goal)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteGoal(goal.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Progress</span>
                            <span className="text-xs font-medium">{goal.progress}%</span>
                          </div>
                          <Slider
                            value={[goal.progress]}
                            onValueChange={(v) => updateProgress(goal.id, v[0])}
                            max={100}
                            step={5}
                            className="cursor-pointer"
                          />
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                          <span>
                            Created {new Date(goal.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          {goal.target_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due {new Date(goal.target_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
