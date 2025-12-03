import { Link } from "react-router-dom";
import { useTestStore } from "@/store/testStore";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, FileText, Code, Calendar, Play } from "lucide-react";

export default function CandidateTests() {
  const { user } = useAuthStore();
  const { assignments, tests } = useTestStore();

  const myAssignments = assignments.filter((a) => a.candidateId === user?.id);
  const activeAssignments = myAssignments.filter(
    (a) => a.status === "pending" || a.status === "in_progress"
  );
  const upcomingAssignments = myAssignments.filter((a) => {
    const now = new Date();
    const startTime = new Date(a.scheduledStartTime);
    return a.status === "pending" && startTime > now;
  });

  const getTest = (testId: string) => tests.find((t) => t.id === testId);

  const isTestAvailable = (assignment: typeof assignments[0]) => {
    const now = new Date();
    const startTime = new Date(assignment.scheduledStartTime);
    const endTime = new Date(assignment.scheduledEndTime);
    return now >= startTime && now <= endTime;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Your Tests</h1>
        <p className="text-muted-foreground mt-1">
          View and take your assigned assessments
        </p>
      </div>

      {/* Active Tests */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Active Tests</h2>
        {activeAssignments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {activeAssignments.map((assignment) => {
              const test = getTest(assignment.testId);
              if (!test) return null;

              const available = isTestAvailable(assignment);
              const totalQuestions = test.mcqQuestions.length + test.codingQuestions.length;

              return (
                <Card key={assignment.id} className="overflow-hidden">
                  <div className={`h-1 ${available ? "bg-success" : "bg-warning"}`} />
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{test.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {test.description}
                        </CardDescription>
                      </div>
                      <Badge variant={available ? "success" : "warning"}>
                        {available ? "Available" : "Scheduled"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{test.duration} min</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{test.mcqQuestions.length} MCQs</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Code className="h-4 w-4" />
                        <span>{test.codingQuestions.length} Coding</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Available until{" "}
                        {new Date(assignment.scheduledEndTime).toLocaleString()}
                      </span>
                    </div>

                    <Button
                      asChild
                      className="w-full"
                      disabled={!available}
                      variant={available ? "gradient" : "outline"}
                    >
                      <Link to={`/candidate/test/${assignment.id}/start`}>
                        <Play className="mr-2 h-4 w-4" />
                        {available ? "Start Test" : "Not Available Yet"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No active tests</h3>
              <p className="text-muted-foreground">
                You don't have any tests assigned at the moment
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Upcoming Tests */}
      {upcomingAssignments.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Upcoming Tests</h2>
          <div className="space-y-2">
            {upcomingAssignments.map((assignment) => {
              const test = getTest(assignment.testId);
              if (!test) return null;

              return (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{test.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Starts{" "}
                      {new Date(assignment.scheduledStartTime).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="pending">Upcoming</Badge>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
