import { useParams, Link } from "react-router-dom";
import { useTestStore } from "@/store/testStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Clock,
  FileText,
  Code,
  Users,
  Edit,
  Send,
} from "lucide-react";

export default function TestDetails() {
  const { testId } = useParams<{ testId: string }>();
  const { tests, assignments, publishTest } = useTestStore();

  const test = tests.find((t) => t.id === testId);
  const testAssignments = assignments.filter((a) => a.testId === testId);

  if (!test) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-2xl font-semibold text-foreground">Test not found</h2>
        <p className="text-muted-foreground mt-2">
          The test you're looking for doesn't exist.
        </p>
        <Button asChild className="mt-4">
          <Link to="/tests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tests
          </Link>
        </Button>
      </div>
    );
  }

  const totalPoints = [
    ...test.mcqQuestions.map((q) => q.points),
    ...test.codingQuestions.map((q) => q.points),
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to="/tests">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tests
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">{test.name}</h1>
            <Badge variant={test.status as any}>{test.status}</Badge>
          </div>
          <p className="text-muted-foreground">{test.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {test.status === "draft" && (
            <>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button onClick={() => publishTest(test.id)}>
                <Send className="mr-2 h-4 w-4" />
                Publish
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="text-xl font-semibold">{test.duration} min</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">MCQ Questions</p>
              <p className="text-xl font-semibold">{test.mcqQuestions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Code className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Coding Questions</p>
              <p className="text-xl font-semibold">{test.codingQuestions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assignments</p>
              <p className="text-xl font-semibold">{testAssignments.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="questions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          {/* MCQ Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">MCQ Questions ({test.mcqQuestions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {test.mcqQuestions.map((q, index) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="max-w-md truncate">{q.question}</TableCell>
                      <TableCell>
                        <Badge variant={q.difficulty}>{q.difficulty}</Badge>
                      </TableCell>
                      <TableCell>{q.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Coding Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Coding Questions ({test.codingQuestions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {test.codingQuestions.map((q, index) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{q.title}</TableCell>
                      <TableCell>
                        <Badge variant={q.difficulty}>{q.difficulty}</Badge>
                      </TableCell>
                      <TableCell>{q.language}</TableCell>
                      <TableCell>{q.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assigned Candidates ({testAssignments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {testAssignments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testAssignments.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.candidateName}</TableCell>
                        <TableCell>{a.candidateEmail}</TableCell>
                        <TableCell>
                          {new Date(a.scheduledStartTime).toLocaleDateString()} -{" "}
                          {new Date(a.scheduledEndTime).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={a.status}>{a.status.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell>
                          {a.score !== undefined ? `${a.score}%` : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No candidates assigned yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
