import { useState, useEffect } from 'react';
import { StickyNote, Plus, Trash2, Edit2, Check, X, Tag, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { noteContentSchema, noteTagSchema, validateField } from '@/lib/validationSchemas';

const PRESET_TAGS = ['Goal', 'Action Item', 'Reminder', 'Insight', 'Question', 'Priority'];

const TAG_COLORS: Record<string, string> = {
  'Goal': 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30',
  'Action Item': 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
  'Reminder': 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30',
  'Insight': 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
  'Question': 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30',
  'Priority': 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30',
};

interface Note {
  id: string;
  content: string;
  position: number;
  tags: string[];
  created_at: string;
}

interface BlueprintNotesProps {
  blueprintId: string | null;
}

export const BlueprintNotes = ({ blueprintId }: BlueprintNotesProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  // Get all unique tags from notes
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags || [])));

  useEffect(() => {
    if (blueprintId) {
      fetchNotes();
    } else {
      setNotes([]);
    }
  }, [blueprintId]);

  const fetchNotes = async () => {
    if (!blueprintId) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('blueprint_notes')
      .select('*')
      .eq('blueprint_id', blueprintId)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching notes:', error);
    } else {
      setNotes((data || []).map(note => ({
        ...note,
        tags: note.tags || []
      })));
    }
    setIsLoading(false);
  };

  const toggleTag = (tag: string, isEditing: boolean) => {
    if (isEditing) {
      setEditTags(prev => 
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
      );
    } else {
      setNewTags(prev => 
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
      );
    }
  };

  const addCustomTag = (isEditing: boolean) => {
    if (!customTag.trim()) return;
    
    // Validate tag
    const tagResult = validateField(noteTagSchema, customTag);
    if (!tagResult.success) {
      toast.error('error' in tagResult ? tagResult.error : 'Invalid tag');
      return;
    }
    
    const tag = customTag.trim();
    if (isEditing) {
      if (!editTags.includes(tag) && editTags.length < 10) {
        setEditTags([...editTags, tag]);
      }
    } else {
      if (!newTags.includes(tag) && newTags.length < 10) {
        setNewTags([...newTags, tag]);
      }
    }
    setCustomTag('');
  };

  const addNote = async () => {
    if (!blueprintId || !newNote.trim()) return;

    // Validate note content
    const contentResult = validateField(noteContentSchema, newNote);
    if (!contentResult.success) {
      toast.error('error' in contentResult ? contentResult.error : 'Invalid note content');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('blueprint_notes')
      .insert({
        blueprint_id: blueprintId,
        user_id: user.id,
        content: newNote.trim(),
        tags: newTags,
        position: notes.length
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add note');
    } else {
      setNotes([...notes, { ...data, tags: data.tags || [] }]);
      setNewNote('');
      setNewTags([]);
      setIsAdding(false);
      toast.success('Note added');
    }
  };

  const updateNote = async (id: string) => {
    if (!editContent.trim()) return;

    // Validate note content
    const contentResult = validateField(noteContentSchema, editContent);
    if (!contentResult.success) {
      toast.error('error' in contentResult ? contentResult.error : 'Invalid note content');
      return;
    }

    const { error } = await supabase
      .from('blueprint_notes')
      .update({ content: editContent.trim(), tags: editTags })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update note');
    } else {
      setNotes(notes.map(n => n.id === id ? { ...n, content: editContent.trim(), tags: editTags } : n));
      setEditingId(null);
      setEditContent('');
      setEditTags([]);
      toast.success('Note updated');
    }
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase
      .from('blueprint_notes')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete note');
    } else {
      setNotes(notes.filter(n => n.id !== id));
      toast.success('Note deleted');
    }
  };

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
    setEditTags(note.tags || []);
  };

  const filteredNotes = filterTag 
    ? notes.filter(n => n.tags?.includes(filterTag))
    : notes;

  const getTagColor = (tag: string) => {
    return TAG_COLORS[tag] || 'bg-muted text-muted-foreground border-border';
  };

  const TagSelector = ({ selectedTags, isEditing }: { selectedTags: string[], isEditing: boolean }) => (
    <div className="space-y-2 mb-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Tag className="h-3.5 w-3.5" />
        <span>Tags</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {PRESET_TAGS.map(tag => (
          <Badge
            key={tag}
            variant="outline"
            className={`cursor-pointer transition-all ${
              selectedTags.includes(tag) 
                ? getTagColor(tag) 
                : 'hover:bg-muted'
            }`}
            onClick={() => toggleTag(tag, isEditing)}
          >
            {tag}
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Add custom tag..."
          value={customTag}
          onChange={(e) => setCustomTag(e.target.value)}
          maxLength={50}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addCustomTag(isEditing);
            }
          }}
          className="h-8 text-sm"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => addCustomTag(isEditing)}
          disabled={!customTag.trim()}
        >
          Add
        </Button>
      </div>
      {selectedTags.filter(t => !PRESET_TAGS.includes(t)).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.filter(t => !PRESET_TAGS.includes(t)).map(tag => (
            <Badge
              key={tag}
              variant="outline"
              className={`cursor-pointer ${getTagColor(tag)}`}
              onClick={() => toggleTag(tag, isEditing)}
            >
              {tag} ×
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  if (!blueprintId) return null;

  return (
    <div className="mt-8 print:hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <StickyNote className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Personal Notes</h3>
          <span className="text-sm text-muted-foreground">({filteredNotes.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {allTags.length > 0 && (
            <div className="flex items-center gap-1">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterTag || ''}
                onChange={(e) => setFilterTag(e.target.value || null)}
                className="h-8 px-2 text-sm border border-border rounded-md bg-background"
              >
                <option value="">All tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          )}
          {!isAdding && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Note
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="bg-card border border-border rounded-lg p-4">
              <Textarea
                placeholder="Write your note or annotation..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[100px] mb-3"
                maxLength={5000}
                autoFocus
              />
              <TagSelector selectedTags={newTags} isEditing={false} />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setNewNote('');
                    setNewTags([]);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={addNote}
                  disabled={!newNote.trim()}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Save Note
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading notes...
          </div>
        ) : filteredNotes.length === 0 && !isAdding ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border"
          >
            <StickyNote className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              {filterTag ? `No notes with tag "${filterTag}"` : 'No notes yet'}
            </p>
            <p className="text-sm text-muted-foreground">
              {filterTag ? 'Try selecting a different tag' : 'Add personal annotations to your blueprint'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border border-border rounded-lg p-4 group"
              >
                {editingId === note.id ? (
                  <>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[80px] mb-3"
                      maxLength={5000}
                      autoFocus
                    />
                    <TagSelector selectedTags={editTags} isEditing={true} />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingId(null);
                          setEditContent('');
                          setEditTags([]);
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateNote(note.id)}
                        disabled={!editContent.trim()}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {note.tags.map(tag => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className={`text-xs ${getTagColor(tag)}`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-foreground/90 whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        {new Date(note.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(note)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNote(note.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
