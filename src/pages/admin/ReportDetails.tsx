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
  AlertTriangle,
} from "lucide-react";

export default function ReportDetails() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { assignments, tests } = useTestStore();

  const assignment = assignments.find((a) => a.id === assignmentId);
  const test = assignment ? tests.find((t) => t.id === assignment.testId) : null;

  if (!assignment || !test) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-2xl font-semibold text-foreground">Report not found</h2>
        <Button asChild className="mt-4">
          <Link to="/reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Link>
        </Button>
      </div>
    );
  }

  // Mock detailed results
  const mcqResults = test.mcqQuestions.map((q, i) => ({
    question: q.question,
    selectedAnswer: i % 3 === 0 ? q.correctAnswer : (q.correctAnswer + 1) % 4,
    correctAnswer: q.correctAnswer,
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

  const mcqScore = mcqResults.filter((r) => r.isCorrect).length;
  const mcqTotal = mcqResults.length;
  const codingScore = codingResults.reduce((a, r) => a + r.earnedPoints, 0);
  const codingTotal = codingResults.reduce((a, r) => a + r.points, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to="/reports">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Assessment Report</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>{assignment.candidateName}</span>
            <span>•</span>
            <span>{test.name}</span>
            <span>•</span>
            <span>
              Completed {assignment.completedAt
                ? new Date(assignment.completedAt).toLocaleDateString()
                : "-"}
            </span>
          </div>
        </div>
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Score Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className="text-5xl font-bold text-primary">{assignment.score}%</p>
              </div>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <span className="text-4xl font-bold text-primary">
                  {assignment.score && assignment.score >= 60 ? "✓" : "✗"}
                </span>
              </div>
            </div>
            <Progress value={assignment.score} className="mt-4 h-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">MCQ Score</p>
                <p className="text-2xl font-bold">{mcqScore}/{mcqTotal}</p>
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
                <p className="text-2xl font-bold">{codingScore}/{codingTotal}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time & Plagiarism */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Time Spent</p>
                <p className="text-lg font-semibold">
                  {assignment.startedAt && assignment.completedAt
                    ? `${Math.round(
                        (new Date(assignment.completedAt).getTime() -
                          new Date(assignment.startedAt).getTime()) /
                          60000
                      )} minutes`
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Plagiarism Score</p>
                <p className="text-lg font-semibold text-success">0% - No issues detected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MCQ Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">MCQ Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mcqResults.map((result, index) => (
            <div
              key={index}
              className={`rounded-lg border p-4 ${
                result.isCorrect ? "border-success/20 bg-success/5" : "border-destructive/20 bg-destructive/5"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">Q{index + 1}</Badge>
                    {result.isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <p className="text-sm">{result.question}</p>
                  {!result.isCorrect && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Selected: Option {result.selectedAnswer + 1} | Correct: Option {result.correctAnswer + 1}
                    </p>
                  )}
                </div>
                <Badge variant={result.isCorrect ? "success" : "destructive"}>
                  {result.isCorrect ? result.points : 0}/{result.points}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Coding Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Coding Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {codingResults.map((result, index) => (
            <div key={index} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">Problem {index + 1}</Badge>
                    <h4 className="font-medium">{result.title}</h4>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      Test Cases: {result.testCasesPassed}/{result.totalTestCases} passed
                    </span>
                    <Progress
                      value={(result.testCasesPassed / result.totalTestCases) * 100}
                      className="w-32 h-2"
                    />
                  </div>
                </div>
                <Badge variant={result.earnedPoints === result.points ? "success" : "warning"}>
                  {result.earnedPoints}/{result.points}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
