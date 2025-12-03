import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home, FileText } from "lucide-react";

export default function TestSubmitted() {
  const { assignmentId } = useParams<{ assignmentId: string }>();

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="max-w-md text-center animate-slide-up">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <CardTitle className="text-2xl">Test Submitted!</CardTitle>
          <CardDescription>
            Your responses have been recorded successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Thank you for completing the assessment. Your results will be available shortly.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link to={`/candidate/report/${assignmentId}`}>
                <FileText className="mr-2 h-4 w-4" />
                View Results
              </Link>
            </Button>
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
