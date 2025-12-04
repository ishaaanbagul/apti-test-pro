import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Loader2, Wifi, Mic, Camera, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckStatus {
  status: "pending" | "checking" | "passed" | "failed";
  message?: string;
}

interface PreTestChecksProps {
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
}

export function PreTestChecks({ open, onClose, onProceed }: PreTestChecksProps) {
  const [wifiCheck, setWifiCheck] = useState<CheckStatus>({ status: "pending" });
  const [audioCheck, setAudioCheck] = useState<CheckStatus>({ status: "pending" });
  const [webcamCheck, setWebcamCheck] = useState<CheckStatus>({ status: "pending" });
  const [isRetrying, setIsRetrying] = useState(false);

  const checkWifi = useCallback(async () => {
    setWifiCheck({ status: "checking" });
    // For testing: auto-pass after brief delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setWifiCheck({ status: "passed", message: "Connected (test mode)" });
  }, []);

  const checkAudio = useCallback(async () => {
    setAudioCheck({ status: "checking" });
    // For testing: auto-pass after brief delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setAudioCheck({ status: "passed", message: "Microphone ready (test mode)" });
  }, []);

  const checkWebcam = useCallback(async () => {
    setWebcamCheck({ status: "checking" });
    // For testing: auto-pass after brief delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setWebcamCheck({ status: "passed", message: "Camera ready (test mode)" });
  }, []);

  const runAllChecks = useCallback(async () => {
    setIsRetrying(true);
    setWifiCheck({ status: "pending" });
    setAudioCheck({ status: "pending" });
    setWebcamCheck({ status: "pending" });

    await checkWifi();
    await checkAudio();
    await checkWebcam();
    setIsRetrying(false);
  }, [checkWifi, checkAudio, checkWebcam]);

  useEffect(() => {
    if (open) {
      runAllChecks();
    }
  }, [open, runAllChecks]);

  const allPassed = 
    wifiCheck.status === "passed" && 
    audioCheck.status === "passed" && 
    webcamCheck.status === "passed";

  const anyFailed = 
    wifiCheck.status === "failed" || 
    audioCheck.status === "failed" || 
    webcamCheck.status === "failed";

  const isChecking = 
    wifiCheck.status === "checking" || 
    audioCheck.status === "checking" || 
    webcamCheck.status === "checking";

  const renderStatusIcon = (status: CheckStatus["status"]) => {
    switch (status) {
      case "pending":
        return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />;
      case "checking":
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      case "passed":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const renderCheckItem = (
    icon: React.ReactNode,
    label: string,
    check: CheckStatus
  ) => (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border p-4 transition-colors",
        check.status === "passed" && "border-success/50 bg-success/5",
        check.status === "failed" && "border-destructive/50 bg-destructive/5",
        check.status === "checking" && "border-primary/50 bg-primary/5"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
        <div>
          <p className="font-medium">{label}</p>
          {check.message && (
            <p className={cn(
              "text-sm",
              check.status === "passed" && "text-success",
              check.status === "failed" && "text-destructive"
            )}>
              {check.message}
            </p>
          )}
        </div>
      </div>
      {renderStatusIcon(check.status)}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pre-Test System Check</DialogTitle>
          <DialogDescription>
            Please wait while we verify your system is ready for the test.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {renderCheckItem(
            <Wifi className="h-5 w-5 text-muted-foreground" />,
            "Internet Connectivity",
            wifiCheck
          )}
          {renderCheckItem(
            <Mic className="h-5 w-5 text-muted-foreground" />,
            "Microphone Access",
            audioCheck
          )}
          {renderCheckItem(
            <Camera className="h-5 w-5 text-muted-foreground" />,
            "Camera Access",
            webcamCheck
          )}
        </div>

        {anyFailed && !isChecking && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">
              Some checks failed. Please fix the issues and retry, or contact support if the problem persists.
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          {anyFailed && !isChecking ? (
            <Button onClick={runAllChecks} disabled={isRetrying} className="flex-1">
              <RefreshCw className={cn("mr-2 h-4 w-4", isRetrying && "animate-spin")} />
              Retry Checks
            </Button>
          ) : (
            <Button
              variant="gradient"
              onClick={onProceed}
              disabled={!allPassed || isChecking}
              className="flex-1"
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Proceed"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
