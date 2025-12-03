import { useParams, Link } from "react-router-dom";
import { useTestStore } from "@/store/testStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  FileDown,
  Clock,
  CheckCircle,
  XCircle,
  Code,
} from "lucide-react";

export default function CandidateReport() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { assignments, tests } = useTestStore();

  const assignment = assignments.find((a) => a.id === assignmentId);
  const test = assignment ? tests.find((t) => t.id === assignment.testId) : null;

  if (!assignment || !test) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-2xl font-semibold">Report not found</h2>
        <Button asChild className="mt-4">
          <Link to="/candidate/tests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tests
          </Link>
        </Button>
      </div>
    );
  }

  // Mock detailed results
  const mcqResults = test.mcqQuestions.map((q, i) => ({
    question: q.question,
    isCorrect: i % 3 !== 0,
    points: q.points,
  }));

  const codingResults = test.codingQuestions.map((q, i) => ({
    title: q.title,
    testCasesPassed: i === 0 ? 2 : 1,
    totalTestCases: q.testCases.length,
    points: q.points,
    earnedPoints: Math.floor(q.points * (i === 0 ? 1 : 0.5)),
  }));

  const mcqCorrect = mcqResults.filter((r) => r.isCorrect).length;
  const mcqTotal = mcqResults.length;
  const codingScore = codingResults.reduce((a, r) => a + r.earnedPoints, 0);
  const codingTotal = codingResults.reduce((a, r) => a + r.points, 0);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to="/candidate/completed">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Completed
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{test.name}</h1>
          <p className="text-muted-foreground">
            Completed on{" "}
            {assignment.completedAt
              ? new Date(assignment.completedAt).toLocaleDateString()
              : "-"}
          </p>
        </div>
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Score Overview */}
      <Card className="overflow-hidden">
        <div className={`h-2 ${(assignment.score || 0) >= 60 ? "bg-success" : "bg-destructive"}`} />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Your Score</p>
              <p className={`text-5xl font-bold ${getScoreColor(assignment.score || 0)}`}>
                {assignment.score}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {(assignment.score || 0) >= 60 ? "Passed" : "Needs Improvement"}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {assignment.startedAt && assignment.completedAt
                      ? `${Math.round(
                          (new Date(assignment.completedAt).getTime() -
                            new Date(assignment.startedAt).getTime()) /
                            60000
                        )} minutes`
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Progress value={assignment.score} className="mt-4 h-3" />
        </CardContent>
      </Card>

      {/* Section Scores */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">MCQ Score</p>
                <p className="text-2xl font-bold">{mcqCorrect}/{mcqTotal} correct</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Coding Score</p>
                <p className="text-2xl font-bold">{codingScore}/{codingTotal} points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MCQ Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">MCQ Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {mcqResults.map((result, index) => (
            <div
              key={index}
              className={`flex items-center justify-between rounded-lg border p-3 ${
                result.isCorrect ? "border-success/20 bg-success/5" : "border-destructive/20 bg-destructive/5"
              }`}
            >
              <div className="flex items-center gap-3">
                {result.isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <span className="text-sm">Question {index + 1}</span>
              </div>
              <Badge variant={result.isCorrect ? "success" : "destructive"}>
                {result.isCorrect ? `+${result.points}` : "0"} pts
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Coding Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Coding Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {codingResults.map((result, index) => (
            <div key={index} className="rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{result.title}</h4>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>
                      Test Cases: {result.testCasesPassed}/{result.totalTestCases} passed
                    </span>
                  </div>
                  <Progress
                    value={(result.testCasesPassed / result.totalTestCases) * 100}
                    className="w-48 h-2 mt-2"
                  />
                </div>
                <Badge variant={result.earnedPoints === result.points ? "success" : "warning"}>
                  {result.earnedPoints}/{result.points} pts
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
