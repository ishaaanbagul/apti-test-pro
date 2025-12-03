import { useNavigate } from "react-router-dom";
import { useTestStore } from "@/store/testStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { TestCreateInfo } from "@/components/test-create/TestCreateInfo";
import { TestCreateQuestions } from "@/components/test-create/TestCreateQuestions";
import { TestCreateAssign } from "@/components/test-create/TestCreateAssign";
import { TestCreateReview } from "@/components/test-create/TestCreateReview";
import { toast } from "sonner";

const steps = [
  { id: 1, title: "Basic Info" },
  { id: 2, title: "Questions" },
  { id: 3, title: "Assignment" },
  { id: 4, title: "Review" },
];

export default function TestCreate() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    testCreation,
    setCreationStep,
    resetCreation,
    createTest,
    createAssignment,
  } = useTestStore();

  const currentStep = testCreation.step;
  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCreationStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCreationStep(currentStep - 1);
    }
  };

  const handlePublish = () => {
    const test = createTest({
      name: testCreation.basicInfo.name,
      description: testCreation.basicInfo.description,
      duration: testCreation.basicInfo.duration,
      tags: testCreation.basicInfo.tags,
      status: "published",
      mcqQuestions: testCreation.selectedMCQs,
      codingQuestions: testCreation.selectedCoding,
      createdBy: user?.id || "",
    });

    // Create assignments
    testCreation.assignments.forEach((assignment) => {
      createAssignment({
        ...assignment,
        testId: test.id,
        status: "pending",
      });
    });

    resetCreation();
    toast.success("Test published successfully!");
    navigate(`/tests/${test.id}`);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return testCreation.basicInfo.name && testCreation.basicInfo.duration > 0;
      case 2:
        return testCreation.selectedMCQs.length > 0 || testCreation.selectedCoding.length > 0;
      case 3:
        return true; // Assignment is optional
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create New Test</h1>
        <p className="text-muted-foreground mt-1">
          Build your assessment in a few simple steps
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                  currentStep > step.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : currentStep === step.id
                    ? "border-primary text-primary"
                    : "border-muted text-muted-foreground"
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </div>
              <span
                className={cn(
                  "ml-2 text-sm font-medium hidden sm:block",
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-4 h-0.5 w-12 lg:w-24",
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && <TestCreateInfo />}
        {currentStep === 2 && <TestCreateQuestions />}
        {currentStep === 3 && <TestCreateAssign />}
        {currentStep === 4 && <TestCreateReview />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              resetCreation();
              navigate("/tests");
            }}
          >
            Cancel
          </Button>
          {currentStep < steps.length ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
            </Button>
          ) : (
            <Button variant="gradient" onClick={handlePublish} disabled={!canProceed()}>
              Publish Test
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
