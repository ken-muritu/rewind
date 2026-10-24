import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  totalActiveDays: number;
}

export const useStreak = (userId: string | undefined) => {
  const { data: reflections } = useQuery({
    queryKey: ['reflections-for-streak', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('reflections')
        .select('created_at, completed_at, started_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const streakData = useMemo((): StreakData => {
    if (!reflections || reflections.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastActivityDate: null, totalActiveDays: 0 };
    }

    // Get unique dates when user had activity
    const activityDates = new Set<string>();
    reflections.forEach(r => {
      const date = r.completed_at || r.started_at || r.created_at;
      if (date) {
        activityDates.add(new Date(date).toDateString());
      }
    });

    const sortedDates = Array.from(activityDates)
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    if (sortedDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastActivityDate: null, totalActiveDays: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastActivity = sortedDates[0];
    lastActivity.setHours(0, 0, 0, 0);

    // Calculate current streak
    let currentStreak = 0;
    const isActiveToday = lastActivity.getTime() === today.getTime();
    const isActiveYesterday = lastActivity.getTime() === yesterday.getTime();

    if (isActiveToday || isActiveYesterday) {
      currentStreak = 1;
      let checkDate = new Date(lastActivity);
      
      for (let i = 1; i < sortedDates.length; i++) {
        checkDate.setDate(checkDate.getDate() - 1);
        const nextDate = sortedDates[i];
        nextDate.setHours(0, 0, 0, 0);
        
        if (nextDate.getTime() === checkDate.getTime()) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const current = new Date(sortedDates[i]);
      const next = new Date(sortedDates[i + 1]);
      current.setHours(0, 0, 0, 0);
      next.setHours(0, 0, 0, 0);
      
      const diffDays = Math.round((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      currentStreak,
      longestStreak,
      lastActivityDate: sortedDates[0],
      totalActiveDays: sortedDates.length,
    };
  }, [reflections]);

  return streakData;
};
