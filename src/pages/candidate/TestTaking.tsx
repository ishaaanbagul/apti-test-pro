import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTestStore } from "@/store/testStore";
import { useCandidateTestStore } from "@/store/candidateTestStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { TimerDisplay } from "@/components/common/TimerDisplay";
import { AutosaveIndicator } from "@/components/common/AutosaveIndicator";
import { CodeEditor } from "@/components/common/CodeEditor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Play,
  FileText,
  Code,
} from "lucide-react";

export default function TestTaking() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { tests, assignments, updateAssignment } = useTestStore();
  const {
    session,
    setState,
    setCurrentQuestion,
    nextQuestion,
    prevQuestion,
    saveMCQAnswer,
    saveCodingAnswer,
    decrementTimer,
    markAutosaved,
    submitTest,
  } = useCandidateTestStore();

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [codeOutput, setCodeOutput] = useState<string>("");

  const assignment = assignments.find((a) => a.id === assignmentId);
  const test = assignment ? tests.find((t) => t.id === assignment.testId) : null;

  // Timer effect
  useEffect(() => {
    if (!session || session.state !== "ACTIVE") return;

    const interval = setInterval(() => {
      decrementTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [session, decrementTimer]);

  // Auto-submit when timer reaches 0
  useEffect(() => {
    if (session && session.remainingTime <= 0 && session.state === "ACTIVE") {
      handleSubmit();
    }
  }, [session?.remainingTime]);

  // Autosave effect
  useEffect(() => {
    if (!session || session.state !== "ACTIVE") return;

    const autosaveInterval = setInterval(() => {
      setAutosaveStatus('saving');
      // Simulate autosave API call
      setTimeout(() => {
        markAutosaved();
        setAutosaveStatus('saved');
      }, 500);
    }, 15000);

    return () => clearInterval(autosaveInterval);
  }, [session, markAutosaved]);

  // Redirect if no session
  useEffect(() => {
    if (!session || session.state === "IDLE") {
      navigate(`/candidate/test/${assignmentId}/start`);
    } else if (session.state === "SUBMITTED") {
      navigate(`/candidate/test/${assignmentId}/submitted`);
    }
  }, [session, navigate, assignmentId]);

  const handleSubmit = useCallback(() => {
    submitTest();
    updateAssignment(assignmentId!, {
      status: "completed",
      completedAt: new Date().toISOString(),
      score: Math.floor(Math.random() * 40) + 60, // Mock score
    });
    navigate(`/candidate/test/${assignmentId}/submitted`);
  }, [submitTest, updateAssignment, assignmentId, navigate]);

  const runCode = () => {
    setCodeOutput("Running...\n");
    setTimeout(() => {
      setCodeOutput("Test Case 1: Passed ✓\nTest Case 2: Passed ✓\n\nAll test cases passed!");
    }, 1000);
  };

  if (!session || !test || session.state !== "ACTIVE") {
    return null;
  }

  const allQuestions = [
    ...test.mcqQuestions.map((q) => ({ ...q, type: "mcq" as const })),
    ...test.codingQuestions.map((q) => ({ ...q, type: "coding" as const })),
  ];

  const currentQuestion = allQuestions[session.currentQuestionIndex];
  const isMCQ = currentQuestion?.type === "mcq";
  const currentMCQAnswer = session.mcqAnswers.find(
    (a) => a.questionId === currentQuestion?.id
  );
  const currentCodingAnswer = session.codingAnswers.find(
    (a) => a.questionId === currentQuestion?.id
  );

  const answeredCount = [
    ...session.mcqAnswers.filter((a) => a.selectedOption !== null),
    ...session.codingAnswers.filter((a) => a.code !== (test.codingQuestions.find(q => q.id === a.questionId)?.starterCode || "")),
  ].length;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Question Navigation */}
      <aside className="w-64 border-r border-border bg-card p-4 flex flex-col">
        <div className="mb-4">
          <h2 className="font-semibold text-lg truncate">{test.name}</h2>
          <p className="text-sm text-muted-foreground">
            {answeredCount}/{allQuestions.length} answered
          </p>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              MCQ Questions
            </p>
            <div className="grid grid-cols-5 gap-1">
              {test.mcqQuestions.map((q, index) => {
                const answer = session.mcqAnswers.find((a) => a.questionId === q.id);
                const isAnswered = answer?.selectedOption !== null;
                const isCurrent = session.currentQuestionIndex === index;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(index)}
                    className={cn(
                      "h-8 w-8 rounded text-sm font-medium transition-all",
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : isAnswered
                        ? "bg-success/20 text-success border border-success"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {test.codingQuestions.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Coding Questions
              </p>
              <div className="grid grid-cols-5 gap-1">
                {test.codingQuestions.map((q, index) => {
                  const globalIndex = test.mcqQuestions.length + index;
                  const answer = session.codingAnswers.find((a) => a.questionId === q.id);
                  const isAnswered = answer?.code !== q.starterCode;
                  const isCurrent = session.currentQuestionIndex === globalIndex;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestion(globalIndex)}
                      className={cn(
                        "h-8 w-8 rounded text-sm font-medium transition-all",
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : isAnswered
                          ? "bg-success/20 text-success border border-success"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      )}
                    >
                      C{index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto space-y-3 pt-4 border-t">
          <AutosaveIndicator status={autosaveStatus} lastSaved={session.lastAutosave} />
          <Button
            variant="gradient"
            className="w-full"
            onClick={() => setShowSubmitDialog(true)}
          >
            <Send className="mr-2 h-4 w-4" />
            Submit Test
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
          <div className="flex items-center gap-4">
            <Badge variant={isMCQ ? "secondary" : "outline"} className="gap-1">
              {isMCQ ? <FileText className="h-3 w-3" /> : <Code className="h-3 w-3" />}
              {isMCQ ? "MCQ" : "Coding"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Question {session.currentQuestionIndex + 1} of {allQuestions.length}
            </span>
          </div>
          <TimerDisplay remainingSeconds={session.remainingTime} />
        </header>

        {/* Question Content */}
        <div className="flex-1 overflow-auto p-6">
          {isMCQ ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {(currentQuestion as typeof test.mcqQuestions[0]).question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={currentMCQAnswer?.selectedOption?.toString() || ""}
                  onValueChange={(value) =>
                    saveMCQAnswer(currentQuestion.id, parseInt(value))
                  }
                >
                  {(currentQuestion as typeof test.mcqQuestions[0]).options.map(
                    (option, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 cursor-pointer"
                        onClick={() => saveMCQAnswer(currentQuestion.id, index)}
                      >
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    )
                  )}
                </RadioGroup>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-6 h-full">
              {/* Problem Description */}
              <Card className="overflow-auto">
                <CardHeader>
                  <CardTitle>{(currentQuestion as typeof test.codingQuestions[0]).title}</CardTitle>
                  <Badge variant={(currentQuestion as typeof test.codingQuestions[0]).difficulty}>
                    {(currentQuestion as typeof test.codingQuestions[0]).difficulty}
                  </Badge>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">
                    {(currentQuestion as typeof test.codingQuestions[0]).description}
                  </p>
                  <h4 className="mt-4 font-semibold">Test Cases:</h4>
                  {(currentQuestion as typeof test.codingQuestions[0]).testCases.map(
                    (tc, index) => (
                      <div key={index} className="mt-2 rounded bg-muted p-3 text-sm">
                        <p><strong>Input:</strong> {tc.input}</p>
                        <p><strong>Expected:</strong> {tc.expectedOutput}</p>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>

              {/* Code Editor */}
              <div className="flex flex-col gap-4">
                <CodeEditor
                  value={currentCodingAnswer?.code || ""}
                  onChange={(code) => saveCodingAnswer(currentQuestion.id, code)}
                  language={(currentQuestion as typeof test.codingQuestions[0]).language}
                  height="350px"
                />
                <div className="flex items-center gap-2">
                  <Button onClick={runCode} variant="outline">
                    <Play className="mr-2 h-4 w-4" />
                    Run Code
                  </Button>
                </div>
                {codeOutput && (
                  <Card className="flex-1">
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm">Output</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <pre className="text-sm whitespace-pre-wrap font-mono">{codeOutput}</pre>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <footer className="flex items-center justify-between border-t border-border bg-card px-6 py-3">
          <Button
            variant="outline"
            onClick={prevQuestion}
            disabled={session.currentQuestionIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={nextQuestion}
            disabled={session.currentQuestionIndex === allQuestions.length - 1}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </footer>
      </main>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredCount} out of {allQuestions.length} questions.
              {answeredCount < allQuestions.length && (
                <span className="block mt-2 text-warning">
                  Warning: You have {allQuestions.length - answeredCount} unanswered questions.
                </span>
              )}
              <span className="block mt-2">
                Are you sure you want to submit? This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Test</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Submit Test</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
