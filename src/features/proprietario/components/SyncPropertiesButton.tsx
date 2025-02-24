
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface SyncPropertiesButtonProps {
  onSync: () => Promise<void>;
  isSyncing: boolean;
}

export function SyncPropertiesButton({ onSync, isSyncing }: SyncPropertiesButtonProps) {
  return (
    <Button 
      variant="outline"
      onClick={onSync}
      disabled={isSyncing}
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Sincronizando...' : 'Sincronizar com Planilha'}
    </Button>
  );
}
