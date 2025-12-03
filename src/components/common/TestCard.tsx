import { Link } from "react-router-dom";
import { Test } from "@/store/testStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, FileText, Code, Calendar, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TestCardProps {
  test: Test;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TestCard({ test, onEdit, onDelete }: TestCardProps) {
  const totalQuestions = test.mcqQuestions.length + test.codingQuestions.length;
  const totalPoints = [
    ...test.mcqQuestions.map((q) => q.points),
    ...test.codingQuestions.map((q) => q.points),
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="group rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:shadow-md hover:border-primary/20">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant={test.status as any}>{test.status}</Badge>
            {test.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <Link to={`/tests/${test.id}`}>
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {test.name}
            </h3>
          </Link>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {test.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{test.duration} min</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{test.mcqQuestions.length} MCQs</span>
            </div>
            <div className="flex items-center gap-1">
              <Code className="h-4 w-4" />
              <span>{test.codingQuestions.length} Coding</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium text-foreground">{totalPoints}</span>
              <span>points</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Updated {new Date(test.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/tests/${test.id}`}>View Details</Link>
            </DropdownMenuItem>
            {test.status === 'draft' && onEdit && (
              <DropdownMenuItem onClick={onEdit}>Edit Test</DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                Delete Test
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
