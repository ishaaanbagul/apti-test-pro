import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home, FileText, Lock } from "lucide-react";

export default function TestSubmitted() {
  const { assignmentId } = useParams<{ assignmentId: string }>();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full text-center animate-slide-up">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <CardTitle className="text-2xl">Test Submitted Successfully!</CardTitle>
          <CardDescription>
            Your responses have been recorded and locked
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted p-4 text-left space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Your test has been securely submitted</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Thank you for completing the assessment. Your results will be available shortly after evaluation.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button asChild variant="outline">
              <Link to="/candidate/tests">
                <Home className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
