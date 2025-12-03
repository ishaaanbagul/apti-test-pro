import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useTestStore } from "@/store/testStore";
import { StatsCard } from "@/components/common/StatsCard";
import { TestCard } from "@/components/common/TestCard";
import { Button } from "@/components/ui/button";
import { FileText, Users, CheckCircle, Clock, Plus, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuthStore();
  const { tests, assignments } = useTestStore();

  const stats = {
    totalTests: tests.length,
    publishedTests: tests.filter((t) => t.status === "published").length,
    totalAssignments: assignments.length,
    completedAssignments: assignments.filter((a) => a.status === "completed").length,
  };

  const recentTests = tests.slice(0, 3);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your assessments today.
          </p>
        </div>
        <Button asChild variant="gradient" size="lg">
          <Link to="/tests/create">
            <Plus className="mr-2 h-5 w-5" />
            Create Test
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Tests"
          value={stats.totalTests}
          icon={FileText}
          description={`${stats.publishedTests} published`}
        />
        <StatsCard
          title="Assignments"
          value={stats.totalAssignments}
          icon={Users}
          description="Active assignments"
        />
        <StatsCard
          title="Completed"
          value={stats.completedAssignments}
          icon={CheckCircle}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Pending"
          value={stats.totalAssignments - stats.completedAssignments}
          icon={Clock}
          description="Awaiting completion"
        />
      </div>

      {/* Recent Tests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Recent Tests</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/tests">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentTests.map((test) => (
            <TestCard key={test.id} test={test} />
          ))}
        </div>

        {tests.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No tests yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first test
            </p>
            <Button asChild>
              <Link to="/tests/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Test
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to="/tests/create"
          className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Create New Test</h3>
              <p className="text-sm text-muted-foreground">Build a new assessment</p>
            </div>
          </div>
        </Link>

        <Link
          to="/assignments"
          className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Manage Assignments</h3>
              <p className="text-sm text-muted-foreground">View and assign tests</p>
            </div>
          </div>
        </Link>

        <Link
          to="/reports"
          className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">View Reports</h3>
              <p className="text-sm text-muted-foreground">Check candidate results</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
