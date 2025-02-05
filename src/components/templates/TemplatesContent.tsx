'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Template {
  id: string;
  name: string;
  spreadsheet_id: string;
  prompt: string | null;
  meeting_link: string | null;
  column_headers: string[] | null;
}

interface TemplateFormData {
  name: string;
  spreadsheetId: string;
  prompt: string;
  meetingLink: string;
}

interface ErrorResponse {
  message: string;
}

interface TemplatesContentProps {
  initialTemplates: Template[];
}

const initialFormData: TemplateFormData = {
  name: '',
  spreadsheetId: '',
  prompt: '',
  meetingLink: '',
};

function extractSpreadsheetId(input: string): string {
  // Handle full URLs
  const urlMatch = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch) return urlMatch[1];

  // Handle direct IDs (if they just paste the ID)
  const idMatch = input.match(/^[a-zA-Z0-9-_]+$/);
  if (idMatch) return input;

  // If no match, return the original input
  return input;
}

type DialogMode = 'create' | 'edit' | null;

interface TemplateFormProps {
  mode: DialogMode;
  formData: TemplateFormData;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isLoading: boolean;
}

const TemplateForm = ({
  mode,
  formData,
  onSubmit,
  onChange,
  isLoading,
}: TemplateFormProps) => (
  <form onSubmit={onSubmit}>
    <DialogHeader>
      <DialogTitle>
        {mode === 'edit' ? 'Edit Template' : 'Create New Template'}
      </DialogTitle>
      <DialogDescription>
        {mode === 'edit'
          ? 'Update your template details below.'
          : 'Create a new template for your meetings. Add a name, spreadsheet link, and optional prompt.'}
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={onChange}
          placeholder="Template name"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="spreadsheetId">Spreadsheet Link</Label>
        <Input
          id="spreadsheetId"
          name="spreadsheetId"
          value={formData.spreadsheetId}
          onChange={onChange}
          placeholder="Google Spreadsheet URL or ID"
          required
        />
        <p className="text-xs text-muted-foreground">
          Paste the full Google Sheets URL or just the spreadsheet ID
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="prompt">Prompt (Optional)</Label>
        <Textarea
          id="prompt"
          name="prompt"
          value={formData.prompt}
          onChange={onChange}
          placeholder="Enter a prompt for the AI"
          className="h-20"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="meetingLink">Meeting Link (Optional)</Label>
        <Input
          id="meetingLink"
          name="meetingLink"
          value={formData.meetingLink}
          onChange={onChange}
          placeholder="Default meeting link"
        />
      </div>
    </div>
    <DialogFooter>
      <Button
        type="submit"
        disabled={isLoading}
        aria-disabled={isLoading}
      >
        {isLoading
          ? mode === 'edit'
            ? 'Updating...'
            : 'Creating...'
          : mode === 'edit'
          ? 'Update Template'
          : 'Create Template'}
      </Button>
    </DialogFooter>
  </form>
);

export function TemplatesContent({ initialTemplates }: TemplatesContentProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [formData, setFormData] = useState<TemplateFormData>(initialFormData);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Fetch templates with initialData
  const { data: templates, error } = useQuery<Template[]>({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await fetch('/api/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
    initialData: initialTemplates,
  });

  // Create template mutation
  const createTemplate = useMutation({
    mutationFn: async (data: TemplateFormData) => {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          spreadsheetId: extractSpreadsheetId(data.spreadsheetId),
          prompt: data.prompt || null,
          meetingLink: data.meetingLink || null,
        }),
      });
      if (!response.ok) throw new Error('Failed to create template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setDialogMode(null);
      setFormData(initialFormData);
      setEditingTemplateId(null);
      toast.success('Template created successfully');
    },
    onError: (error: ErrorResponse) => {
      toast.error(`Error creating template: ${error.message}`);
    },
  });

  // Update template mutation
  const updateTemplate = useMutation({
    mutationFn: async (data: TemplateFormData & { id: string }) => {
      const response = await fetch('/api/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: data.id,
          name: data.name,
          spreadsheetId: extractSpreadsheetId(data.spreadsheetId),
          prompt: data.prompt || null,
          meetingLink: data.meetingLink || null,
        }),
      });
      if (!response.ok) throw new Error('Failed to update template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setDialogMode(null);
      setFormData(initialFormData);
      setEditingTemplateId(null);
      toast.success('Template updated successfully');
    },
    onError: (error: ErrorResponse) => {
      toast.error(`Error updating template: ${error.message}`);
    },
  });

  // Delete template mutation
  const deleteTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await fetch('/api/templates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: templateId }),
      });
      if (!response.ok) throw new Error('Failed to delete template');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template deleted successfully');
    },
    onError: (error: ErrorResponse) => {
      toast.error(`Error deleting template: ${error.message}`);
    },
  });

  const handleDialogClose = () => {
    setDialogMode(null);
    setFormData(initialFormData);
    setEditingTemplateId(null);
  };

  const handleCreateClick = () => {
    setFormData(initialFormData);
    setEditingTemplateId(null);
    setDialogMode('create');
  };

  const handleEditClick = (template: Template) => {
    setFormData({
      name: template.name,
      spreadsheetId: template.spreadsheet_id,
      prompt: template.prompt || '',
      meetingLink: template.meeting_link || '',
    });
    setEditingTemplateId(template.id);
    setDialogMode('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplateId) {
      updateTemplate.mutate({ ...formData, id: editingTemplateId });
    } else {
      createTemplate.mutate(formData);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isLoading = createTemplate.isPending || updateTemplate.isPending;

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-destructive">Error loading templates: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">
            Manage your meeting templates and configurations
          </p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {templates?.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h3 className="text-lg font-semibold">No templates yet</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Create your first template to get started
          </p>
          <div className="mt-6">
            <Button onClick={handleCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pb-6">
            {templates?.map((template: Template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>
                    Spreadsheet ID: {template.spreadsheet_id}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {template.prompt && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {template.prompt}
                    </p>
                  )}
                  {template.column_headers && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Available Fields:
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.column_headers.join(', ')}
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(template)}
                  >
                    <Pencil className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteTemplate.mutate(template.id)}
                    disabled={deleteTemplate.isPending}
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && handleDialogClose()}>
        <DialogContent>
          <TemplateForm
            mode={dialogMode || 'create'}
            formData={formData}
            onSubmit={handleSubmit}
            onChange={handleInputChange}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
