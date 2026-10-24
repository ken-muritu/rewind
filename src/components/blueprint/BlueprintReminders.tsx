import { useState, useEffect } from 'react';
import { Bell, BellOff, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BlueprintRemindersProps {
  blueprintId: string | null;
}

export const BlueprintReminders = ({ blueprintId }: BlueprintRemindersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [lastSent, setLastSent] = useState<string | null>(null);

  useEffect(() => {
    fetchReminderStatus();
  }, []);

  const fetchReminderStatus = async () => {
    setIsLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setUserEmail(user.email || null);

    const { data, error } = await supabase
      .from('blueprint_reminders')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching reminder status:', error);
    } else if (data) {
      setIsActive(data.is_active);
      setLastSent(data.last_sent_at);
    }
    
    setIsLoading(false);
  };

  const toggleReminders = async () => {
    setIsSaving(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
      toast.error('Please ensure you have an email address set');
      setIsSaving(false);
      return;
    }

    const newStatus = !isActive;

    // Check if subscription exists
    const { data: existing } = await supabase
      .from('blueprint_reminders')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    let error;

    if (existing) {
      const result = await supabase
        .from('blueprint_reminders')
        .update({ is_active: newStatus })
        .eq('id', existing.id);
      error = result.error;
    } else {
      // Create new
      const result = await supabase
        .from('blueprint_reminders')
        .insert({
          user_id: user.id,
          email: user.email,
          is_active: newStatus
        });
      error = result.error;
    }

    if (error) {
      console.error('Error updating reminders:', error);
      toast.error('Failed to update reminder settings');
    } else {
      setIsActive(newStatus);
      toast.success(newStatus ? 'Weekly reminders enabled!' : 'Weekly reminders disabled');
    }
    
    setIsSaving(false);
  };

  if (!blueprintId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {isActive ? (
            <Bell className="h-4 w-4 mr-2" />
          ) : (
            <BellOff className="h-4 w-4 mr-2" />
          )}
          Reminders
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Weekly Blueprint Reminders
          </DialogTitle>
          <DialogDescription>
            Get weekly emails to help you stay on track with your blueprint goals.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Weekly Email Reminders</p>
                <p className="text-sm text-muted-foreground">
                  {userEmail || 'Loading...'}
                </p>
              </div>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={toggleReminders}
              disabled={isLoading || isSaving}
            />
          </div>

          {isActive && (
            <div className="text-sm text-muted-foreground space-y-2">
              <p>✓ Weekly review of your blueprint goals</p>
              <p>✓ Reflection prompts to track progress</p>
              <p>✓ Motivation to stay on track</p>
              {lastSent && (
                <p className="pt-2 text-xs">
                  Last reminder sent: {new Date(lastSent).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              )}
            </div>
          )}

          {!isActive && !isLoading && (
            <p className="text-sm text-muted-foreground">
              Enable reminders to receive weekly emails with your goals and reflection prompts.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
