import { cn } from "@/lib/utils";
import { FileText, Code, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export type QuestionStatus = "not-visited" | "answered" | "marked-for-review" | "current";

interface QuestionNavigationProps {
  mcqCount: number;
  codingCount: number;
  currentIndex: number;
  mcqStatuses: { id: string; isAnswered: boolean; isMarked: boolean; isVisited: boolean }[];
  codingStatuses: { id: string; isAnswered: boolean; isMarked: boolean; isVisited: boolean }[];
  onQuestionSelect: (index: number) => void;
  className?: string;
  variant?: "sidebar" | "bottom";
}

export function QuestionNavigation({
  mcqCount,
  codingCount,
  currentIndex,
  mcqStatuses,
  codingStatuses,
  onQuestionSelect,
  className,
  variant = "sidebar",
}: QuestionNavigationProps) {
  const getButtonClass = (
    index: number,
    status: { isAnswered: boolean; isMarked: boolean; isVisited: boolean }
  ) => {
    const isCurrent = currentIndex === index;

    if (isCurrent) {
      return "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2";
    }
    if (status.isMarked) {
      return "bg-warning/20 text-warning border-2 border-warning";
    }
    if (status.isAnswered) {
      return "bg-success/20 text-success border-2 border-success";
    }
    if (status.isVisited) {
      return "bg-muted text-muted-foreground";
    }
    return "bg-background border-2 border-border text-foreground";
  };

  const Legend = () => (
    <div className="flex flex-wrap gap-3 text-xs">
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded bg-success/20 border-2 border-success" />
        <span>Answered</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded bg-warning/20 border-2 border-warning" />
        <span>Review</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded bg-background border-2 border-border" />
        <span>Not Visited</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded bg-primary" />
        <span>Current</span>
      </div>
    </div>
  );

  if (variant === "bottom") {
    return (
      <div className={cn("border-t bg-card p-4", className)}>
        <div className="flex items-center justify-between mb-3">
          <Legend />
        </div>
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {mcqStatuses.map((status, index) => (
              <button
                key={status.id}
                onClick={() => onQuestionSelect(index)}
                className={cn(
                  "h-9 w-9 rounded-lg text-sm font-medium transition-all flex-shrink-0 relative",
                  getButtonClass(index, status)
                )}
              >
                {index + 1}
                {status.isMarked && (
                  <Flag className="absolute -top-1 -right-1 h-3 w-3 text-warning fill-warning" />
                )}
              </button>
            ))}
            {codingStatuses.map((status, index) => {
              const globalIndex = mcqCount + index;
              return (
                <button
                  key={status.id}
                  onClick={() => onQuestionSelect(globalIndex)}
                  className={cn(
                    "h-9 min-w-[2.25rem] px-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 relative",
                    getButtonClass(globalIndex, status)
                  )}
                >
                  C{index + 1}
                  {status.isMarked && (
                    <Flag className="absolute -top-1 -right-1 h-3 w-3 text-warning fill-warning" />
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <aside className={cn("w-64 border-r bg-card flex flex-col", className)}>
      <div className="p-4 border-b">
        <Legend />
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {mcqCount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
                <FileText className="h-3 w-3" />
                MCQ ({mcqStatuses.filter(s => s.isAnswered).length}/{mcqCount})
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {mcqStatuses.map((status, index) => (
                  <button
                    key={status.id}
                    onClick={() => onQuestionSelect(index)}
                    className={cn(
                      "h-8 w-8 rounded-lg text-sm font-medium transition-all relative",
                      getButtonClass(index, status)
                    )}
                  >
                    {index + 1}
                    {status.isMarked && (
                      <Flag className="absolute -top-1 -right-1 h-2.5 w-2.5 text-warning fill-warning" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {codingCount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
                <Code className="h-3 w-3" />
                Coding ({codingStatuses.filter(s => s.isAnswered).length}/{codingCount})
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {codingStatuses.map((status, index) => {
                  const globalIndex = mcqCount + index;
                  return (
                    <button
                      key={status.id}
                      onClick={() => onQuestionSelect(globalIndex)}
                      className={cn(
                        "h-8 w-8 rounded-lg text-xs font-medium transition-all relative",
                        getButtonClass(globalIndex, status)
                      )}
                    >
                      C{index + 1}
                      {status.isMarked && (
                        <Flag className="absolute -top-1 -right-1 h-2.5 w-2.5 text-warning fill-warning" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
