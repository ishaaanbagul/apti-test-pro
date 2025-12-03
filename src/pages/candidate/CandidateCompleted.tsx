import { Link } from "react-router-dom";
import { useTestStore } from "@/store/testStore";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, FileDown, CheckCircle } from "lucide-react";

export default function CandidateCompleted() {
  const { user } = useAuthStore();
  const { assignments, tests } = useTestStore();

  const completedAssignments = assignments.filter(
    (a) => a.candidateId === user?.id && a.status === "completed"
  );

  const getTest = (testId: string) => tests.find((t) => t.id === testId);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Completed Tests</h1>
        <p className="text-muted-foreground mt-1">
          View your completed assessments and results
        </p>
      </div>

      {completedAssignments.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Completed On</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedAssignments.map((a) => {
                  const test = getTest(a.testId);
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">
                        {test?.name || "Unknown Test"}
                      </TableCell>
                      <TableCell>
                        {a.completedAt
                          ? new Date(a.completedAt).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xl font-bold ${getScoreColor(a.score || 0)}`}>
                          {a.score}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/candidate/report/${a.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <FileDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No completed tests</h3>
            <p className="text-muted-foreground">
              Complete your assigned tests to see them here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
