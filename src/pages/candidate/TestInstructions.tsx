import { useParams, Link, useNavigate } from "react-router-dom";
import { useTestStore } from "@/store/testStore";
import { useCandidateTestStore } from "@/store/candidateTestStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Clock,
  FileText,
  Code,
  AlertTriangle,
  CheckCircle,
  Play,
} from "lucide-react";
import { useState } from "react";

export default function TestInstructions() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { assignments, tests } = useTestStore();
  const { initSession, setState } = useCandidateTestStore();
  const [agreed, setAgreed] = useState(false);

  const assignment = assignments.find((a) => a.id === assignmentId);
  const test = assignment ? tests.find((t) => t.id === assignment.testId) : null;

  if (!assignment || !test) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-2xl font-semibold">Test not found</h2>
        <Button asChild className="mt-4">
          <Link to="/candidate/tests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tests
          </Link>
        </Button>
      </div>
    );
  }

  const totalQuestions = test.mcqQuestions.length + test.codingQuestions.length;

  const handleStartTest = () => {
    initSession(
      assignment.id,
      test.id,
      test.duration,
      test.mcqQuestions,
      test.codingQuestions
    );
    setState("ACTIVE");
    navigate(`/candidate/test/${assignmentId}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/candidate/tests">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tests
        </Link>
      </Button>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{test.name}</CardTitle>
          <CardDescription>{test.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Info */}
          <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-4">
            <div className="flex flex-col items-center gap-2">
              <Clock className="h-8 w-8 text-primary" />
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="text-xl font-bold">{test.duration} min</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              <p className="text-sm text-muted-foreground">MCQ Questions</p>
              <p className="text-xl font-bold">{test.mcqQuestions.length}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Code className="h-8 w-8 text-primary" />
              <p className="text-sm text-muted-foreground">Coding Questions</p>
              <p className="text-xl font-bold">{test.codingQuestions.length}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Important Instructions
            </h3>
            <ul className="space-y-3">
              {[
                "This is a timed test. Once started, the timer cannot be paused.",
                "Ensure you have a stable internet connection before starting.",
                "Do not refresh or close the browser during the test.",
                "Your answers are auto-saved every 15 seconds.",
                "You can navigate between questions using the sidebar.",
                "For coding questions, you can run your code to see the output.",
                "Submit your test before the timer runs out.",
                "Any form of cheating or plagiarism will result in disqualification.",
              ].map((instruction, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Agreement */}
          <div className="flex items-center space-x-2 rounded-lg border p-4">
            <Checkbox
              id="agreement"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <label
              htmlFor="agreement"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and understood all the instructions. I agree to follow the rules and understand that violations may result in disqualification.
            </label>
          </div>

          {/* Start Button */}
          <Button
            variant="gradient"
            size="xl"
            className="w-full"
            disabled={!agreed}
            onClick={handleStartTest}
          >
            <Play className="mr-2 h-5 w-5" />
            Start Test
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
