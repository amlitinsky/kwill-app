'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Edit2, HelpCircle, AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CalendlyTemplate {
  id: string;
  name: string;
  uri: string;
  spreadsheet_id: string | null;
  prompt: string | null;
  active: boolean;
}

interface CalendlyTemplatesProps {
  initialTemplates?: CalendlyTemplate[] | null;
}

// Helper function to extract spreadsheet ID from URL
function extractedSpreadsheetId(url: string): string | null {
  try {
    const matches = url.match(/\/d\/(.*?)\/|$|\/edit/);
    return matches ? matches[1] : null;
  } catch (error) {
    return null;
  }
}

const LoadingRow = ({ delay = 0 }) => (
  <motion.tr
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    <TableCell><div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div></TableCell>
    <TableCell><div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div></TableCell>
    <TableCell><div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div></TableCell>
    <TableCell><div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div></TableCell>
    <TableCell><div className="h-4 bg-gray-200 rounded w-8"></div></TableCell>
  </motion.tr>
);

export function CalendlyTemplates({ initialTemplates = null }: CalendlyTemplatesProps) {
  const [templates, setTemplates] = useState<CalendlyTemplate[]>(initialTemplates || []);
  const [loading, setLoading] = useState(!initialTemplates);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<{
    spreadsheet_id?: string;
    prompt?: string;
  }>({});
  const [calendlyEnabled, setCalendlyEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {

    async function syncTemplates() {
      try {
        const response = await fetch('/api/calendly/templates', {
          method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to sync');
        const data = await response.json();
        setCalendlyEnabled(data.calendlyEnabled);
        setTemplates(data.templates || []);
        if (data.added > 0) {
          toast({
            title: 'Success',
            description: data.message
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load Calendly configurations',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }

    if (!initialTemplates) {
      syncTemplates();
    }
  }, [initialTemplates]);


  async function updateTemplate(id: string, updates: Partial<CalendlyTemplate>) {
    try {
      // Process spreadsheet URL if provided
      if (updates.spreadsheet_id) {
        const spreadsheetId = extractedSpreadsheetId(updates.spreadsheet_id);
        if (!spreadsheetId) {
          toast({
            title: 'Error',
            description: 'Invalid Google Sheets URL',
            variant: 'destructive'
          });
          return;
        }
        updates.spreadsheet_id = spreadsheetId;
      }

      const response = await fetch('/api/calendly/templates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      
      if (!response.ok) throw new Error('Failed to update');
      
      setTemplates(templates.map(template => 
        template.id === id ? { ...template, ...updates } : template
      ));
      setEditingId(null);
      
      toast({
        title: 'Success',
        description: 'Configuration updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update configuration',
        variant: 'destructive'
      });
    }
  }

  const handleSave = async (id: string) => {
    await updateTemplate(id, editingValues);
    setEditingId(null);
    setEditingValues({});
  };

  if (!calendlyEnabled) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Calendly integration is not enabled. Please purchase a plan that includes Calendly integration to access this feature.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Type</TableHead>
              <TableHead>Spreadsheet</TableHead>
              <TableHead>Prompt</TableHead>
              <TableHead>Active</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <LoadingRow delay={0.1} />
            <LoadingRow delay={0.2} />
            <LoadingRow delay={0.3} />
          </TableBody>
        </Table>
      </motion.div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Event Type Configurations</h3>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Type</TableHead>
              <TableHead>
                <div className="flex items-center space-x-2">
                  <span>Spreadsheet</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Paste a Google Sheets URL to connect your event type</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center space-x-2">
                  <span>Prompt</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Prompt for the AI assistant during meetings</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableHead>
              <TableHead>Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell>
                  {editingId === template.id ? (
                    <div className="space-y-1">
                      <Input
                        value={editingValues.spreadsheet_id || ''}
                        onChange={(e) => setEditingValues(prev => ({
                          ...prev,
                          spreadsheet_id: e.target.value
                        }))}
                        placeholder="Paste Google Sheets URL"
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Current ID: {template.spreadsheet_id || 'None'}
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {template.spreadsheet_id || 'No spreadsheet connected'}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === template.id ? (
                    <div className="space-y-1">
                      <Textarea
                        value={editingValues.prompt || ''}
                        onChange={(e) => setEditingValues(prev => ({
                          ...prev,
                          prompt: e.target.value
                        }))}
                        placeholder="Enter prompt for AI assist"
                        className="min-h-[100px]"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {template.prompt || 'No prompt'}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={template.active}
                    onCheckedChange={(checked) => 
                      updateTemplate(template.id, { active: checked })
                    }
                    disabled={!template.spreadsheet_id}
                  />
                </TableCell>
                <TableCell>
                  {editingId === template.id ? (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingId(null);
                          setEditingValues({});
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleSave(template.id)}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(editingId === template.id ? null : template.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}