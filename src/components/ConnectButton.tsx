'use client'

import { Button } from '@/components/ui/button'

interface ConnectButtonProps {
  provider: string;
  isConnected: boolean;
  onConnect: () => void;
}

export function ConnectButton({ provider, isConnected, onConnect }: ConnectButtonProps) {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">{provider}</h3>
          <p className="text-sm text-muted-foreground">
            Connect to {provider}
          </p>
        </div>
        <Button onClick={onConnect} disabled={isConnected}>
          {isConnected ? `Connected to ${provider}` : `Connect to ${provider}`}
        </Button>
      </div>
    </div>
  )
} 