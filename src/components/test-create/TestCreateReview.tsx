import { useTestStore } from "@/store/testStore";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, FileText, Code, Users, CheckCircle } from "lucide-react";

export function TestCreateReview() {
  const { testCreation } = useTestStore();
  const { basicInfo, selectedMCQs, selectedCoding, assignments } = testCreation;

  const totalQuestions = selectedMCQs.length + selectedCoding.length;
  const totalPoints = [
    ...selectedMCQs.map((q) => q.points),
    ...selectedCoding.map((q) => q.points),
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Review Your Test
          </CardTitle>
          <CardDescription>
            Review all details before publishing your test
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Test Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Test Name</p>
                <p className="font-medium">{basicInfo.name || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{basicInfo.duration} minutes</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Questions Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Questions Overview</h3>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">MCQ Questions</p>
                  <p className="text-xl font-semibold">{selectedMCQs.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                <Code className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Coding Questions</p>
                  <p className="text-xl font-semibold">{selectedCoding.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Questions</p>
                  <p className="text-xl font-semibold">{totalQuestions}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                <CheckCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-xl font-semibold">{totalPoints}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* MCQ Questions List */}
          {selectedMCQs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">MCQ Questions</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedMCQs.map((q, index) => (
                    <TableRow key={q.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="max-w-md">
                        <p className="truncate">{q.question}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={q.difficulty}>{q.difficulty}</Badge>
                      </TableCell>
                      <TableCell>{q.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Coding Questions List */}
          {selectedCoding.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Coding Questions</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedCoding.map((q, index) => (
                    <TableRow key={q.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <p className="font-medium">{q.title}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-xs">
                          {q.description.slice(0, 60)}...
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={q.difficulty}>{q.difficulty}</Badge>
                      </TableCell>
                      <TableCell>{q.language}</TableCell>
                      <TableCell>{q.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Separator />

          {/* Assignments */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Assignments</h3>
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Candidates Assigned</p>
                <p className="text-xl font-semibold">{assignments.length}</p>
              </div>
            </div>

            {assignments.length > 0 && (
              <div className="mt-4 space-y-2">
                {assignments.map((a) => (
                  <div
                    key={a.candidateId}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="font-medium">{a.candidateName}</p>
                      <p className="text-sm text-muted-foreground">{a.candidateEmail}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{new Date(a.scheduledStartTime).toLocaleDateString()}</p>
                      <p>to {new Date(a.scheduledEndTime).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {assignments.length === 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                No candidates assigned. You can assign candidates after publishing.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}