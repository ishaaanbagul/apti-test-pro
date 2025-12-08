import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTestStore } from "@/store/testStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  FileDown,
  CheckCircle,
  XCircle,
  X,
  User,
  Mail,
  Calendar,
  Clock,
  FileText,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export default function ReportDetails() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { assignments, tests } = useTestStore();
  const [marksDeduction, setMarksDeduction] = useState<number>(0);
  const [proctoringEnabled, setProctoringEnabled] = useState(true);

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
    options: q.options,
    selectedAnswer: i % 3 === 0 ? q.correctAnswer : (q.correctAnswer + 1) % 4,
    correctAnswer: q.correctAnswer,
    isCorrect: i % 3 !== 0,
    points: q.points,
  }));

  const codingResults = test.codingQuestions.map((q, i) => ({
    title: q.title,
    description: q.description,
    code: `function solution() {\n  // Candidate's submitted code\n  return "result";\n}`,
    testCasesPassed: i === 0 ? 2 : 1,
    totalTestCases: q.testCases.length,
    points: q.points,
    earnedPoints: Math.floor(q.points * (i === 0 ? 1 : 0.5)),
  }));

  const mcqCorrect = mcqResults.filter((r) => r.isCorrect).length;
  const mcqTotal = mcqResults.length;
  const mcqMaxMarks = mcqResults.reduce((a, r) => a + r.points, 0);
  const mcqObtained = mcqResults.filter((r) => r.isCorrect).reduce((a, r) => a + r.points, 0);

  const codingMaxMarks = codingResults.reduce((a, r) => a + r.points, 0);
  const codingObtained = codingResults.reduce((a, r) => a + r.earnedPoints, 0);

  const totalMaxMarks = mcqMaxMarks + codingMaxMarks;
  const totalObtained = mcqObtained + codingObtained;
  const proctoringDeduction = proctoringEnabled ? marksDeduction : 0;
  const finalScore = Math.max(0, totalObtained - proctoringDeduction);
  const percentage = Math.round((finalScore / totalMaxMarks) * 100);

  // Donut chart data
  const chartData = [
    { name: "MCQ", value: mcqObtained, color: "hsl(210, 100%, 50%)" },
    { name: "Coding", value: codingObtained, color: "hsl(210, 70%, 60%)" },
    { name: "Deduction", value: proctoringDeduction, color: "hsl(0, 70%, 50%)" },
    { name: "Lost", value: Math.max(0, totalMaxMarks - totalObtained), color: "hsl(210, 20%, 80%)" },
  ].filter(d => d.value > 0);

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
        </div>
        <Button className="bg-[hsl(210,100%,50%)] hover:bg-[hsl(210,100%,45%)] text-white">
          <FileDown className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </div>

      {/* Candidate Name Header */}
      <div className="bg-gradient-to-r from-[hsl(210,100%,50%)] to-[hsl(210,70%,60%)] rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold">{assignment.candidateName}</h1>
        <p className="text-white/80 mt-1">Assessment Report</p>
      </div>

      {/* Candidate Info Box */}
      <Card className="border-[hsl(210,70%,80%)] bg-[hsl(210,50%,98%)]">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-[hsl(210,100%,50%)]" />
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium">{assignment.candidateName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-[hsl(210,100%,50%)]" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-sm">{assignment.candidateEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[hsl(210,100%,50%)]" />
              <div>
                <p className="text-xs text-muted-foreground">Candidate ID</p>
                <p className="font-medium">{assignment.candidateId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[hsl(210,100%,50%)]" />
              <div>
                <p className="text-xs text-muted-foreground">Exam Name</p>
                <p className="font-medium">{test.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[hsl(210,100%,50%)]" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium">
                  {assignment.completedAt
                    ? new Date(assignment.completedAt).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-[hsl(210,100%,50%)]" />
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-medium">{test.duration} min</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Section with Donut Chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Score Table */}
        <Card className="border-[hsl(210,70%,80%)]">
          <CardHeader className="bg-[hsl(210,100%,50%)] text-white rounded-t-lg">
            <CardTitle className="text-lg">Score Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-[hsl(210,50%,95%)]">
                  <TableHead>Section</TableHead>
                  <TableHead className="text-center">Max Marks</TableHead>
                  <TableHead className="text-center">Marks Obtained</TableHead>
                  <TableHead className="text-center">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">MCQ</TableCell>
                  <TableCell className="text-center">{mcqMaxMarks}</TableCell>
                  <TableCell className="text-center">{mcqObtained}</TableCell>
                  <TableCell className="text-center">
                    {Math.round((mcqObtained / mcqMaxMarks) * 100)}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Coding</TableCell>
                  <TableCell className="text-center">{codingMaxMarks}</TableCell>
                  <TableCell className="text-center">{codingObtained}</TableCell>
                  <TableCell className="text-center">
                    {Math.round((codingObtained / codingMaxMarks) * 100)}%
                  </TableCell>
                </TableRow>
                <TableRow className="bg-[hsl(210,50%,95%)] font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-center">{totalMaxMarks}</TableCell>
                  <TableCell className="text-center">{finalScore}</TableCell>
                  <TableCell className="text-center">{percentage}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Donut Chart */}
        <Card className="border-[hsl(210,70%,80%)]">
          <CardHeader className="bg-[hsl(210,100%,50%)] text-white rounded-t-lg">
            <CardTitle className="text-lg">Score Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proctoring Deduction */}
      <Card className="border-[hsl(210,70%,80%)] bg-[hsl(210,50%,98%)]">
        <CardHeader>
          <CardTitle className="text-lg text-[hsl(210,100%,40%)]">Proctoring Adjustment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="deduction">Marks Deduction</Label>
              <Input
                id="deduction"
                type="number"
                min={0}
                value={marksDeduction}
                onChange={(e) => setMarksDeduction(parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            {proctoringEnabled && marksDeduction > 0 && (
              <div className="flex items-center gap-2 mt-6">
                <span className="text-destructive font-medium line-through">
                  -{marksDeduction} marks
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setProctoringEnabled(false)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {!proctoringEnabled && marksDeduction > 0 && (
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => setProctoringEnabled(true)}
              >
                Enable Deduction
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* MCQ Results */}
      <Card className="border-[hsl(210,70%,80%)]">
        <CardHeader className="bg-[hsl(210,100%,50%)] text-white rounded-t-lg">
          <CardTitle className="text-lg">MCQ Questions ({mcqCorrect}/{mcqTotal} correct)</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {mcqResults.map((result, index) => (
            <div
              key={index}
              className={`rounded-lg border p-4 ${
                result.isCorrect 
                  ? "border-[hsl(210,70%,80%)] bg-[hsl(210,50%,98%)]" 
                  : "border-destructive/30 bg-destructive/5"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-[hsl(210,100%,50%)] text-white border-none">
                    Q{index + 1}
                  </Badge>
                  {result.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <Badge variant={result.isCorrect ? "success" : "destructive"}>
                  {result.isCorrect ? result.points : 0}/{result.points} pts
                </Badge>
              </div>
              <p className="font-medium mb-3">{result.question}</p>
              <div className="grid gap-2">
                {result.options.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className={`p-2 rounded text-sm ${
                      optIndex === result.correctAnswer
                        ? "bg-success/20 border border-success/30"
                        : optIndex === result.selectedAnswer && !result.isCorrect
                        ? "bg-destructive/20 border border-destructive/30"
                        : "bg-muted/50"
                    }`}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                    {option}
                    {optIndex === result.correctAnswer && (
                      <span className="ml-2 text-success text-xs">(Correct)</span>
                    )}
                    {optIndex === result.selectedAnswer && optIndex !== result.correctAnswer && (
                      <span className="ml-2 text-destructive text-xs">(Selected)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Coding Results */}
      <Card className="border-[hsl(210,70%,80%)]">
        <CardHeader className="bg-[hsl(210,100%,50%)] text-white rounded-t-lg">
          <CardTitle className="text-lg">Coding Questions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {codingResults.map((result, index) => (
            <div key={index} className="rounded-lg border border-[hsl(210,70%,80%)] p-4 bg-[hsl(210,50%,98%)]">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="bg-[hsl(210,100%,50%)] text-white border-none">
                      Problem {index + 1}
                    </Badge>
                    <h4 className="font-semibold">{result.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Test Cases: {result.testCasesPassed}/{result.totalTestCases} passed
                  </p>
                </div>
                <Badge variant={result.earnedPoints === result.points ? "success" : "warning"}>
                  {result.earnedPoints}/{result.points} pts
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Candidate's Code:</p>
                <pre className="bg-[hsl(220,20%,15%)] text-[hsl(210,50%,80%)] p-4 rounded-lg text-sm overflow-x-auto font-mono">
                  {result.code}
                </pre>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}