import { useParams, Link, useNavigate } from "react-router-dom";
import { useTestStore } from "@/store/testStore";
import { useCandidateTestStore } from "@/store/candidateTestStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PreTestChecks } from "@/components/candidate/PreTestChecks";
import { RulesPage } from "@/components/candidate/RulesPage";
import {
  ArrowLeft,
  Clock,
  FileText,
  Code,
  Play,
  Shield,
} from "lucide-react";
import { useState } from "react";

type FlowStep = "overview" | "checks" | "rules";

export default function TestInstructions() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { assignments, tests } = useTestStore();
  const { initSession, setState } = useCandidateTestStore();
  const [flowStep, setFlowStep] = useState<FlowStep>("overview");

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

  // Show rules page
  if (flowStep === "rules") {
    return (
      <RulesPage
        testName={test.name}
        duration={test.duration}
        totalQuestions={totalQuestions}
        onAccept={handleStartTest}
        onBack={() => setFlowStep("overview")}
      />
    );
  }

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

          {/* Quick overview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Before You Begin
            </h3>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium">System Check</p>
                  <p className="text-sm text-muted-foreground">
                    We'll verify your internet, microphone, and camera access
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium">Rules & Guidelines</p>
                  <p className="text-sm text-muted-foreground">
                    Read and accept the test rules and proctoring requirements
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium">Start Test</p>
                  <p className="text-sm text-muted-foreground">
                    Timer begins immediately once you start the test
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <Button
            variant="gradient"
            size="xl"
            className="w-full"
            onClick={() => setFlowStep("checks")}
          >
            <Play className="mr-2 h-5 w-5" />
            Begin System Check
          </Button>
        </CardContent>
      </Card>

      {/* Pre-test checks modal */}
      <PreTestChecks
        open={flowStep === "checks"}
        onClose={() => setFlowStep("overview")}
        onProceed={() => setFlowStep("rules")}
      />
    </div>
  );
}
