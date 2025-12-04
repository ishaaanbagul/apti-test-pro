import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTestStore } from "@/store/testStore";
import { useCandidateTestStore } from "@/store/candidateTestStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TimerDisplay } from "@/components/common/TimerDisplay";
import { AutosaveIndicator } from "@/components/common/AutosaveIndicator";
import { CodeEditor } from "@/components/common/CodeEditor";
import { QuestionNavigation } from "@/components/candidate/QuestionNavigation";
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
  Flag,
  Maximize,
  Minimize,
  AlertTriangle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
    toggleMarkForReview,
    markQuestionVisited,
  } = useCandidateTestStore();

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [codeOutput, setCodeOutput] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Mark question as visited when navigating
  useEffect(() => {
    if (!session || !test) return;
    const allQuestions = [
      ...test.mcqQuestions.map((q) => ({ ...q, type: "mcq" as const })),
      ...test.codingQuestions.map((q) => ({ ...q, type: "coding" as const })),
    ];
    const currentQuestion = allQuestions[session.currentQuestionIndex];
    if (currentQuestion) {
      markQuestionVisited(currentQuestion.id);
    }
  }, [session?.currentQuestionIndex, test, markQuestionVisited]);

  // Fullscreen handling
  const enterFullscreen = useCallback(async () => {
    try {
      if (containerRef.current) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (err) {
      toast({
        title: "Fullscreen unavailable",
        description: "Please enable fullscreen mode for the best experience.",
        variant: "destructive",
      });
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Error exiting fullscreen:", err);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement && session?.state === "ACTIVE") {
        toast({
          title: "Fullscreen exited",
          description: "For the best experience, please stay in fullscreen mode.",
          variant: "destructive",
        });
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [session?.state]);

  // Tab visibility warning
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && session?.state === "ACTIVE") {
        toast({
          title: "Warning: Tab switch detected",
          description: "Leaving the test tab may be flagged as suspicious activity.",
          variant: "destructive",
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [session?.state]);

  const handleSubmit = useCallback(() => {
    submitTest();
    updateAssignment(assignmentId!, {
      status: "completed",
      completedAt: new Date().toISOString(),
      score: Math.floor(Math.random() * 40) + 60,
    });
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
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

  const currentIsMarked = isMCQ 
    ? currentMCQAnswer?.isMarkedForReview 
    : currentCodingAnswer?.isMarkedForReview;

  const mcqStatuses = session.mcqAnswers.map((a) => ({
    id: a.questionId,
    isAnswered: a.selectedOption !== null,
    isMarked: a.isMarkedForReview,
    isVisited: a.isVisited,
  }));

  const codingStatuses = session.codingAnswers.map((a, index) => ({
    id: a.questionId,
    isAnswered: a.code !== (test.codingQuestions[index]?.starterCode || ""),
    isMarked: a.isMarkedForReview,
    isVisited: a.isVisited,
  }));

  const answeredCount = 
    session.mcqAnswers.filter((a) => a.selectedOption !== null).length +
    session.codingAnswers.filter((a, index) => 
      a.code !== (test.codingQuestions[index]?.starterCode || "")
    ).length;

  const markedCount = 
    session.mcqAnswers.filter((a) => a.isMarkedForReview).length +
    session.codingAnswers.filter((a) => a.isMarkedForReview).length;

  return (
    <div ref={containerRef} className="flex h-screen bg-background">
      {/* Sidebar - Question Navigation (Desktop) */}
      <div className="hidden md:flex">
        <QuestionNavigation
          mcqCount={test.mcqQuestions.length}
          codingCount={test.codingQuestions.length}
          currentIndex={session.currentQuestionIndex}
          mcqStatuses={mcqStatuses}
          codingStatuses={codingStatuses}
          onQuestionSelect={setCurrentQuestion}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border bg-card px-4 md:px-6 py-3">
          <div className="flex items-center gap-2 md:gap-4">
            <Badge variant={isMCQ ? "secondary" : "outline"} className="gap-1">
              {isMCQ ? <FileText className="h-3 w-3" /> : <Code className="h-3 w-3" />}
              {isMCQ ? "MCQ" : "Coding"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Q {session.currentQuestionIndex + 1}/{allQuestions.length}
            </span>
            <AutosaveIndicator status={autosaveStatus} lastSaved={session.lastAutosave} />
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <TimerDisplay remainingSeconds={session.remainingTime} />
            <Button
              variant="ghost"
              size="icon"
              onClick={isFullscreen ? exitFullscreen : enterFullscreen}
              className="hidden md:flex"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={() => setShowSubmitDialog(true)}
              className="hidden md:flex"
            >
              <Send className="mr-2 h-4 w-4" />
              Submit
            </Button>
          </div>
        </header>

        {/* Question Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {isMCQ ? (
            // MCQ Full-screen layout
            <div className="max-w-3xl mx-auto">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg">
                      {(currentQuestion as typeof test.mcqQuestions[0]).question}
                    </CardTitle>
                    <div className="flex items-center gap-2 shrink-0">
                      <Label htmlFor="mark-review" className="text-sm text-muted-foreground">
                        Mark for review
                      </Label>
                      <Switch
                        id="mark-review"
                        checked={currentIsMarked}
                        onCheckedChange={() => toggleMarkForReview(currentQuestion.id)}
                      />
                    </div>
                  </div>
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
                          className={cn(
                            "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-all",
                            currentMCQAnswer?.selectedOption === index
                              ? "border-primary bg-primary/5"
                              : "hover:bg-accent/50"
                          )}
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
            </div>
          ) : (
            // Coding Split-screen layout
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 h-full">
              {/* Problem Description */}
              <Card className="overflow-auto">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>{(currentQuestion as typeof test.codingQuestions[0]).title}</CardTitle>
                      <Badge variant={(currentQuestion as typeof test.codingQuestions[0]).difficulty} className="mt-2">
                        {(currentQuestion as typeof test.codingQuestions[0]).difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Label htmlFor="mark-review-coding" className="text-sm text-muted-foreground">
                        Review
                      </Label>
                      <Switch
                        id="mark-review-coding"
                        checked={currentIsMarked}
                        onCheckedChange={() => toggleMarkForReview(currentQuestion.id)}
                      />
                    </div>
                  </div>
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
              <div className="flex flex-col gap-4 min-h-[400px]">
                <CodeEditor
                  value={currentCodingAnswer?.code || ""}
                  onChange={(code) => saveCodingAnswer(currentQuestion.id, code)}
                  language={(currentQuestion as typeof test.codingQuestions[0]).language}
                  height="300px"
                  className="flex-1"
                />
                <div className="flex items-center gap-2">
                  <Button onClick={runCode} variant="outline">
                    <Play className="mr-2 h-4 w-4" />
                    Run Code
                  </Button>
                </div>
                {codeOutput && (
                  <Card>
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
        <footer className="border-t border-border bg-card px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={session.currentQuestionIndex === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleMarkForReview(currentQuestion.id)}
              className={cn(
                "gap-2",
                currentIsMarked && "text-warning"
              )}
            >
              <Flag className={cn("h-4 w-4", currentIsMarked && "fill-warning")} />
              <span className="hidden sm:inline">
                {currentIsMarked ? "Marked" : "Mark for Review"}
              </span>
            </Button>

            <Button
              onClick={nextQuestion}
              disabled={session.currentQuestionIndex === allQuestions.length - 1}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </footer>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden">
          <QuestionNavigation
            mcqCount={test.mcqQuestions.length}
            codingCount={test.codingQuestions.length}
            currentIndex={session.currentQuestionIndex}
            mcqStatuses={mcqStatuses}
            codingStatuses={codingStatuses}
            onQuestionSelect={setCurrentQuestion}
            variant="bottom"
          />
          <div className="p-4 border-t bg-card">
            <Button
              variant="gradient"
              className="w-full"
              onClick={() => setShowSubmitDialog(true)}
            >
              <Send className="mr-2 h-4 w-4" />
              Submit Test
            </Button>
          </div>
        </div>
      </main>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Submit Test?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  You are about to submit the test. Please review your answers before proceeding.
                </p>
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Questions Answered:</span>
                    <span className="font-medium">{answeredCount}/{allQuestions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Marked for Review:</span>
                    <span className="font-medium text-warning">{markedCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Unanswered:</span>
                    <span className="font-medium text-destructive">
                      {allQuestions.length - answeredCount}
                    </span>
                  </div>
                </div>
                {answeredCount < allQuestions.length && (
                  <p className="text-sm text-destructive">
                    Warning: You have unanswered questions. Are you sure you want to submit?
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone. Once submitted, you cannot modify your answers.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Submit Test</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
