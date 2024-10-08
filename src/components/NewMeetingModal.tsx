'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function NewMeetingModal({ isOpen, onClose, onSubmit }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [spreadsheetLink, setSpreadsheetLink] = useState('');
  const [zoomLink, setZoomLink] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const response = await fetch('/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spreadsheetLink, zoomLink, customInstructions }),
    });

    if (response.ok) {
      onClose();
      onSubmit();
    } else {
      throw new Error("An error has occurred in creating a new query");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <form onSubmit={handleSubmit}>
        <Input
          value={spreadsheetLink}
          onChange={(e) => setSpreadsheetLink(e.target.value)}
          placeholder="Spreadsheet Link"
        />
        <Input
          value={zoomLink}
          onChange={(e) => setZoomLink(e.target.value)}
          placeholder="Zoom Link"
        />
        <Textarea
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
          placeholder="Custom Instructions"
        />
        <Button type="submit">Create Query</Button>
      </form>
    </Dialog>
  );
}