import { useEffect, useState } from "react";
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
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Title as ChartTitle,
} from "chart.js";
import styles from "./ReportDetails.module.css";

ChartJS.register(ArcElement, ChartTooltip, ChartLegend, ChartTitle);

export default function ReportDetails() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { assignments, tests } = useTestStore();
  const [marksDeduction, setMarksDeduction] = useState<number>(0);
  const [proctoringEnabled, setProctoringEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);

  const [proctorData, setProctorData] = useState<any | null>(null);

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

  // Fetch detailed proctoring / backend data (fallback to mock if API fails)
  useEffect(() => {
    let mounted = true;
    async function fetchReport() {
      try {
        setIsLoading(true);
        setDataError(null);
        const res = await fetch(`/api/reports/${assignmentId}`);
        if (!res.ok) throw new Error(`Failed to fetch report (${res.status})`);
        const json = await res.json();
        if (!mounted) return;
        // Expecting API to return mcqResults, codingResults, proctoring
        // If absent, keep using local mock data defined above
        if (json.proctoring) setProctorData(json.proctoring);
        // If backend returns more precise scoring, you could update mcqResults/codingResults here
      } catch (err: any) {
        if (!mounted) return;
        setDataError(err.message || "Could not load report data");
        // keep using mock data
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    fetchReport();
    return () => { mounted = false; };
  }, [assignmentId]);

  // Chart.js datasets
  const mcqChartData = {
    labels: ["Obtained", "Remaining"],
    datasets: [
      {
        data: [mcqObtained, Math.max(0, mcqMaxMarks - mcqObtained)],
        backgroundColor: ["#1e90ff", "#cfe8ff"],
        hoverBackgroundColor: ["#1c86ee", "#bfe0ff"],
      },
    ],
  };

  const codingChartData = codingMaxMarks > 0 ? {
    labels: ["Obtained", "Remaining"],
    datasets: [
      {
        data: [codingObtained, Math.max(0, codingMaxMarks - codingObtained)],
        backgroundColor: ["#22c55e", "#d6f5e0"],
        hoverBackgroundColor: ["#16a34a", "#c2efce"],
      },
    ],
  } : null;

  const proctorChartData = proctorData ? {
    labels: ["Compliant", "Flagged"],
    datasets: [
      {
        data: [Math.max(0, 100 - (proctorData.focusDeviation || 0)), proctorData.flaggedFaces || 0],
        backgroundColor: ["#ffb020", "#ff7a00"],
      },
    ],
  } : null;

  // PDF generation
  async function downloadReport() {
    try {
      setPdfLoading(true);
      const res = await fetch(`/api/reports/${assignmentId}/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includeProctoring: proctoringEnabled }),
      });
      if (!res.ok) throw new Error("Server error while generating PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${assignment.candidateName || 'report'}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      setDataError(err.message || "Failed to download PDF");
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Button asChild variant="ghost" size="sm" className="-ml-2 p-0">
            <Link to="/reports">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Link>
          </Button>
          <h2 className="text-2xl font-bold">EXAMINATION REPORT</h2>
          <p className="text-sm text-muted-foreground">Comprehensive Exam Performance Analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={proctoringEnabled}
              onChange={(e) => setProctoringEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            Include Proctoring Data
          </label>
          <Button
            className="bg-[hsl(210,100%,50%)] hover:bg-[hsl(210,100%,45%)] text-white"
            onClick={downloadReport}
            disabled={pdfLoading}
          >
            <FileDown className="mr-2 h-4 w-4" />
            {pdfLoading ? "Generating..." : "Download Report"}
          </Button>
        </div>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <svg className="animate-spin h-5 w-5 text-[hsl(210,100%,50%)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          Loading report data...
        </div>
      )}
      {dataError && (
        <div className="text-sm text-destructive">Error: {dataError}</div>
      )}

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

        {/* Donut Charts */}
        <Card className="border-[hsl(210,70%,80%)]">
          <CardHeader className="bg-[hsl(210,100%,50%)] text-white rounded-t-lg">
            <CardTitle className="text-lg">Section Performance</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col items-center">
                <div className={styles.chartContainer}>
                  <Doughnut data={mcqChartData} options={{ maintainAspectRatio: true, plugins: { title: { display: true, text: `MCQ (${mcqObtained}/${mcqMaxMarks})` } } }} />
                </div>
                <p className="text-sm mt-2">Correct: <strong>{mcqCorrect}</strong> &nbsp; Wrong: <strong>{mcqTotal - mcqCorrect}</strong></p>
              </div>

              <div className="flex flex-col items-center">
                <div className={styles.chartContainer}>
                  {codingChartData ? (
                    <Doughnut data={codingChartData} options={{ maintainAspectRatio: true, plugins: { title: { display: true, text: `Coding (${codingObtained}/${codingMaxMarks})` } } }} />
                  ) : (
                    <div className="text-sm text-muted-foreground p-4">No coding marks available. Attempted: <strong>{codingResults.length}</strong></div>
                  )}
                </div>
                {codingChartData && <p className="text-sm mt-2">Attempted: <strong>{codingResults.length}</strong></p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proctoring Details (Optional) */}
      {proctoringEnabled && (
        <Card className="border-[hsl(40,70%,80%)]">
          <CardHeader>
            <CardTitle className="text-lg text-[hsl(40,80%,30%)]">Proctoring Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3 items-center">
              <div>
                <p className="text-xs text-muted-foreground">Flagged Faces</p>
                <p className="font-medium">{proctorData?.flaggedFaces ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Focus Deviation</p>
                <p className="font-medium">{proctorData?.focusDeviation != null ? `${proctorData.focusDeviation}%` : "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cheating Events</p>
                <p className="font-medium">{proctorData?.cheatingEvents ?? 0}</p>
              </div>
            </div>

            <div className="mt-4">
              {proctorChartData ? (
                <div className={styles.chartContainer}>
                  <Doughnut data={proctorChartData} options={{ maintainAspectRatio: true, plugins: { title: { display: true, text: 'Proctoring Compliance' } } }} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No proctoring analytics available for this candidate.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
