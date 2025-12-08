import { useTestStore } from "@/store/testStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function TestCreateInfo() {
  const { testCreation, updateBasicInfo } = useTestStore();
  const { basicInfo } = testCreation;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Set up the basic details for your test
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
  );
}
