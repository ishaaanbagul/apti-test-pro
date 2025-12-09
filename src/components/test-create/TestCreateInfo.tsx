import { useState } from "react";
import { useTestStore } from "@/store/testStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, X, Briefcase } from "lucide-react";

export function TestCreateInfo() {
  const { testCreation, updateBasicInfo } = useTestStore();
  const { basicInfo } = testCreation;
  
  const [jobDescription, setJobDescription] = useState("");
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [showSkills, setShowSkills] = useState(false);

  const extractSkills = () => {
    const mockSkills = [
      "JavaScript",
      "React",
      "Node.js",
      "SQL",
      "REST API",
      "Problem Solving",
      "Data Structures",
    ];
    const randomSkills = mockSkills
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 4) + 3);
    setExtractedSkills(randomSkills);
    setShowSkills(true);
  };

  const removeSkill = (skill: string) => {
    setExtractedSkills((prev) => prev.filter((s) => s !== skill));
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !extractedSkills.includes(skill.trim())) {
      setExtractedSkills((prev) => [...prev, skill.trim()]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Set up the basic details for your test
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Test Name *</Label>
              <Input
                id="name"
                placeholder="e.g., JavaScript Fundamentals"
                value={basicInfo.name}
                onChange={(e) => updateBasicInfo({ name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                placeholder="60"
                value={basicInfo.duration}
                onChange={(e) => updateBasicInfo({ duration: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <CardTitle>Job Details</CardTitle>
          </div>
          <CardDescription>
            Add job description to extract required skills for this assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the job description here to help identify required skills and competencies for this test..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Add a job description to automatically extract relevant skills using AI
            </p>
          </div>

          <Button 
            variant="outline" 
            onClick={extractSkills}
            disabled={!jobDescription.trim()}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Extract Skills
          </Button>
          
          {showSkills && extractedSkills.length > 0 && (
            <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
              <p className="text-sm font-medium">Extracted Skills:</p>
              <div className="flex flex-wrap gap-2">
                {extractedSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1 px-3 py-1">
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="pt-2">
                <Input
                  placeholder="Add custom skill and press Enter..."
                  className="max-w-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
