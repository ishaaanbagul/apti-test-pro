import { cn } from "@/lib/utils";
import { Clock, AlertTriangle } from "lucide-react";

interface TimerDisplayProps {
  remainingSeconds: number;
  className?: string;
}

export function TimerDisplay({ remainingSeconds, className }: TimerDisplayProps) {
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const isLow = remainingSeconds < 300; // Less than 5 minutes
  const isCritical = remainingSeconds < 60; // Less than 1 minute

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-lg font-semibold transition-all",
        isCritical 
          ? "bg-destructive/10 text-destructive animate-pulse-soft" 
          : isLow 
            ? "bg-warning/10 text-warning" 
            : "bg-muted text-foreground",
        className
      )}
    >
      {isCritical ? (
        <AlertTriangle className="h-5 w-5" />
      ) : (
        <Clock className="h-5 w-5" />
      )}
      <span>
        {hours > 0 && `${formatNumber(hours)}:`}
        {formatNumber(minutes)}:{formatNumber(seconds)}
      </span>
    </div>
  );
}
