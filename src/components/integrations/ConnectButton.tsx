'use client'

import { Button } from '@/components/ui/button'

interface ConnectButtonProps {
  provider: string;
  isConnected: boolean;
  onConnect: () => void;
}

export function ConnectButton({ provider, isConnected, onConnect }: ConnectButtonProps) {
  return (
    <Button onClick={onConnect} disabled={isConnected}>
      {isConnected ? `Connected to ${provider}` : `Connect to ${provider}`}
    </Button>
  )
} 