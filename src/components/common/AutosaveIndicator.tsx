import { cn } from "@/lib/utils";
import { Cloud, CloudOff, Loader2 } from "lucide-react";

interface AutosaveIndicatorProps {
  status: 'saved' | 'saving' | 'error';
  lastSaved?: string | null;
  className?: string;
}

export function AutosaveIndicator({ status, lastSaved, className }: AutosaveIndicatorProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: 'Saving...',
          color: 'text-muted-foreground',
        };
      case 'saved':
        return {
          icon: <Cloud className="h-4 w-4" />,
          text: lastSaved 
            ? `Saved at ${new Date(lastSaved).toLocaleTimeString()}` 
            : 'Saved',
          color: 'text-success',
        };
      case 'error':
        return {
          icon: <CloudOff className="h-4 w-4" />,
          text: 'Save failed',
          color: 'text-destructive',
        };
    }
  };

  const display = getStatusDisplay();

  return (
    <div className={cn(
      "flex items-center gap-2 text-sm",
      display.color,
      className
    )}>
      {display.icon}
      <span>{display.text}</span>
    </div>
  );
}
