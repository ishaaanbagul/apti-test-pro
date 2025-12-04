import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertTriangle,
  CheckCircle,
  Shield,
  Clock,
  Monitor,
  Wifi,
  FileText,
  Ban,
  Eye,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RulesPageProps {
  testName: string;
  duration: number;
  totalQuestions: number;
  onAccept: () => void;
  onBack: () => void;
}

export function RulesPage({
  testName,
  duration,
  totalQuestions,
  onAccept,
  onBack,
}: RulesPageProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const isAtBottom = 
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAcceptAndStart = async () => {
    try {
      // Request fullscreen on document element for cross-browser compatibility
      const docElement = document.documentElement;
      if (docElement.requestFullscreen) {
        await docElement.requestFullscreen();
      } else if ((docElement as any).webkitRequestFullscreen) {
        await (docElement as any).webkitRequestFullscreen();
      } else if ((docElement as any).msRequestFullscreen) {
        await (docElement as any).msRequestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen request failed:", err);
    }
    // Proceed with test start regardless of fullscreen success
    onAccept();
  };

  const rules = [
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Time Limit",
      description: `You have ${duration} minutes to complete this test. The timer starts immediately once you begin and cannot be paused. Plan your time wisely across all ${totalQuestions} questions.`,
    },
    {
      icon: <Monitor className="h-5 w-5" />,
      title: "Full-Screen Mode",
      description: "The test must be taken in full-screen mode. Exiting full-screen or switching tabs may be flagged as suspicious activity and could result in automatic submission.",
    },
    {
      icon: <Wifi className="h-5 w-5" />,
      title: "Internet Connection",
      description: "Maintain a stable internet connection throughout the test. Your answers are auto-saved every 15 seconds. If disconnected, reconnect immediately to avoid losing progress.",
    },
    {
      icon: <Eye className="h-5 w-5" />,
      title: "Proctoring",
      description: "Your webcam and microphone will be active during the test for proctoring purposes. Ensure good lighting and minimal background noise. Looking away from the screen frequently may be flagged.",
    },
    {
      icon: <Ban className="h-5 w-5" />,
      title: "Prohibited Actions",
      description: "The following are strictly prohibited: copying/pasting from external sources, using external assistance, opening other browser tabs, using secondary devices, taking screenshots, or any form of communication.",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Question Navigation",
      description: "You can navigate freely between all questions. Questions can be answered in any order. Use the 'Mark for Review' feature to flag questions you want to revisit before submission.",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Code Editor (Coding Section)",
      description: "For coding questions, use the built-in editor with syntax highlighting. You can run your code to test against sample cases. Your code is auto-saved continuously.",
    },
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      title: "Submission",
      description: "You can submit the test at any time using the Submit button. If time expires, your test will be automatically submitted. Once submitted, you cannot modify your answers.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold">{testName}</h1>
          <p className="text-muted-foreground">
            Please read all rules and instructions carefully before proceeding
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        <div className="mx-auto h-full max-w-4xl p-6">
          <ScrollArea 
            className="h-full rounded-lg border bg-card"
            onScrollCapture={handleScroll}
          >
            <div className="p-6 space-y-6" ref={scrollRef}>
              {/* Test Info Banner */}
              <div className="rounded-lg bg-primary/10 p-4 border border-primary/20">
                <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  Important Notice
                </div>
                <p className="text-sm text-foreground">
                  This is a proctored examination. Any violation of the rules below may result in 
                  immediate disqualification. Your session will be monitored for integrity.
                </p>
              </div>

              {/* Rules List */}
              <div className="space-y-4">
                {rules.map((rule, index) => (
                  <div
                    key={index}
                    className="flex gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {rule.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{rule.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {rule.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scroll indicator */}
              {!hasScrolledToBottom && (
                <div className="sticky bottom-0 left-0 right-0 flex justify-center py-4">
                  <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground animate-bounce">
                    <span>↓</span>
                    Scroll down to continue
                  </div>
                </div>
              )}

              {/* Additional acknowledgments */}
              <div className="space-y-3 border-t pt-6">
                <h3 className="font-semibold">By proceeding, you acknowledge that:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-success flex-shrink-0" />
                    You have read and understood all the rules and instructions.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-success flex-shrink-0" />
                    You consent to webcam and audio monitoring during the test.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-success flex-shrink-0" />
                    You will not engage in any form of malpractice.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-success flex-shrink-0" />
                    You understand violations may result in disqualification.
                  </li>
                </ul>
              </div>
            </div>
          </ScrollArea>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card px-6 py-4">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="accept-rules"
              checked={hasAccepted}
              onCheckedChange={(checked) => setHasAccepted(checked as boolean)}
              disabled={!hasScrolledToBottom}
            />
            <label
              htmlFor="accept-rules"
              className={cn(
                "text-sm leading-none",
                !hasScrolledToBottom && "text-muted-foreground"
              )}
            >
              I have read all rules and agree to comply with them
            </label>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button
              variant="gradient"
              onClick={handleAcceptAndStart}
              disabled={!hasScrolledToBottom || !hasAccepted}
            >
              <Play className="mr-2 h-4 w-4" />
              Accept & Start Test
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
