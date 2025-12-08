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
import { Textarea } from "@/components/ui/textarea";
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
  CheckCircle,
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
  const [showCodeSubmitDialog, setShowCodeSubmitDialog] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [codeOutput, setCodeOutput] = useState<string>("");
  const [codeInput, setCodeInput] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
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

  // Autosave effect - every 5 seconds for coding
  useEffect(() => {
    if (!session || session.state !== "ACTIVE") return;

    const autosaveInterval = setInterval(() => {
      setAutosaveStatus('saving');
      setTimeout(() => {
        markAutosaved();
        setAutosaveStatus('saved');
      }, 500);
    }, 5000); // Changed to 5 seconds

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

  // Fullscreen handling with cross-browser support
  const enterFullscreen = useCallback(async () => {
    try {
      const docElement = document.documentElement;
      if (docElement.requestFullscreen) {
        await docElement.requestFullscreen();
      } else if ((docElement as any).webkitRequestFullscreen) {
        await (docElement as any).webkitRequestFullscreen();
      } else if ((docElement as any).msRequestFullscreen) {
        await (docElement as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
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
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Error exiting fullscreen:", err);
    }
  }, []);

  // Monitor fullscreen state changes and show warning
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(isCurrentlyFullscreen);
      
      // Show warning if user exits fullscreen during active test
      if (!isCurrentlyFullscreen && session?.state === "ACTIVE") {
        setShowFullscreenWarning(true);
        toast({
          title: "Fullscreen exited",
          description: "Please return to fullscreen mode. Exiting may be flagged as suspicious activity.",
          variant: "destructive",
        });
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, [session?.state]);

  // Check initial fullscreen state on mount
  useEffect(() => {
    setIsFullscreen(!!(document.fullscreenElement || (document as any).webkitFullscreenElement));
  }, []);

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

  const handleSubmit = useCallback(async () => {
    submitTest();
    updateAssignment(assignmentId!, {
      status: "completed",
      completedAt: new Date().toISOString(),
      score: Math.floor(Math.random() * 40) + 60,
    });
    
    // Exit fullscreen with cross-browser support
    try {
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (err) {
      console.error("Error exiting fullscreen:", err);
    }
    
    navigate(`/candidate/test/${assignmentId}/submitted`);
  }, [submitTest, updateAssignment, assignmentId, navigate]);

  const runCode = () => {
    setCodeOutput("Running...\n");
    setTimeout(() => {
      setCodeOutput(`Input: ${codeInput || "(empty)"}\n\nOutput:\nTest Case 1: Passed ✓\nTest Case 2: Passed ✓\n\nAll test cases passed!`);
    }, 1000);
  };

  const handleSubmitCode = () => {
    setShowCodeSubmitDialog(true);
  };

  const confirmSubmitCode = () => {
    setShowCodeSubmitDialog(false);
    toast({
      title: "Code Submitted",
      description: "Your code has been submitted successfully for this question.",
    });
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
            // Coding Split-screen layout with larger editor
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 h-full">
              {/* Problem Description */}
              <Card className="overflow-auto max-h-[calc(100vh-200px)]">
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

              {/* Code Editor Section */}
              <div className="flex flex-col gap-4 min-h-[500px]">
                {/* Run/Submit buttons above editor */}
                <div className="flex items-center gap-2">
                  <Button onClick={runCode} variant="outline" className="gap-2">
                    <Play className="h-4 w-4" />
                    Run Code
                  </Button>
                  <Button onClick={handleSubmitCode} className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Submit Code
                  </Button>
                </div>

                {/* Larger Code Editor */}
                <CodeEditor
                  value={currentCodingAnswer?.code || ""}
                  onChange={(code) => saveCodingAnswer(currentQuestion.id, code)}
                  language={(currentQuestion as typeof test.codingQuestions[0]).language}
                  height="400px"
                  className="flex-1"
                />

                {/* Input and Output boxes side by side */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="py-2 px-4">
                      <CardTitle className="text-sm">Input</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Textarea
                        placeholder="Enter custom input here..."
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value)}
                        className="font-mono text-sm min-h-[100px]"
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="py-2 px-4">
                      <CardTitle className="text-sm">Output</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-3 rounded min-h-[100px]">
                        {codeOutput || "Run your code to see output..."}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
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

      {/* Code Submit Confirmation Dialog */}
      <AlertDialog open={showCodeSubmitDialog} onOpenChange={setShowCodeSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Submit Code?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your code for this question? 
              You can still modify it before submitting the entire test.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmitCode}>Submit Code</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fullscreen Warning Dialog */}
      <AlertDialog open={showFullscreenWarning} onOpenChange={setShowFullscreenWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Fullscreen Mode Required
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have exited fullscreen mode. For test integrity, please return to fullscreen. 
              Repeated exits may be flagged as suspicious activity.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              enterFullscreen();
              setShowFullscreenWarning(false);
            }}>
              Return to Fullscreen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}