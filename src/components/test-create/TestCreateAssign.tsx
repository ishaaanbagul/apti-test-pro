import { useState } from "react";
import { useTestStore } from "@/store/testStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Calendar } from "lucide-react";

export function TestCreateAssign() {
  const { testCreation, addAssignment, removeAssignment } = useTestStore();
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleAddCandidate = () => {
    if (candidateName && candidateEmail && startDate && endDate) {
      addAssignment({
        testId: "",
        candidateId: `candidate-${Date.now()}`,
        candidateName,
        candidateEmail,
        scheduledStartTime: new Date(startDate).toISOString(),
        scheduledEndTime: new Date(endDate).toISOString(),
      });
      setCandidateName("");
      setCandidateEmail("");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign Candidates</CardTitle>
          <CardDescription>
            Add candidates who will take this test. You can also skip this step and assign later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Schedule */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">
                <Calendar className="inline h-4 w-4 mr-1" />
                Start Date & Time
              </Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">
                <Calendar className="inline h-4 w-4 mr-1" />
                End Date & Time
              </Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Add Candidate Form */}
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="candidateName">Candidate Name</Label>
              <Input
                id="candidateName"
                placeholder="John Doe"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="candidateEmail">Email</Label>
              <Input
                id="candidateEmail"
                type="email"
                placeholder="john@example.com"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
              />
            </div>
            <Button
              onClick={handleAddCandidate}
              disabled={!candidateName || !candidateEmail || !startDate || !endDate}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>

          {/* Candidates List */}
          {testCreation.assignments.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testCreation.assignments.map((assignment) => (
                  <TableRow key={assignment.candidateId}>
                    <TableCell className="font-medium">{assignment.candidateName}</TableCell>
                    <TableCell>{assignment.candidateEmail}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(assignment.scheduledStartTime).toLocaleDateString()} -{" "}
                      {new Date(assignment.scheduledEndTime).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAssignment(assignment.candidateId)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {testCreation.assignments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No candidates added yet.</p>
              <p className="text-sm">You can add candidates now or assign them later after publishing.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
