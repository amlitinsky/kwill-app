'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { CreateMeetingDialog } from "./CreateMeetingDialog";

interface MeetingHeaderProps {
  hoursRemaining: number;
}

export function MeetingHeader({ hoursRemaining }: MeetingHeaderProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Meetings</h2>
            <p className="text-sm text-muted-foreground">
              {hoursRemaining} hours remaining this month
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Meeting
          </Button>
        </div>
      </CardContent>

      <CreateMeetingDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </Card>
  );
} 