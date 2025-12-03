import { useState } from "react";
import { Link } from "react-router-dom";
import { useTestStore } from "@/store/testStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, FileDown, Eye } from "lucide-react";

export default function Reports() {
  const { assignments, tests } = useTestStore();
  const [search, setSearch] = useState("");

  const completedAssignments = assignments.filter((a) => a.status === "completed");

  const filteredAssignments = completedAssignments.filter((a) => {
    return (
      a.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      a.candidateEmail.toLowerCase().includes(search.toLowerCase())
    );
  });

  const getTestName = (testId: string) => {
    return tests.find((t) => t.id === testId)?.name || "Unknown Test";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-1">
          View detailed reports for completed assessments
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by candidate name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Completed Assessments ({filteredAssignments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{a.candidateName}</p>
                        <p className="text-sm text-muted-foreground">{a.candidateEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getTestName(a.testId)}</TableCell>
                    <TableCell className="text-sm">
                      {a.completedAt
                        ? new Date(a.completedAt).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xl font-bold ${getScoreColor(a.score || 0)}`}>
                        {a.score}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/reports/${a.id}`}>
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
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No completed assessments found</p>
              {search && (
                <p className="text-sm mt-1">Try adjusting your search</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
