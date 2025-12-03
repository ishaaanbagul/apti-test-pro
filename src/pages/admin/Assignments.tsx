import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Eye, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function Assignments() {
  const { assignments, tests } = useTestStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      a.candidateEmail.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || a.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getTestName = (testId: string) => {
    return tests.find((t) => t.id === testId)?.name || "Unknown Test";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Assignments</h1>
        <p className="text-muted-foreground mt-1">
          Manage test assignments and track candidate progress
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by candidate name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Assignments ({filteredAssignments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
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
                    <TableCell>
                      <Link
                        to={`/tests/${a.testId}`}
                        className="text-primary hover:underline"
                      >
                        {getTestName(a.testId)}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">
                      <p>{new Date(a.scheduledStartTime).toLocaleDateString()}</p>
                      <p className="text-muted-foreground">
                        to {new Date(a.scheduledEndTime).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.status}>{a.status.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      {a.score !== undefined ? (
                        <span className="font-semibold">{a.score}%</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {a.status === "completed" && (
                          <Button asChild variant="ghost" size="icon">
                            <Link to={`/reports/${a.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No assignments found</p>
              {(search || statusFilter !== "all") && (
                <p className="text-sm mt-1">Try adjusting your filters</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
